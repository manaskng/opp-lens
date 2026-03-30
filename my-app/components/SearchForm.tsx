"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import { Search, X, Loader2, Command } from "lucide-react"; 

export default function SearchForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [search, setSearch] = useState(searchParams.get("query") || "");
  const [isTyping, setIsTyping] = useState(false);

  //  Handle Input (Triggers Loading)
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setIsTyping(true); // <--- Turn ON here, only when user types
  };

  // Handle Debounce (Triggers Sync & Turn Off)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      let newUrl = "";
      
      if (search) {
        newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: search,
        });
      } else {
        newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ["query"],
        });
      }
      
      router.push(newUrl, { scroll: false });
      
      // Stop loading ONLY after the debounce finishes
      setIsTyping(false); 
      
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [search, router, searchParams]); // searchParams dependency is now safe because we removed setIsTyping(true) from here

  return (
    <div className="relative w-full max-w-2xl mx-auto mt-8 z-20 group">
      
      {/* GLOW EFFECT */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-full blur opacity-20 group-focus-within:opacity-100 transition duration-500 will-change-transform"></div>
      
      <div className="relative flex items-center w-full h-14 rounded-full bg-[#0B0F17]/80 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 focus-within:border-primary/50 focus-within:bg-dark-100">
        
        {/* ICON LEFT */}
        <div className="grid place-items-center h-full w-14 text-gray-500 group-focus-within:text-primary transition-colors">
           <Search size={20} />
        </div>

        {/* INPUT */}
        <input
          className="peer h-full w-full outline-none text-base text-white bg-transparent pr-14 placeholder:text-gray-500 font-medium"
          type="text"
          id="search"
          placeholder="Search for events, tech stacks, or cities..."
          value={search}
          onChange={handleInput} // <--- Use the new handler
          autoComplete="off"
        />

        {/* ACTION ICON RIGHT */}
        <div className="absolute right-4 flex items-center justify-center">
            {isTyping ? (
                <Loader2 size={18} className="text-primary animate-spin" />
            ) : search ? (
                <button 
                    onClick={() => {
                        setSearch("");
                        setIsTyping(true); // Trigger loading on clear too
                    }}
                    className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                    title="Clear search"
                >
                    <X size={16} />
                </button>
            ) : (
                <div className="pointer-events-none hidden sm:flex items-center gap-1 border border-white/10 bg-white/5 px-2 py-1 rounded text-[10px] text-gray-500 font-mono">
                    <Command size={10} /> K
                </div>
            )}
        </div>
      </div>
    </div>
  );
}