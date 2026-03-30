"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/actions/user.actions";
import Image from "next/image";
import SocialAuthForm from "@/components/SocialAuthForm"; // <--- Import Social Buttons

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await registerUser({ name, email, password });

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push("/login"); 
    }
  };

  return (
    <div className="glass p-8 border border-dark-200 rounded-2xl shadow-2xl w-full max-w-md">
      <div className="flex flex-col items-center gap-2 mb-8">
        <Image src="/icons/logo.png" alt="logo" width={40} height={40} />
        <h1 className="text-2xl font-bold text-white">Create Account</h1>
        <p className="text-light-200 text-sm">Join the developer events hub</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm">{error}</div>}
        
        {/* Username */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-light-100">Username</label>
          <input 
            name="name" 
            type="text" 
            required 
            className="bg-dark-200 border border-border-dark rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-600"
            placeholder="johndoe"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-light-100">Email Address</label>
          <input 
            name="email" 
            type="email" 
            required 
            className="bg-dark-200 border border-border-dark rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-600"
            placeholder="john@example.com"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-light-100">Password</label>
          <input 
            name="password" 
            type="password" 
            required 
            className="bg-dark-200 border border-border-dark rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-600"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="mt-2 bg-primary hover:bg-primary/80 text-dark-100 font-bold py-3 rounded-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      {/* --- SOCIAL LOGIN SECTION --- */}
      <SocialAuthForm />

      <p className="mt-6 text-center text-light-200 text-sm">
        Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link>
      </p>
    </div>
  );
}