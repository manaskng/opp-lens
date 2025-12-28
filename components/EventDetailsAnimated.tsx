"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link"; // <--- Don't forget this!
import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import DeleteEventBtn from "@/components/DeleteEventBtn";
import ShareEventBtn from "@/components/ShareEventBtn"; // <--- Import Share
import { Calendar, Clock, MapPin, Monitor, Users, Info, Edit } from "lucide-react"; // <--- Import Edit
import { IEvent } from "@/database";

interface Props {
  event: IEvent;
  similarEvents: IEvent[];
  bookingsCount: number;
  isOwner: boolean;
}

// ... keep your variants ...
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } } };

export default function EventDetailsAnimated({ event, similarEvents, bookingsCount, isOwner }: Props) {
  return (
    <motion.section 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      {/* 1. HERO SECTION */}
      <motion.div variants={itemVariants} className="mb-12 flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex-1">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 mb-4 tracking-tight">
            {event.title}
          </h1>
          <p className="text-xl text-light-200 max-w-2xl leading-relaxed font-light">
            {event.description}
          </p>
        </div>
        
        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-3 shrink-0">
            {/* Share Button (Always Visible) */}
            <ShareEventBtn slug={event.slug} />

            {/* Owner Actions (Edit/Delete) */}
            {isOwner && (
                <>
                    <Link 
                        href={`/events/${event.slug}/edit`}
                        className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 hover:text-white transition-all"
                    >
                        <Edit size={16} />
                        Edit
                    </Link>
                    <DeleteEventBtn slug={event.slug} />
                </>
            )}
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* 2. LEFT CONTENT */}
        <div className="flex-[2] space-y-12">
          
          {/* Banner */}
          <motion.div variants={itemVariants} className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl group max-h-[600px]">
             <Image 
                src={event.image} 
                alt={event.title} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105" 
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
             <div className="absolute bottom-6 left-6 flex gap-3 flex-wrap">
                {event.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-medium text-white">
                        #{tag}
                    </span>
                ))}
             </div>
          </motion.div>

          {/* Info Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 gap-4">
             <DetailTile icon={Calendar} label="Date" value={event.date} />
             <DetailTile icon={Clock} label="Time" value={event.time} />
             <DetailTile icon={MapPin} label="Location" value={event.location} />
             <DetailTile icon={Monitor} label="Mode" value={event.mode} />
             <DetailTile icon={Users} label="Audience" value={event.audience} />
             <DetailTile icon={Info} label="Organizer" value={event.organizer} />
          </motion.div>

          {/* Overview & Agenda */}
          <motion.div variants={itemVariants} className="space-y-8">
             <div className="glass p-8 rounded-2xl border border-white/5">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span className="w-1 h-8 bg-primary rounded-full"/> Overview
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg">{event.overview}</p>
             </div>

             <div className="glass p-8 rounded-2xl border border-white/5">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-1 h-8 bg-purple-500 rounded-full"/> Agenda
                </h3>
                <div className="space-y-0">
                    {event.agenda.map((item, i) => (
                        <div key={i} className="flex gap-4 group">
                            <div className="flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-primary mt-2 group-hover:scale-150 transition-transform"/>
                                {i !== event.agenda.length - 1 && <div className="w-[1px] h-full bg-gray-800 my-1" />}
                            </div>
                            <p className="text-gray-300 pb-8 text-lg">{item}</p>
                        </div>
                    ))}
                </div>
             </div>
          </motion.div>
        </div>

        {/* 3. RIGHT SIDEBAR */}
        <motion.aside variants={itemVariants} className="flex-1 w-full lg:max-w-md">
           <div className="sticky top-24 space-y-6">
              <div className="glass p-6 rounded-2xl border border-white/10 shadow-[0_0_40px_-10px_rgba(89,222,202,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
                  
                  <h2 className="text-2xl font-bold mb-2">Secure your Spot</h2>
                  <div className="flex items-center gap-2 mb-6">
                      <div className="flex -space-x-2">
                          {[1,2,3].map(i => (
                              <div key={i} className="w-6 h-6 rounded-full bg-gray-700 border border-black" />
                          ))}
                      </div>
                      <p className="text-sm text-gray-400">
                          {bookingsCount > 0 ? `Join ${bookingsCount} others` : "Be the first!"}
                      </p>
                  </div>

                  <BookEvent eventId={event._id as string} slug={event.slug} />
              </div>
           </div>
        </motion.aside>
      </div>

      {/* 4. SIMILAR EVENTS */}
      <motion.div variants={itemVariants} className="mt-24">
          <h2 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-4">You might also like</h2>
          <div className="grid md:grid-cols-3 gap-8 sm:grid-cols-2 grid-cols-1">
             {similarEvents.map((ev) => (
                 <EventCard key={ev.title} {...ev} />
             ))}
          </div>
      </motion.div>
    </motion.section>
  );
}

function DetailTile({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="bg-dark-200/50 p-4 rounded-xl border border-white/5 flex flex-col gap-2 hover:bg-dark-200 transition-colors group">
            <div className="flex items-center gap-2 text-gray-400 group-hover:text-primary transition-colors">
                <Icon size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
            </div>
            <p className="font-medium text-white truncate" title={value}>{value}</p>
        </div>
    )
}