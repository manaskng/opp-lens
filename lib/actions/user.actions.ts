"use server";

import User from "@/database/user.model";
import connectDB from "@/lib/mongodb";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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