"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import BookEventBtn from "@/components/BookEventBtn"; 
import EventCard from "@/components/EventCard";
import DeleteEventBtn from "@/components/DeleteEventBtn";
import ShareEventBtn from "@/components/ShareEventBtn";
import { deleteBooking } from "@/lib/actions/booking.actions"; // Import Cancel Action
import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Monitor,
  Users,
  Info,
  Edit,
  Edit3,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";
import { IEvent } from "@/database/event.model"; 

interface Props {
  event: IEvent;
  similarEvents: IEvent[];
  isOwner: boolean;
  isSoldOut: boolean;
  spotsLeft: number;
  percentFull: number;
  currentUserEmail: string;
  currentUserId: string;
  bookingId?: string | null; // Null if not booked, ID string if booked
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

export default function EventDetailsAnimated({
  event,
  similarEvents,
  isOwner,
  isSoldOut,
  spotsLeft,
  percentFull,
  currentUserEmail,
  bookingId
}: Props) {

  const [isCancelling, setIsCancelling] = useState(false);

  // Handle Cancellation
  const handleCancel = async () => {
      if (!bookingId) return;
      
      const confirmed = window.confirm("Are you sure you want to cancel your ticket? This will free up a spot for someone else.");
      if (!confirmed) return;

      setIsCancelling(true);
      await deleteBooking(bookingId);
      setIsCancelling(false);
      // The server action 'revalidatePath' will refresh this page automatically
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      {/* HERO HEADER */}
      <motion.div
        variants={itemVariants}
        className="mb-14 flex flex-col md:flex-row justify-between items-start gap-6"
      >
        <div className="flex-1">
          {/* Status Badge */}
          <div className="flex items-center gap-3 mb-4">
             {isSoldOut && !bookingId && ( // Only show sold out if user doesn't have a ticket
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                    Sold Out
                </span>
             )}
             {bookingId && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-400">
                    You're Going!
                </span>
             )}
             <span className="bg-white/10 border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-primary uppercase tracking-wider">
                {event.mode} Event
             </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-400 mb-4 tracking-tight">
            {event.title}
          </h1>
          <p className="text-xl text-light-200 max-w-2xl leading-relaxed font-light">
            {event.description}
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3 shrink-0">
          <ShareEventBtn slug={event.slug} />

          {isOwner && (
            <>
              <Link
                href={`/events/${event.slug}/edit`}
                className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 hover:text-white transition"
              >
                <Edit size={16} />
                Edit
              </Link>
              <DeleteEventBtn slug={event.slug} />
            </>
          )}
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-14">
        {/* LEFT CONTENT */}
        <div className="flex-[2] space-y-14">
          {/* IMAGE */}
          <motion.div variants={itemVariants}>
            <div className="relative w-full h-[420px] sm:h-[520px] lg:h-[600px] rounded-2xl overflow-hidden border border-white/10">
              <Image
                src={event.image}
                alt={event.title}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>
          </motion.div>

          {/* META PILLS */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
            <MetaPill icon={Calendar} text={event.date} />
            <MetaPill icon={Clock} text={event.time} />
            <MetaPill icon={MapPin} text={event.location} />
            <MetaPill icon={Monitor} text={event.mode} />
            <MetaPill icon={Users} text={event.audience} />
            <MetaPill icon={Info} text={event.organizer} />
          </motion.div>

          {/* OVERVIEW */}
          <motion.div variants={itemVariants} className="glass p-8 rounded-2xl border border-white/5">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-8 bg-primary rounded-full" />
              Overview
            </h3>
            <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
              {event.overview}
            </p>
          </motion.div>

          {/* AGENDA */}
          <motion.div variants={itemVariants} className="glass p-8 rounded-2xl border border-white/5">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-purple-500 rounded-full" />
              Agenda
            </h3>
            <div className="space-y-6">
              {event.agenda.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2" />
                    {i !== event.agenda.length - 1 && (
                      <div className="w-px flex-1 bg-gray-800 mt-1" />
                    )}
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDEBAR (THE SMART CARD) */}
        <motion.aside variants={itemVariants} className="flex-1 w-full lg:max-w-md">
          <div className="sticky top-24 space-y-6">
            
            <div className="glass p-6 rounded-2xl border border-white/10 shadow-[0_0_40px_-10px_rgba(89,222,202,0.15)] relative overflow-hidden bg-dark-200/50 backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

              {/* PRICE & CAPACITY */}
              <div className="flex justify-between items-end mb-6">
                 <div>
                    <p className="text-sm text-gray-400 mb-1">Price</p>
                    <h2 className="text-3xl font-bold text-white">Free</h2>
                 </div>
                 <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">Capacity</p>
                    <div className="flex items-center gap-2 text-white font-medium">
                        <Users size={16} className="text-primary" />
                        <span>{event.seatsTaken} / {event.capacity}</span>
                    </div>
                 </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
                 <div 
                     className={`h-full rounded-full transition-all duration-1000 ${isSoldOut ? 'bg-red-500' : 'bg-primary'}`} 
                     style={{ width: `${percentFull}%` }}
                 />
              </div>

              {/* --- ACTION BUTTON LOGIC --- */}
              {isOwner ? (
                 // STATE A: HOST -> EDIT
                 <Link 
                     href={`/events/${event.slug}/edit`} 
                     className="flex items-center justify-center gap-2 w-full py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/10"
                 >
                     <Edit3 size={18} /> Manage Event
                 </Link>
              ) : bookingId ? (
                 // STATE B: ALREADY BOOKED -> CANCEL OPTION
                 <div className="space-y-3">
                     <div className="flex items-center justify-center gap-2 w-full py-3 bg-green-500/20 text-green-400 font-bold rounded-xl border border-green-500/20">
                         <CheckCircle2 size={18} /> Ticket Confirmed
                     </div>
                     <button 
                        onClick={handleCancel}
                        disabled={isCancelling}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-red-500/10 text-red-400 text-sm font-bold rounded-xl hover:bg-red-500/20 transition-all border border-red-500/10 hover:border-red-500/30"
                     >
                        {isCancelling ? <Loader2 size={16} className="animate-spin"/> : <XCircle size={16} />}
                        Cancel Booking
                     </button>
                 </div>
              ) : currentUserEmail ? (
                 // STATE C: NOT BOOKED -> SHOW BOOK BUTTON
                 <BookEventBtn 
                     eventId={event._id as string} 
                     slug={event.slug} 
                     email={currentUserEmail}
                     isSoldOut={isSoldOut}
                 />
              ) : (
                 // STATE D: GUEST -> LOGIN
                 <Link 
                     href="/login" 
                     className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-black font-bold rounded-xl hover:bg-white transition-all"
                 >
                     Login to Book
                 </Link>
              )}

              {/* URGENCY TEXT (Only if not booked, not owner, and not sold out) */}
              {!isSoldOut && !isOwner && !bookingId && (
                  <p className="text-center text-xs text-orange-400/80 mt-4 font-medium animate-pulse">
                     🔥 Hurry! Only {spotsLeft} spots left.
                  </p>
              )}
            </div>

            {/* HOST CARD */}
            <div className="glass p-6 rounded-2xl border border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-4">Hosted By</p>
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white shadow-inner">
                       {event.organizer.charAt(0).toUpperCase()}
                   </div>
                   <div>
                       <p className="text-white text-sm font-bold">{event.organizer}</p>
                       <p className="text-xs text-gray-500">Verified Host</p>
                   </div>
                </div>
            </div>

          </div>
        </motion.aside>
      </div>

      {/* SIMILAR EVENTS */}
      <motion.div variants={itemVariants} className="mt-28">
        <h2 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-4">
          You might also like
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {similarEvents.map((ev) => (
            <EventCard key={ev.title} {...ev} />
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}

/* ------------------ HELPERS ------------------ */

function MetaPill({
  icon: Icon,
  text,
}: {
  icon: any;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-dark-200/60 border border-white/10 text-sm text-white">
      <Icon size={14} className="text-primary" />
      <span className="truncate max-w-[200px]">{text}</span>
    </div>
  );
}