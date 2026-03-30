"use client"; // Required for interaction

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin, Users, Monitor, Ticket, ArrowRight, ArrowUpRight } from "lucide-react"; 
import ShareEventBtn from "@/components/ShareEventBtn";

interface Props {
  _id?: string;
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
  description?: string;
  mode?: string;
  audience?: string;
  capacity?: number;
  seatsTaken?: number;
}

const EventCard = ({ 
    title, image, slug, location, date, time, description, mode, audience,
    capacity = 50, seatsTaken = 0 
}: Props) => {
  
  const shortDescription = description 
    ? description.substring(0, 100) + (description.length > 100 ? "..." : "")
    : "View event details to learn more.";

  const isSoldOut = seatsTaken >= capacity;
  const isAlmostFull = !isSoldOut && seatsTaken >= (capacity * 0.9);
  const spotsLeft = capacity - seatsTaken;

  return (
    <Link href={`/events/${slug}`} className="block group perspective-1000 h-[400px] w-full relative z-10 cursor-pointer">
      
      <div className="relative h-full w-full transition-all duration-700 transform-style-3d group-hover:rotate-y-180 rounded-2xl shadow-xl">
        
        {/* --- FRONT FACE --- */}
        <div className="absolute inset-0 h-full w-full backface-hidden rounded-2xl overflow-hidden bg-dark-200 border border-white/10 flex flex-col">
          
          {/* Status Badges */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
              {isSoldOut ? (
                  <div className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border border-red-400 flex items-center gap-1.5">
                      <Ticket size={14} className="fill-current" /> SOLD OUT
                  </div>
              ) : isAlmostFull ? (
                  <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border border-orange-400 animate-pulse flex items-center gap-1.5">
                      <Ticket size={14} className="fill-current" /> ONLY {spotsLeft} LEFT
                  </div>
              ) : null}
          </div>

          {/* Image */}
          <div className="relative h-[60%] w-full overflow-hidden">
             <Image 
                src={image} 
                alt={title} 
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 400px"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-dark-200 via-transparent to-transparent"/>
             
             {mode && (
                 <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase flex items-center gap-1.5">
                     <Monitor size={12} /> {mode}
                 </div>
             )}
          </div>

          {/* Content & Logistics */}
          <div className="p-5 flex flex-col justify-between h-[40%] relative">
            
            {/* Title */}
            <h3 className="text-xl font-bold text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors pr-8">
                {title}
            </h3>
            
            {/* Logistics Grid */}
            <div className="flex flex-col gap-2.5 mt-2">
               <div className="flex items-center gap-3 text-sm text-light-200">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-primary" /> 
                    <span>{date}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-600" />
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-primary" />
                    <span>{time}</span>
                  </div>
               </div>
               
               <div className="flex justify-between items-center w-full">
                   <div className="flex items-center gap-1.5 text-sm text-light-200 truncate max-w-[70%]">
                      <MapPin size={14} className="text-primary shrink-0" /> 
                      <span className="truncate">{location}</span>
                   </div>

                   {/* --- MOBILE CTA (Visual Cue) --- */}
                   {/* This ensures users know they can click/tap without flipping */}
                   <div className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                       {isSoldOut ? "View" : "Book"} <ArrowUpRight size={14} />
                   </div>
               </div>
            </div>
          </div>
        </div>


        {/* --- BACK FACE --- */}
        <div className="absolute inset-0 h-full w-full backface-hidden rotate-y-180 rounded-2xl overflow-hidden bg-dark-200 p-6 border-2 border-primary/20 flex flex-col justify-between">
            
            <div>
                <h4 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"/>
                    Quick Look
                </h4>
                
                <p className="text-white text-sm leading-relaxed opacity-90 font-medium line-clamp-4">
                    {shortDescription}
                </p>

                <div className="mt-5 space-y-3">
                    {/* Audience Tag */}
                    {audience && (
                        <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 p-2 rounded-lg border border-white/5">
                            <Users size={14} className="text-primary" />
                            Target: {audience}
                        </div>
                    )}

                    {/* Stats Box */}
                    {!isSoldOut && (
                        <div className={`flex items-center justify-between p-3 rounded-lg border ${
                            isAlmostFull 
                                ? "bg-orange-500/10 border-orange-500/30" 
                                : "bg-primary/10 border-primary/20"
                        }`}>
                            <div className="flex items-center gap-2">
                                <Ticket size={18} className={isAlmostFull ? "text-orange-400" : "text-primary"} />
                                <span className={`text-sm font-bold ${isAlmostFull ? "text-orange-400" : "text-white"}`}>
                                    {spotsLeft} Spots Open
                                </span>
                            </div>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">
                                of {capacity}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ACTION ROW */}
            <div className="flex gap-3 items-center pt-4 border-t border-white/10">
                <div className="shrink-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <ShareEventBtn slug={slug} />
                </div>

                <div className={`flex-1 py-2.5 rounded-lg text-center font-bold text-sm transition-colors flex items-center justify-center gap-2 ${isSoldOut ? "bg-gray-700 text-gray-400" : "bg-primary text-black hover:bg-white"}`}>
                    {isSoldOut ? "Sold Out" : (
                        <>
                            View Details <ArrowRight size={16} />
                        </>
                    )}
                </div>
            </div>
        </div>
      </div>
    </Link>
  )
}

export default EventCard;