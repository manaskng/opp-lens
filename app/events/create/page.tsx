import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createEvent } from "@/lib/actions/event.actions";

// Helper for reusable input styles
const inputStyles = "bg-dark-200 border border-border-dark p-3 rounded-lg text-white focus:border-primary outline-none transition-colors w-full";
const labelStyles = "text-light-100 font-medium text-sm mb-2 block";

export default async function CreateEventPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 glass rounded-2xl border border-dark-200">
      <div className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-white mb-2">Create New Event</h1>
        <p className="text-light-200">Fill in the details to host your next big developer event.</p>
      </div>
      
      <form action={createEvent} className="flex flex-col gap-8">
        
        {/* --- SECTION 1: BASIC INFO --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
                <label className={labelStyles}>Event Title</label>
                <input name="title" required className={inputStyles} placeholder="e.g. React Summit 2025" />
            </div>

            <div className="col-span-full">
                <label className={labelStyles}>Short Description (Meta)</label>
                <textarea name="description" required rows={3} className={inputStyles} placeholder="A brief summary shown on cards..." />
            </div>

             <div className="col-span-full">
                <label className={labelStyles}>Detailed Overview</label>
                <textarea name="overview" required rows={5} className={inputStyles} placeholder="Full details about what attendees will learn..." />
            </div>
        </div>

        {/* --- SECTION 2: LOGISTICS --- */}
        <h3 className="text-xl font-bold text-primary border-t border-gray-800 pt-6">Logistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className={labelStyles}>Date</label>
                <input type="date" name="date" required className={inputStyles} />
            </div>
            <div>
                <label className={labelStyles}>Time</label>
                <input type="time" name="time" required className={inputStyles} />
            </div>

            <div>
                 <label className={labelStyles}>Mode</label>
                 <select name="mode" className={inputStyles}>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                 </select>
            </div>
             <div>
                <label className={labelStyles}>Target Audience</label>
                <input name="audience" required className={inputStyles} placeholder="e.g. Senior Developers, Students" />
            </div>

            <div>
                <label className={labelStyles}>City / Region</label>
                <input name="location" required className={inputStyles} placeholder="e.g. San Francisco, CA" />
            </div>
            <div>
                <label className={labelStyles}>Specific Venue</label>
                <input name="venue" required className={inputStyles} placeholder="e.g. Moscone Center, Hall B" />
            </div>
        </div>

        {/* --- SECTION 3: CONTENT --- */}
        <h3 className="text-xl font-bold text-primary border-t border-gray-800 pt-6">Content</h3>
        
        <div>
            <label className={labelStyles}>Agenda (One item per line)</label>
            <textarea name="agenda" required rows={5} className={inputStyles} placeholder="09:00 AM - Opening Ceremony&#10;10:00 AM - Keynote Speech&#10;12:00 PM - Lunch Break" />
        </div>

        <div>
            <label className={labelStyles}>Tags (Comma separated)</label>
            <input name="tags" required className={inputStyles} placeholder="React, Next.js, Web Development, Networking" />
        </div>

        {/* --- SECTION 4: MEDIA --- */}
        <div>
            <label className={labelStyles}>Cover Image</label>
            <input type="file" name="image" accept="image/*" required className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/80 cursor-pointer bg-dark-200 rounded-lg p-2" />
        </div>

        <button type="submit" className="bg-primary hover:bg-primary/90 text-black font-bold py-4 rounded-lg mt-4 transition-all hover:scale-[1.01] shadow-[0_0_20px_rgba(89,222,202,0.3)]">
            Publish Event
        </button>
      </form>
    </div>
  );
}