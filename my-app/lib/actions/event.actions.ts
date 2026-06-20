"use server";

import Event from '@/database/event.model';
import User from '@/database/user.model';
import Booking from '@/database/booking.model';
import connectDB from "@/lib/mongodb";
import { auth } from "@/auth";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sanitizeData } from "@/lib/utils"; 

cloudinary.config({
  secure: true,
});

// --- CREATE EVENT ---
export const createEvent = async (formData: FormData) => {
    try {
        const session = await auth();
        if (!session || !session.user) return { error: "Unauthorized" };

        await connectDB();

        // Handle Image Upload
        const imageFile = formData.get("image") as File;
        let imageUrl = "";

        if (imageFile && imageFile.size > 0) {
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);
            
            // Upload to Cloudinary
            const uploadResult: any = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "DevEventSync" },
                    (error, result) => {
                        if (error) {
                            console.error("Cloudinary Upload Error:", error);
                            reject(error);
                        } else resolve(result);
                    }
                ).end(buffer);
            });
            imageUrl = uploadResult.secure_url;
        } else {
             return { error: "Image is required" };
        }

        // Parse Complex Fields
        const tagsString = formData.get("tags") as string;
        const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

        const agendaString = formData.get("agenda") as string;
        const agenda = agendaString ? agendaString.split('\n').map(item => item.trim()).filter(item => item.length > 0) : [];

        // Create Event
        await Event.create({
            title: formData.get("title"),
            description: formData.get("description"),
            overview: formData.get("overview"),
            location: formData.get("location"),
            venue: formData.get("venue"),
            date: formData.get("date"),
            time: formData.get("time"),
            mode: formData.get("mode"),
            audience: formData.get("audience"),
            organizer: session.user.email, // Securely link to logged-in user
            image: imageUrl,
            tags: tags,
            agenda: agenda,
            // --- CAPACITY FIELDS ---
            capacity: Number(formData.get("capacity")) || 50,
            seatsTaken: 0,
            // --- ML RECOMMENDATION FIELDS ---
            category: formData.get("category") || "general",
            difficulty: formData.get("difficulty") || "intermediate",
            // Auto-generate slug
            slug: (formData.get("title") as string).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
        });

        revalidatePath("/");
    } catch (error) {
        console.error("Create Event Error:", error);
        return { error: "Failed to create event" };
    }
    
    redirect("/");
}

// --- DELETE EVENT ---
export const deleteEvent = async (slug: string) => {
    try {
        const session = await auth();
        if (!session || !session.user) return { error: "Unauthorized" };

        await connectDB();
        
        const event = await Event.findOne({ slug });
        if (!event) return { error: "Event not found" };

        if (event.organizer !== session.user.email) {
            return { error: "You are not authorized to delete this event" };
        }

        await Event.deleteOne({ slug });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Delete Error:", error);
        return { error: "Failed to delete event" };
    }
}

// --- GET SIMILAR EVENTS ---
export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectDB();
        const event = await Event.findOne({ slug });
        if(!event) return [];
        
        return await Event.find({ 
            _id: { $ne: event._id }, 
            tags: { $in: event.tags } 
        })
        .limit(3)
        .lean();
    } catch {
        return [];
    }
}

export const getAllEvents = async ({ query, limit = 6, page = 1 }: { query?: string; limit?: number; page?: number }) => {
    try {
        await connectDB();

        // Search by Title OR Description
        const titleCondition = query 
            ? { 
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ]
              } 
            : {};

        const skipAmount = (page - 1) * limit;

        const events = await Event.find(titleCondition)
            .sort({ createdAt: -1 }) // Newest first
            .skip(skipAmount)
            .limit(limit)
            .lean();

        return JSON.parse(JSON.stringify(events));
    } catch (error) {
        console.error(error);
        return [];
    }
}

// SMART FETCH: Events happening soon
export const getUpcomingEvents = async (limit = 5) => {
    try {
        await connectDB();
        
        const today = new Date();
        today.setHours(0,0,0,0);
        const events = await Event.find({ 
            date: { $gte: today.toISOString().split('T')[0] } 
        })
        .sort({ date: 1 }) 
        .limit(limit)
        .lean();

        return sanitizeData(events);
    } catch (error) {
        console.error("Fetch Upcoming Error:", error);
        return [];
    }
}

// SMART FETCH: Recommended based on Topic 
export const getRecommendedEvents = async ({ topic, limit = 3 }: { topic: string, limit?: number }) => {
    try {
        await connectDB();
        
        // Logic: Search tags or title for the topic, excluding past events if possible
        const regex = new RegExp(topic, 'i');
        
        const events = await Event.find({
            $or: [
                { tags: { $in: [regex] } },
                { title: { $regex: regex } },
                { category: { $regex: regex } }
            ]
        })
        .sort({ createdAt: -1 }) // Newest additions first
        .limit(limit)
        .lean();

        return sanitizeData(events);
    } catch (error) {
        console.error("Fetch Recommended Error:", error);
        return [];
    }
}

// --- ML-POWERED RECOMMENDATIONS ---
export type RecommendedEvent = {
    event: any;
    score: number;
    reason: string;
};

export const getMLRecommendedEvents = async (
    userEmail: string,
    limit: number = 6
): Promise<{ events: RecommendedEvent[]; isMLPowered: boolean }> => {
    try {
        await connectDB();

        // 1. Fetch user profile
        const user = await User.findOne({ email: userEmail }).lean();
        if (!user) {
            return { events: [], isMLPowered: false };
        }

        // 2. Fetch all upcoming events
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcomingEvents = await Event.find({
            date: { $gte: today.toISOString().split("T")[0] },
        })
            .sort({ date: 1 })
            .lean();

        if (upcomingEvents.length === 0) {
            return { events: [], isMLPowered: false };
        }

        // 3. Fetch all bookings (for collaborative filtering)
        const allBookings = await Booking.find({})
            .select("email eventId")
            .lean();

        // 4. Prepare data for ML service
        const sanitizedEvents = JSON.parse(JSON.stringify(upcomingEvents));
        const sanitizedBookings = JSON.parse(JSON.stringify(allBookings));

        const userProfile = {
            email: (user as any).email,
            interests: (user as any).interests || [],
            preferredCategories: (user as any).preferredCategories || [],
            preferredMode: (user as any).preferredMode || "any",
            skillLevel: (user as any).skillLevel || "intermediate",
            bio: (user as any).bio || "",
        };

        // 5. Call the Python ML Microservice
        const ML_URL =
            process.env.RECOMMENDATION_SERVICE_URL || "http://localhost:8000";

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

        try {
            const response = await fetch(`${ML_URL}/recommend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_profile: userProfile,
                    events: sanitizedEvents.map((e: any) => ({
                        _id: e._id.toString ? e._id.toString() : e._id,
                        title: e.title || "",
                        tags: e.tags || [],
                        description: e.description || "",
                        overview: e.overview || "",
                        category: e.category || "general",
                        difficulty: e.difficulty || "intermediate",
                        audience: e.audience || "",
                        mode: e.mode || "offline",
                        date: e.date || "",
                        seatsTaken: e.seatsTaken || 0,
                        capacity: e.capacity || 50,
                    })),
                    all_bookings: sanitizedBookings.map((b: any) => ({
                        email: b.email,
                        eventId: b.eventId?.toString
                            ? b.eventId.toString()
                            : b.eventId,
                    })),
                    limit,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`ML service returned ${response.status}`);
            }

            const data = await response.json();

            // 6. Map recommended event IDs back to full event objects
            const eventMap = new Map(
                sanitizedEvents.map((e: any) => [
                    e._id?.toString ? e._id.toString() : e._id,
                    e,
                ])
            );

            const recommended: RecommendedEvent[] = (
                data.recommendations || []
            )
                .map((rec: any) => {
                    const event = eventMap.get(rec.event_id);
                    if (!event) return null;
                    return {
                        event,
                        score: rec.score,
                        reason: rec.reason,
                    };
                })
                .filter(Boolean);

            return { events: recommended, isMLPowered: true };
        } catch (fetchError) {
            clearTimeout(timeout);
            console.warn(
                "ML service unavailable, falling back to rule-based:",
                fetchError instanceof Error
                    ? fetchError.message
                    : fetchError
            );
            // Fall through to fallback below
        }

        // FALLBACK: Use existing regex-based recommendations
        const userInterests = (user as any).interests || [];
        const fallbackTopic =
            userInterests.length > 0 ? userInterests[0] : "Tech";
        const fallbackEvents = await getRecommendedEvents({
            topic: fallbackTopic,
            limit,
        });

        return {
            events: fallbackEvents.map((e: any) => ({
                event: e,
                score: 0,
                reason: "Based on your interests",
            })),
            isMLPowered: false,
        };
    } catch (error) {
        console.warn("ML Recommendation Error:", error instanceof Error ? error.message : String(error));
        return { events: [], isMLPowered: false };
    }
};

// --- UPDATE EVENT (With Capacity Safety) ---
export const updateEvent = async (slug: string, formData: FormData) => {
    try {
        const session = await auth();
        if (!session || !session.user) return { error: "Unauthorized" };

        await connectDB();
        const event = await Event.findOne({ slug });

        if (!event) return { error: "Event not found" };
        
        // SECURITY: Verify Ownership
        if (event.organizer !== session.user.email) {
            return { error: "You are not authorized to edit this event" };
        }

        // --- NEW SAFETY CHECK: CAPACITY ---
        const newCapacity = Number(formData.get("capacity"));
        const currentSeatsTaken = event.seatsTaken || 0;

        if (newCapacity < currentSeatsTaken) {
            return { error: `Cannot reduce capacity to ${newCapacity}. You already have ${currentSeatsTaken} bookings.` };
        }
        // ----------------------------------

        // 1. Handle Image Logic (Keep old one if no new file)
        const imageFile = formData.get("image") as File;
        let imageUrl = event.image; // Default to existing image

        if (imageFile && imageFile.size > 0) {
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);
            
            const uploadResult: any = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "DevEventSync" },
                    (error, result) => {
                        if (error) {
                            console.error("Cloudinary Upload Error:", error);
                            reject(error);
                        } else resolve(result);
                    }
                ).end(buffer);
            });
            imageUrl = uploadResult.secure_url;
        }

        // Parse Arrays
        const tagsString = formData.get("tags") as string;
        const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(t => t) : event.tags;

        const agendaString = formData.get("agenda") as string;
        const agenda = agendaString ? agendaString.split('\n').map(item => item.trim()).filter(i => i) : event.agenda;

        // Update Fields
        event.title = formData.get("title") || event.title;
        event.description = formData.get("description") || event.description;
        event.overview = formData.get("overview") || event.overview;
        event.location = formData.get("location") || event.location;
        event.venue = formData.get("venue") || event.venue;
        event.date = formData.get("date") || event.date;
        event.time = formData.get("time") || event.time;
        event.mode = formData.get("mode") || event.mode;
        event.audience = formData.get("audience") || event.audience;
        event.capacity = newCapacity; // <--- Save Validated Capacity
        event.image = imageUrl;
        event.tags = tags;
        event.agenda = agenda;
        // --- ML RECOMMENDATION FIELDS ---
        event.category = formData.get("category") || event.category || "general";
        event.difficulty = formData.get("difficulty") || event.difficulty || "intermediate";

        await event.save();
        
        revalidatePath(`/events/${slug}`);
        revalidatePath("/");
        
        return { success: true };
    } catch (error) {
        console.error("Update Error:", error);
        return { error: "Update failed" };
    }
}