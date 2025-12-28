"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setIsLoading(false);
    } else {
      router.push("/");
      router.refresh(); 
    }
  };

  return (
    <div className="glass p-8 border border-dark-200 rounded-2xl shadow-2xl">
      <div className="flex flex-col items-center gap-2 mb-8">
        <Image src="/icons/logo.png" alt="logo" width={40} height={40} />
        <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
        <p className="text-light-200 text-sm">Sign in to manage your events</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm">{error}</div>}
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-light-100">Email Address</label>
          <input 
            name="email" 
            type="email" 
            required 
            className="bg-dark-200 border border-border-dark rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="john@example.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-light-100">Password</label>
          <input 
            name="password" 
            type="password" 
            required 
            className="bg-dark-200 border border-border-dark rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="mt-2 bg-primary hover:bg-primary/80 text-dark-100 font-bold py-3 rounded-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Log In"}
        </button>
      </form>

      <p className="mt-6 text-center text-light-200 text-sm">
        Don't have an account? <Link href="/register" className="text-primary hover:underline">Sign up</Link>
      </p>
    </div>
  );
}