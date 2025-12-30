"use client";

import { useState } from "react";
import EventCard from "@/components/EventCard";
import { Calendar, LayoutDashboard, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { deleteBooking } from "@/lib/actions/booking.actions"; 

interface Props {
  attending: any[]; 
  hosting: any[];   
  userId: string;
}

export default function ProfileTabs({ attending, hosting, userId }: Props) {
  const [activeTab, setActiveTab] = useState<"attending" | "hosting">("attending");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // --- CANCEL HANDLER ---
  const handleCancel = async (bookingId: string) => {
      const confirmed = window.confirm("Are you sure you want to cancel this ticket? This will free up a spot for others.");
      if (!confirmed) return;

      setDeletingId(bookingId);
      await deleteBooking(bookingId); // Call Server Action
      setDeletingId(null);
  };

  return (
    <div className="w-full">
      
      {/* 1. TAB SWITCHER */}
      <div className="flex items-center gap-8 border-b border-white/10 mb-10">
        <button
          onClick={() => setActiveTab("attending")}
          className={`pb-4 text-lg font-bold flex items-center gap-2 transition-all relative ${
            activeTab === "attending" ? "text-primary" : "text-gray-400 hover:text-white"
          }`}
        >
          <Calendar size={18} />
          My Tickets
          <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full ml-1 text-white">
            {attending.length}
          </span>
          {activeTab === "attending" && (
            <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("hosting")}
          className={`pb-4 text-lg font-bold flex items-center gap-2 transition-all relative ${
            activeTab === "hosting" ? "text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <LayoutDashboard size={18} />
          Organized Events
          <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full ml-1 text-white">
            {hosting.length}
          </span>
          {activeTab === "hosting" && (
            <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 rounded-t-full" />
          )}
        </button>
      </div>

      {/* 2. CONTENT AREA */}
      <div className="min-h-[400px]">
        
        {/* --- ATTENDING TAB --- */}
        {activeTab === "attending" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          >
            {attending.length > 0 ? (
              attending.map((booking: any) => (
                <div key={booking._id} className="relative group">
                   
                   {/* Confirmed Badge */}
                   <div className="absolute top-3 right-3 z-20 bg-green-500/20 backdrop-blur-md border border-green-500/40 text-green-400 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                      CONFIRMED
                   </div>

                   {/* --- CANCEL BUTTON (Hover to see) --- */}
                   <button
                        onClick={(e) => {
                            e.preventDefault(); // Stop Link Navigation
                            handleCancel(booking._id);
                        }}
                        disabled={deletingId === booking._id}
                        className="absolute bottom-3 right-3 z-30 p-2.5 bg-red-500/90 hover:bg-red-600 border border-red-400 text-white rounded-xl shadow-lg transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Cancel Ticket"
                   >
                        {deletingId === booking._id ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Trash2 size={18} />
                        )}
                   </button>
                   
                   <EventCard {...booking.eventId} />
                </div>
              ))
            ) : (
              <EmptyState 
                title="No tickets yet"
                description="You haven't booked any events. Explore the feed to find your next hackathon."
                actionLink="/"
                actionText="Explore Events"
              />
            )}
          </motion.div>
        )}

        {/* --- HOSTING TAB --- */}
        {activeTab === "hosting" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          >
             <Link href="/create-event" className="group h-[400px] border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-white/5 transition-all cursor-pointer">
                <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus size={32} className="text-gray-400 group-hover:text-primary" />
                </div>
                <p className="font-bold text-gray-400 group-hover:text-white">Host a New Event</p>
             </Link>

            {hosting.length > 0 && hosting.map((event: any) => (
               <div key={event._id} className="relative">
                   <div className="absolute top-3 left-3 z-20 bg-purple-500/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-purple-400">
                      HOST
                   </div>
                   <EventCard {...event} />
               </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Simple Empty State Helper
function EmptyState({ title, description, actionLink, actionText }: any) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 text-center">
            <div className="w-16 h-16 bg-dark-200 rounded-full flex items-center justify-center mb-4">
                <Calendar className="text-gray-500 opacity-50" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 max-w-sm mb-6">{description}</p>
            <Link href={actionLink} className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-colors">
                {actionText}
            </Link>
        </div>
    )
}