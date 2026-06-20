"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import { Search, SlidersHorizontal, X } from "lucide-react";

const CATEGORIES = ["hackathon", "competition", "contest", "hiring-challenge"];
const TAGS = ["AI/ML", "Web Dev", "Blockchain", "Mobile", "DevOps", "Design", "Data Science"];

export default function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      let newUrl = "";
      if (query) {
        newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: query,
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
  }, [query, searchParams, router]);

  const handleCategoryChange = (cat: string) => {
    const currentCat = searchParams.get("category");
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "category",
      value: currentCat === cat ? null : cat,
    });
    router.push(newUrl, { scroll: false });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = searchParams.get("tags")?.split(",") || [];
    let newTags;
    if (currentTags.includes(tag)) {
      newTags = currentTags.filter((t) => t !== tag);
    } else {
      newTags = [...currentTags, tag];
    }

    let newUrl = "";
    if (newTags.length > 0) {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "tags",
        value: newTags.join(","),
      });
    } else {
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ["tags"],
      });
    }
    router.push(newUrl, { scroll: false });
  };

  const clearAll = () => {
    setQuery("");
    router.push("/opportunities", { scroll: false });
  };

  const activeCategory = searchParams.get("category");
  const activeTags = searchParams.get("tags")?.split(",") || [];

  const hasFilters = query || activeCategory || activeTags.length > 0;

  return (
    <div className="bg-dark-200 border border-white/10 rounded-2xl p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <SlidersHorizontal size={20} className="text-primary" />
          Filters
        </h3>
        {hasFilters && (
          <button 
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
          >
            Clear <X size={12} />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search opportunities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-dark-300 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Type</h4>
          <div className="flex flex-col gap-2">
            {CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${activeCategory === cat ? 'bg-primary border-primary' : 'border-gray-500 group-hover:border-primary/50'}`}>
                  {activeCategory === cat && <div className="w-2 h-2 bg-dark-200 rounded-sm" />}
                </div>
                <span className={`text-sm capitalize transition-colors ${activeCategory === cat ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                  {cat.replace("-", " ")}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Technologies</h4>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => {
              const isActive = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    isActive 
                      ? 'bg-primary/20 border-primary text-primary font-medium' 
                      : 'bg-dark-300 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
