"use server";

import User from "@/database/user.model";
import Booking from "@/database/booking.model"; 
import Event from "@/database/event.model";     
import connectDB from "@/lib/mongodb";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "bcryptjs";

// --- NEW FUNCTION FOR DASHBOARD ---
export async function getUserDashboardData() {
    const session = await auth();
    if (!session?.user?.email) return { attending: [], hosting: [] };

    try {
        await connectDB();
        
        // 1. Fetch "Attending" (Events I booked)
        const bookings = await Booking.find({ email: session.user.email })
            .populate({
                path: 'eventId',
                model: Event,
                select: 'title image location date time slug mode seatsTaken capacity'
            })
            .sort({ createdAt: -1 })
            .lean();

        // 2. Fetch "Hosting" (Events I organized)
        // Note: Assuming 'organizer' field in Event stores the user's email
        const hostedEvents = await Event.find({ organizer: session.user.email })
            .sort({ date: 1 }) // Soonest first
            .lean();

        return {
            attending: JSON.parse(JSON.stringify(bookings)),
            hosting: JSON.parse(JSON.stringify(hostedEvents))
        };
    } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        return { attending: [], hosting: [] };
    }
}
// ----------------------------------

export async function getUserOnboarding() {
    const session = await auth();
    if (!session?.user?.email) return null;

    await connectDB();
    const user = await User.findOneAndUpdate(
        { email: session.user.email },
        { 
            name: session.user.name, 
            image: session.user.image 
        },
        { new: true, upsert: true }
    ).lean();

    return JSON.parse(JSON.stringify(user));
}

export async function updateUser(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  await connectDB();

  // Get existing fields
  const bio = formData.get("bio") as string;
  const location = formData.get("location") as string;
  
  // --- NEW FIELDS ---
  const portfolio = formData.get("portfolio") as string;
  const github = formData.get("github") as string;
  const institution = formData.get("institution") as string;

  // Process Interests
  const interestsString = formData.get("interests") as string;
  const interests = interestsString 
    ? interestsString.split(",").map((i) => i.trim()).filter((i) => i.length > 0)
    : [];

  try {
    await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        bio, 
        location, 
        interests,
        // Save new fields
        portfolio,
        github,
        institution
      },
      { new: true }
    );

    revalidatePath("/profile");
    revalidatePath("/"); 
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update profile" };
  }
}

export async function registerUser(userData: { name: string; email: string; password?: string }) {
  try {
    await connectDB();

    const { name, email, password } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "User already exists" };
    }

    // 2. Hash Password 
    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await hash(password, 10);
    }

    // 3. Create User
    await User.create({
      name,
      email,
      password: hashedPassword,
      image: `https://ui-avatars.com/api/?name=${name}&background=random`, // Default avatar
      role: "user",
    });

    return { success: true };
  } catch (error) {
    console.error("Registration Error:", error);
    return { error: "Failed to register user" };
  }
}