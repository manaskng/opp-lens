"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateEvent } from "@/lib/actions/event.actions";
import { AlertCircle, ImagePlus, Save, Users } from "lucide-react"; 

interface EditEventFormProps {
  event: any; 
  slug: string;
}

const input = "w-full bg-dark-200 border border-border-dark rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-primary outline-none transition";
const label = "text-sm font-medium text-light-100 mb-2 block";

export default function EditEventForm({ event, slug }: EditEventFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("image") as File;

    if (file && file.size > 0 && file.size > 4 * 1024 * 1024) { 
        setError("File size exceeds 4MB.");
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }

    const result = await updateEvent(slug, formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push(`/events/${slug}`);
      router.refresh(); 
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex items-center gap-3 text-red-400 animate-pulse">
            <AlertCircle size={20} />
            <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Title & Description */}
      <div>
         <label className={label}>Event Title</label>
         <input name="title" defaultValue={event.title} className={input} required />
      </div>
      <div>
         <label className={label}>Short Description</label>
         <textarea name="description" rows={3} defaultValue={event.description} className={input} required />
      </div>
      <div>
         <label className={label}>Overview (Full Details)</label>
         <textarea name="overview" rows={6} defaultValue={event.overview} className={input} required />
      </div>

      {/* Logistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
             <label className={label}>Date</label>
             <input type="date" name="date" defaultValue={event.date} className={input} required />
         </div>
          <div>
             <label className={label}>Time</label>
             <input type="time" name="time" defaultValue={event.time} className={input} required />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
             <label className={label}>City / Region</label>
             <input name="location" defaultValue={event.location} className={input} required />
         </div>
         <div>
             <label className={label}>Venue / Link</label>
             <input name="venue" defaultValue={event.venue} className={input} required />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
              <label className={label}>Mode</label>
              <select name="mode" defaultValue={event.mode} className={input}>
                 <option value="online">Online</option>
                 <option value="offline">Offline</option>
                 <option value="hybrid">Hybrid</option>
              </select>
         </div>
          {/* --- CAPACITY FIELD --- */}
          <div>
             <label className={label}>
                Total Capacity 
                <span className="ml-2 text-xs text-gray-500">(Booked: {event.seatsTaken})</span>
             </label>
             <div className="relative">
                 <Users className="absolute left-3 top-3.5 text-gray-500" size={18} />
                 <input 
                    name="capacity" 
                    type="number" 
                    defaultValue={event.capacity || 50} 
                    min={event.seatsTaken} // 🛡️ Prevent setting less than booked
                    className={`${input} pl-10`} 
                    required 
                 />
             </div>
             <p className="text-xs text-gray-500 mt-1">Cannot reduce below sold seats.</p>
         </div>
      </div>

      <div>
         <label className={label}>Audience</label>
         <input name="audience" defaultValue={event.audience} className={input} required />
      </div>

      {/* Tags & Agenda */}
      <div>
         <label className={label}>Tags (Comma separated)</label>
         <input name="tags" defaultValue={event.tags.join(', ')} className={input} required />
      </div>
      <div>
         <label className={label}>Agenda (One item per line)</label>
         <textarea name="agenda" rows={5} defaultValue={event.agenda.join('\n')} className={input} required />
      </div>

      {/* Image Upload */}
      <div className={`flex flex-col gap-2 p-6 border rounded-xl bg-white/5 transition-colors ${error.includes("File size") ? "border-red-500/50" : "border-white/10"}`}>
         <label className="text-light-100 font-medium text-sm flex items-center gap-2">
            <ImagePlus size={16} /> Update Cover Image (Optional)
         </label>
         <p className="text-xs text-gray-400">Leave empty to keep current image.</p>
         <p className="text-xs text-yellow-500/80 font-mono font-medium bg-yellow-500/10 px-2 py-1 rounded w-fit my-2">⚠️ STRICT LIMIT: Max 4MB</p>

         <input 
            type="file" 
            name="image" 
            accept="image/*" 
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/80 cursor-pointer" 
            onChange={(e) => {
                if (e.target.files?.[0]?.size! > 4 * 1024 * 1024) {
                    setError("File too large! Must be under 4MB.");
                } else {
                    setError("");
                }
            }}
         />
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className={`flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all shadow-lg mt-4
            ${isLoading ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-black hover:scale-[1.01]"}`}
      >
        <Save size={20} />
        {isLoading ? "Saving Changes..." : "Save Changes"}
      </button>
    </form>
  );
}