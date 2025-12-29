"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import DeleteEventBtn from "@/components/DeleteEventBtn";
import ShareEventBtn from "@/components/ShareEventBtn";
import {
  Calendar,
  Clock,
  MapPin,
  Monitor,
  Users,
  Info,
  Edit,
} from "lucide-react";
import { IEvent } from "@/database";

interface Props {
  event: IEvent;
  similarEvents: IEvent[];
  bookingsCount: number;
  isOwner: boolean;
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
  bookingsCount,
  isOwner,
}: Props) {
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
                sizes="(max-width: 640px) 100vw,
                       (max-width: 1024px) 80vw,
                       1200px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* TAG STRIP */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-black/40 backdrop-blur border border-white/20 text-xs font-medium text-white"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* META PILLS */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-3"
          >
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
            <p className="text-gray-300 leading-relaxed text-lg">
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

        {/* SIDEBAR */}
        <motion.aside
          variants={itemVariants}
          className="flex-1 w-full lg:max-w-md"
        >
          <div className="sticky top-24 space-y-6">
            <div className="glass p-6 rounded-2xl border border-white/10 shadow-[0_0_40px_-10px_rgba(89,222,202,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

              <h2 className="text-2xl font-bold mb-2">
                Secure your spot
              </h2>

              <p className="text-sm text-gray-400 mb-4">
                {bookingsCount > 0
                  ? `${bookingsCount} developers already joined`
                  : "Be the first to attend"}
              </p>

              <BookEvent
                eventId={event._id as string}
                slug={event.slug}
              />
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
