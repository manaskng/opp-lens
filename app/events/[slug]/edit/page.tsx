import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import { updateEvent } from "@/lib/actions/event.actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { slug } = await params;
  await connectDB();
  const event = await Event.findOne({ slug });

  if (!event) return notFound();
  
  // Strict Ownership Check
  if (event.organizer !== session.user.email) redirect("/"); 

  // Bind the slug to the server action so we don't need a hidden input
  const updateEventWithSlug = updateEvent.bind(null, slug);

  return (
    <div className="max-w-3xl mx-auto my-10 p-8 glass rounded-2xl border border-dark-200">
      
      {/* Header */}
      <div className="mb-8 border-b border-gray-800 pb-4 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Edit Event</h1>
            <p className="text-light-200">Update the details for "{event.title}"</p>
        </div>
        <Link href={`/events/${slug}`} className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
            <ArrowLeft size={16} /> Back
        </Link>
      </div>
      
      <form action={async (formData) => {
          "use server";
          await updateEventWithSlug(formData);
          redirect(`/events/${slug}`);
      }} className="flex flex-col gap-6">
        
        {/* Title */}
        <div className="flex flex-col gap-2">
            <label className="text-light-100 font-medium text-sm">Event Title</label>
            <input name="title" defaultValue={event.title} className="bg-dark-200 border border-border-dark p-3 rounded-lg text-white focus:border-primary outline-none" />
        </div>

        {/* Short Description */}
        <div className="flex flex-col gap-2">
            <label className="text-light-100 font-medium text-sm">Short Description</label>
            <textarea name="description" rows={3} defaultValue={event.description} className="bg-dark-200 border border-border-dark p-3 rounded-lg text-white focus:border-primary outline-none" />
        </div>

        {/* Detailed Overview */}
        <div className="flex flex-col gap-2">
            <label className="text-light-100 font-medium text-sm">Overview (Full Details)</label>
            <textarea name="overview" rows={6} defaultValue={event.overview} className="bg-dark-200 border border-border-dark p-3 rounded-lg text-white focus:border-primary outline-none" />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-2">
                <label className="text-light-100 font-medium text-sm">Date</label>
                <input type="date" name="date" defaultValue={event.date} className="bg-dark-200 border border-border-dark p-3 rounded-lg text-white" />
            </div>
             <div className="flex flex-col gap-2">
                <label className="text-light-100 font-medium text-sm">Time</label>
                <input type="time" name="time" defaultValue={event.time} className="bg-dark-200 border border-border-dark p-3 rounded-lg text-white" />
            </div>
        </div>

        {/* Location & Venue */}
        <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
                <label className="text-light-100 font-medium text-sm">City / Region</label>
                <input name="location" defaultValue={event.location} className="bg-dark-200 border border-border-dark p-3 rounded-lg text-white" />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-light-100 font-medium text-sm">Venue / Link</label>
                <input name="venue" defaultValue={event.venue} className="bg-dark-200 border border-border-dark p-3 rounded-lg text-white" />
            </div>
        </div>

        {/* Mode & Audience */}
        <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-2">
                 <label className="text-light-100 font-medium text-sm">Mode</label>
                 <select name="mode" defaultValue={event.mode} className="bg-dark-200 border border-border-dark p-3 rounded-lg text-white">
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                 </select>
            </div>
             <div className="flex flex-col gap-2">
                <label className="text-light-100 font-medium text-sm">Audience</label>
                <input name="audience" defaultValue={event.audience} className="bg-dark-200 border border-border-dark p-3 rounded-lg text-white" />
            </div>
        </div>

        {/* Arrays: Join them back into strings for easy editing */}
        <div className="flex flex-col gap-2">
            <label className="text-light-100 font-medium text-sm">Tags (Comma separated)</label>
            <input name="tags" defaultValue={event.tags.join(', ')} className="bg-dark-200 border border-border-dark p-3 rounded-lg text-white" />
        </div>

        <div className="flex flex-col gap-2">
            <label className="text-light-100 font-medium text-sm">Agenda (One item per line)</label>
            <textarea name="agenda" rows={5} defaultValue={event.agenda.join('\n')} className="bg-dark-200 border border-border-dark p-3 rounded-lg text-white" />
        </div>

        {/* Image (Optional) */}
        <div className="flex flex-col gap-2 p-4 border border-white/10 rounded-lg bg-white/5">
            <label className="text-light-100 font-medium text-sm">Update Cover Image (Optional)</label>
            <p className="text-xs text-gray-400 mb-2">Leave empty to keep the current image.</p>
            <input type="file" name="image" accept="image/*" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/80 cursor-pointer" />
        </div>

        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg mt-4 transition-all">
            Save Changes
        </button>
      </form>
    </div>
  );
}