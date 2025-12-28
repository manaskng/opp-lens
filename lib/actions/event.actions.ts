"use server";

import Event from '@/database/event.model';
import connectDB from "@/lib/mongodb";
import { auth } from "@/auth";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


cloudinary.config({
  secure: true,
});

// --- 1. CREATE EVENT ---
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
        // Handle "Tag1, Tag2" input
        const tagsString = formData.get("tags") as string;
        const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

        // Handle "Agenda Item 1 \n Agenda Item 2" input
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

// --- 2. DELETE EVENT ---
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

// --- 3. GET SIMILAR EVENTS ---
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

        // 2. Parse Arrays
        const tagsString = formData.get("tags") as string;
        const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(t => t) : event.tags;

        const agendaString = formData.get("agenda") as string;
        const agenda = agendaString ? agendaString.split('\n').map(item => item.trim()).filter(i => i) : event.agenda;

        // 3. Update Fields
        event.title = formData.get("title") || event.title;
        event.description = formData.get("description") || event.description;
        event.overview = formData.get("overview") || event.overview;
        event.location = formData.get("location") || event.location;
        event.venue = formData.get("venue") || event.venue;
        event.date = formData.get("date") || event.date;
        event.time = formData.get("time") || event.time;
        event.mode = formData.get("mode") || event.mode;
        event.audience = formData.get("audience") || event.audience;
        event.image = imageUrl;
        event.tags = tags;
        event.agenda = agenda;

        await event.save();
        
        revalidatePath(`/events/${slug}`);
        revalidatePath("/");
        
        return { success: true };
    } catch (error) {
        console.error("Update Error:", error);
        return { error: "Update failed" };
    }
}