"use client";

import { createEvent } from "@/lib/actions/event.actions";
import { ImagePlus, Calendar, List, AlertCircle, Users } from "lucide-react"; // Added Users icon
import { useState } from "react";
import { useRouter } from "next/navigation";

const input = "w-full bg-dark-200 border border-border-dark rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-primary outline-none transition";
const label = "text-sm font-medium text-light-100 mb-2 block";

export default function CreateEventPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("image") as File;

    if (file && file.size > 4 * 1024 * 1024) { 
        setError("File size exceeds 4MB. Please upload a smaller image.");
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return; 
    }

    const result = await createEvent(formData);

    if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
        router.push("/"); 
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-14">
      
      {/* Header */}
      <div className="mb-14 text-center">
        <span className="inline-block mb-4 px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          Host an Event
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Create Your Event
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Share knowledge, build community, and bring developers together.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex items-center gap-3 text-red-400 animate-pulse">
            <AlertCircle size={20} />
            <p className="font-semibold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-14">
        
        {/* SECTION: STORY */}
        <div className="glass rounded-2xl border border-dark-200 p-8 space-y-6">
          <h3 className="text-xl font-bold text-white">Event Story</h3>

          <div>
            <label className={label}>Event Title</label>
            <input name="title" required className={input} placeholder="React Summit 2025" />
          </div>

          <div>
            <label className={label}>Short Description</label>
            <textarea name="description" rows={3} required className={input} placeholder="A high-impact conference..." />
          </div>

          <div>
            <label className={label}>Detailed Overview</label>
            <textarea name="overview" rows={6} required className={input} placeholder="What will attendees learn? Who is this for?" />
          </div>
        </div>

        {/* SECTION: IMAGE */}
        <div className={`glass rounded-2xl border p-8 space-y-4 transition-colors ${error.includes("File size") ? "border-red-500/50 bg-red-500/5" : "border-dark-200"}`}>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ImagePlus size={20} /> Event Cover
          </h3>

          <label className="group relative flex flex-col items-center justify-center border-2 border-dashed border-border-dark rounded-2xl p-10 cursor-pointer hover:border-primary transition">
            <ImagePlus className="text-gray-400 mb-3 group-hover:text-primary" size={32} />
            <p className="text-sm text-gray-400">Click to upload or drag & drop</p>
            <p className="text-xs text-yellow-500/80 mt-2 font-mono font-medium bg-yellow-500/10 px-2 py-1 rounded">⚠️ STRICT LIMIT: Max 4MB</p>

            <input
              type="file"
              name="image"
              accept="image/*"
              required
              className="hidden"
              onChange={(e) => {
                  if (e.target.files?.[0]?.size! > 4 * 1024 * 1024) {
                      setError("File too large! Must be under 4MB.");
                  } else {
                      setError("");
                  }
              }}
            />
          </label>
        </div>

        {/* SECTION: LOGISTICS */}
        <div className="glass rounded-2xl border border-dark-200 p-8 space-y-8">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar size={20} /> Logistics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={label}>Date</label>
              <input type="date" name="date" required className={input} />
            </div>

            <div>
              <label className={label}>Time</label>
              <input type="time" name="time" required className={input} />
            </div>

            <div>
              <label className={label}>Mode</label>
              <select name="mode" className={input}>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* --- NEW CAPACITY INPUT --- */}
            <div>
              <label className={label}>Total Capacity</label>
              <div className="relative">
                  <Users className="absolute left-3 top-3.5 text-gray-500" size={18} />
                  <input 
                    name="capacity" 
                    type="number" 
                    min="1" 
                    defaultValue="50" 
                    required 
                    className={`${input} pl-10`} 
                    placeholder="50" 
                  />
              </div>
            </div>

            <div>
              <label className={label}>Target Audience</label>
              <input name="audience" required className={input} placeholder="Students, Senior Devs" />
            </div>

            <div>
              <label className={label}>City / Region</label>
              <input name="location" required className={input} placeholder="San Francisco, CA" />
            </div>

            <div className="md:col-span-2">
              <label className={label}>Venue</label>
              <input name="venue" required className={input} placeholder="Moscone Center" />
            </div>
          </div>
        </div>

        {/* SECTION: CONTENT */}
        <div className="glass rounded-2xl border border-dark-200 p-8 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <List size={20} /> Agenda & Tags
          </h3>

          <div>
            <label className={label}>Agenda (one per line)</label>
            <textarea name="agenda" rows={5} required className={input} placeholder="09:00 – Opening Keynote&#10;10:00 – Advanced React Patterns" />
          </div>

          <div>
            <label className={label}>Tags</label>
            <input name="tags" required className={input} placeholder="React, Next.js, AI" />
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(89,222,202,0.35)] 
                ${isLoading ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-primary text-black hover:bg-primary/90 hover:scale-[1.02]"}`}
          >
            {isLoading ? "Publishing..." : "Publish Event 🚀"}
          </button>
        </div>
      </form>
    </section>
  );
}