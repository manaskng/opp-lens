import React from 'react'
import { notFound } from "next/navigation";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import { cacheLife } from "next/cache";
import { auth } from "@/auth"; 
import EventDetailsAnimated from "./EventDetailsAnimated";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import { sanitizeData } from "@/lib/utils";

// --- 1. SEPARATE THE CACHED LOGIC ---
async function getCachedEvent(slug: string) {
    'use cache' 
    cacheLife('hours');

    try {
        await connectDB();
        
        // Fetch raw event
        const event = await Event.findOne({ slug }).lean();
        
        if (!event) return null;
        
        // Sanitize (Convert ObjectId to string)
        return sanitizeData(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        return null;
    }
}

// --- 2. MAIN COMPONENT ---
const EventDetails = async ({ params }: { params: Promise<string> }) => {
    // Parallel fetching of params and session
    const [slug, session] = await Promise.all([
        params,
        auth()
    ]);

    // Call the cached DB query
    const event = await getCachedEvent(slug);

    if (!event) return notFound();

    const similarEvents = await getSimilarEventsBySlug(slug);
    
    // Check Ownership (Safe check even if user is not logged in)
    const isOwner = session?.user?.email === event.organizer;

    return (
        <EventDetailsAnimated 
            event={event}
            similarEvents={similarEvents}
            bookingsCount={10} 
            isOwner={isOwner || false}
        />
    )
}

export default EventDetails;