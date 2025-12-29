"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import React from "react";

const SocialAuthForm = () => {
  const handleSocialLogin = async (provider: "github" | "google") => {
    await signIn(provider, { 
      callbackUrl: "/",
      redirect: true, 
    });
  };

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="relative flex items-center justify-center mb-2">
        <div className="h-[1px] w-full bg-white/10"></div>
        <span className="absolute bg-dark-100 px-3 text-xs text-gray-500 uppercase">Or continue with</span>
      </div>

      <div className="flex gap-4">
        <button
          className="flex-1 flex items-center justify-center gap-2 bg-dark-200 border border-white/10 hover:bg-white/5 py-3 rounded-lg text-white transition-all group"
          onClick={() => handleSocialLogin("github")}
        >
          <Image
            src="/icons/github.svg" 
            alt="github"
            width={20}
            height={20}
            className="invert group-hover:scale-110 transition-transform"
          />
          <span className="text-sm font-medium">GitHub</span>
        </button>

        <button
          className="flex-1 flex items-center justify-center gap-2 bg-dark-200 border border-white/10 hover:bg-white/5 py-3 rounded-lg text-white transition-all group"
          onClick={() => handleSocialLogin("google")}
        >
          <Image
            src="/icons/google.svg" 
            alt="google"
            width={20}
            height={20}
            className="group-hover:scale-110 transition-transform"
          />
          <span className="text-sm font-medium">Google</span>
        </button>
      </div>
    </div>
  );
};

export default SocialAuthForm;