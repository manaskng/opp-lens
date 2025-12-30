"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import { Search } from "lucide-react"; 

export default function SearchForm() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

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
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, router, searchParams]);

  return (
    <div className="relative w-full max-w-2xl mx-auto mt-8 z-20">
      <div className="relative flex items-center w-full h-14 rounded-full focus-within:shadow-[0_0_20px_rgba(89,222,202,0.2)] bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden group transition-all duration-300 focus-within:border-primary/50 focus-within:bg-white/10">
        <div className="grid place-items-center h-full w-12 text-gray-400 group-focus-within:text-primary transition-colors">
           {/* REPLACED IMAGE WITH ICON */}
           <Search size={20} />
        </div>

        <input
          className="peer h-full w-full outline-none text-sm text-white bg-transparent pr-4 placeholder-gray-500 font-schibsted-grotesk"
          type="text"
          id="search"
          placeholder="Search events, topics, or locations..."
          onChange={(e) => setSearch(e.target.value)}
          defaultValue={searchParams.get("query") || ""}
        />
      </div>
    </div>
  );
}