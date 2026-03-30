import React from 'react'
import { notFound } from "next/navigation";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import { cacheLife } from "next/cache";
import { auth } from "@/auth"; 
import EventDetailsAnimated from "./EventDetailsAnimated";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import Booking from "@/database/booking.model"; 
import { sanitizeData } from "@/lib/utils";

// --- SEPARATE THE CACHED LOGIC ---
async function getCachedEvent(slug: string) {
    'use cache' 
    cacheLife('hours');

    try {
        await connectDB();
        const event = await Event.findOne({ slug }).lean();
        if (!event) return null;
        return sanitizeData(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        return null;
    }
}

// --- MAIN COMPONENT ---
const EventDetails = async ({ params }: { params: Promise<string> }) => {
    const [slug, session] = await Promise.all([
        params,
        auth()
    ]);

    const event = await getCachedEvent(slug);

    if (!event) return notFound();

    // Parallel fetch: Similar Events + Booking Status
    const similarEventsPromise = getSimilarEventsBySlug(slug);
    
    // Check if user has already booked this event
    let bookingId = null;
    if (session?.user?.email) {
        await connectDB();
        const booking = await Booking.findOne({ 
            eventId: event._id, 
            email: session.user.email 
        }).select('_id');
        
        if (booking) {
            bookingId = booking._id.toString();
        }
    }

    const similarEvents = await similarEventsPromise;
    
    // --- SMART LOGIC ---
    const isOwner = session?.user?.email === event.organizer;
    
    // Capacity Math
    const capacity = event.capacity || 50; 
    const seatsTaken = event.seatsTaken || 0;
    const isSoldOut = seatsTaken >= capacity;
    const spotsLeft = Math.max(0, capacity - seatsTaken); // Prevent negative numbers
    const percentFull = Math.min(100, Math.round((seatsTaken / capacity) * 100));

    return (
        <EventDetailsAnimated 
            event={event}
            similarEvents={similarEvents}
            isOwner={isOwner || false}
            // Passing calculated props
            isSoldOut={isSoldOut}
            spotsLeft={spotsLeft}
            percentFull={percentFull}
            currentUserEmail={session?.user?.email || ""}
            currentUserId={session?.user?.id || ""}
            bookingId={bookingId} 
        />
    )
}

export default EventDetails;