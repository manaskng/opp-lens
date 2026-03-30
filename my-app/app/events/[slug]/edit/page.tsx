import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditEventForm from "@/components/EditEventForm"; 

export default async function EditEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { slug } = await params;
  await connectDB();
  const event = await Event.findOne({ slug }).lean();

  if (!event) return notFound();
  if (event.organizer !== session.user.email) redirect("/"); 
  const serializedEvent = JSON.parse(JSON.stringify(event));

  return (
    <div className="max-w-3xl mx-auto my-14 px-4">
      <div className="glass p-8 md:p-10 rounded-3xl border border-dark-200">
        
        {/* Header */}
        <div className="mb-8 border-b border-gray-800 pb-4 flex justify-between items-center">
          <div>
              <h1 className="text-3xl font-bold text-white mb-2">Edit Event</h1>
              <p className="text-light-200">Update the details for "{event.title}"</p>
          </div>
          <Link href={`/events/${slug}`} className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors px-4 py-2 bg-white/5 rounded-full hover:bg-white/10">
              <ArrowLeft size={16} /> Back
          </Link>
        </div>
        
        {/* Render the Client Component Form */}
        <EditEventForm event={serializedEvent} slug={slug} />
      </div>
    </div>
  );
}