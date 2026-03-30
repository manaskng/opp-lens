"use server";

import Booking from '@/database/booking.model';
import Event from '@/database/event.model'; 
import connectDB from "@/lib/mongodb";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

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
                select: 'title image location date time slug mode' // Added 'mode'
            })
            .sort({ createdAt: -1 }) // Newest first
            .lean(); // Convert Mongoose objects to plain JS objects

        return JSON.parse(JSON.stringify(bookings));
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return [];
    }
}

export const createBooking = async ({ eventId, slug, email }: { eventId: string; slug: string; email: string; }) => {
    try {
       await connectDB();
       
       //  ATOMIC CONCURRENCY CHECK 
       const updatedEvent = await Event.findOneAndUpdate(
           { 
               _id: eventId, 
               $expr: { $lt: ["$seatsTaken", "$capacity"] } // Condition: Seats < Capacity
           },
           { 
               $inc: { seatsTaken: 1 } // Atomic Update: Add 1
           },
           { new: true }
       );

       //  CHECK IF SOLD OUT
       if (!updatedEvent) {
           return { error: "SOLD OUT! The last ticket was just taken." };
       }

       //  Create the Booking Record (Now safe to do)
       await Booking.create({ eventId, slug, email });
       
       //  Update UI
       revalidatePath(`/events/${slug}`);
       revalidatePath("/profile");
       
       return { success: true };

    } catch (e: any) {
       console.error('create booking failed', e);
       // Handle duplicate booking error from MongoDB index (uniq_event_email)
       if (e.code === 11000) {
           return { error: "You have already booked this event." };
       }
       return { error: "Booking failed. Please try again." };
    }
}

//  CANCEL BOOKING 
export async function deleteBooking(bookingId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    await connectDB();

    //  Find the booking to get eventId and userId
    const booking = await Booking.findById(bookingId);
    if (!booking) return { error: "Booking not found" };

    // Security: Ensure the logged-in user owns this booking
    // (We assume you store email or userId in booking)
    if (booking.email !== session.user.email) {
       return { error: "You can only cancel your own bookings" };
    }

    //  DELETE BOOKING
    await Booking.findByIdAndDelete(bookingId);

    //  ATOMIC DECREMENT (Free up the seat)
    // We decrease seatsTaken by 1. We don't need to check capacity here.
    await Event.findByIdAndUpdate(booking.eventId, {
       $inc: { seatsTaken: -1 } 
    });

    //  UPDATE USER (Remove from their list)
    // Assuming we store userId in the booking or we look up user by email
    const user = await User.findOne({ email: session.user.email });
    if (user) {
        await User.findByIdAndUpdate(user._id, {
            $pull: { bookings: bookingId }
        });
    }

    // 5. Revalidate
    revalidatePath("/profile");
    revalidatePath(`/events/${booking.eventId}`);

    return { success: true };

  } catch (error) {
    console.error("Cancel Error:", error);
    return { error: "Failed to cancel booking" };
  }
}