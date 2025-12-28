"use server";

import Booking from '@/database/booking.model';
import Event from '@/database/event.model'; // Must import to populate!
import connectDB from "@/lib/mongodb";
import { auth } from "@/auth";

export const getBookingsByUser = async () => {
    try {
        const session = await auth();
        if (!session || !session.user) return [];

        await connectDB();

        // Find bookings where email matches the logged-in user
        const bookings = await Booking.find({ email: session.user.email })
            .populate({
                path: 'eventId',
                model: Event,
                select: 'title image location date time slug' // Only fetch what we display
            })
            .sort({ createdAt: -1 }) // Newest first
            .lean(); // Convert Mongoose objects to plain JS objects

        return bookings;
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return [];
    }
}

export const createBooking = async ({ eventId, slug, email }: { eventId: string; slug: string; email: string; }) => {
    // ... (Your existing createBooking code remains unchanged)
    try {
       await connectDB();
       await Booking.create({ eventId, slug, email });
       return { success: true };
    } catch (e) {
       console.error('create booking failed', e);
       return { success: false };
    }
}