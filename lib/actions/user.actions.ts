"use server";

import User from "@/database/user.model";
import connectDB from "@/lib/mongodb";
import { hash } from "bcryptjs";

export async function registerUser(params: any) {
  try {
    await connectDB();
    
    const { name, email, password } = params;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return { error: "User already exists with this email." };
    }
    const hashedPassword = await hash(password, 10);
    await User.create({
      name,      // This will serve as the "Username"
      email,
      password: hashedPassword,
      role: "USER" 
    });

    return { success: true };
  } catch (error) {
    console.error("Registration Error:", error);
    return { error: "Something went wrong while registering." };
  }
}