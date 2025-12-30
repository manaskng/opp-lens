import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin, Users, Monitor } from "lucide-react";
import ShareEventBtn from "@/components/ShareEventBtn";
// import BookmarkBtn from "@/components/BookmarkBtn"; // Uncomment if you added bookmarking

interface Props {
  _id?: string; // Added _id for key/bookmarking
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
  description?: string;
  mode?: string;
  audience?: string;
  // --- NEW PROPS ---
  capacity?: number;
  seatsTaken?: number;
}

const EventCard = ({ 
    _id, title, image, slug, location, date, time, description, mode, audience,
    capacity = 50, seatsTaken = 0 // Default values prevents errors on old data
}: Props) => {
  
  const shortDescription = description 
    ? description.substring(0, 100) + (description.length > 100 ? "..." : "")
    : "View event details to learn more.";

  // --- LOGIC: Availability ---
  const isSoldOut = seatsTaken >= capacity;
  const isAlmostFull = !isSoldOut && seatsTaken >= (capacity * 0.9); // 90% full
  const spotsLeft = capacity - seatsTaken;

  return (
    <Link href={`/events/${slug}`} className="block group perspective-1000 h-[400px] w-full relative z-10 cursor-pointer">
      
      <div className="relative h-full w-full transition-all duration-700 transform-style-3d group-hover:rotate-y-180 rounded-2xl shadow-xl">
        
        {/* --- FRONT FACE --- */}
        <div className="absolute inset-0 h-full w-full backface-hidden rounded-2xl overflow-hidden bg-dark-200 border border-white/10">
          
          {/* 1. STATUS BADGES */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
              {isSoldOut ? (
                  <div className="bg-red-600/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border border-red-400">
                      SOLD OUT
                  </div>
              ) : isAlmostFull ? (
                  <div className="bg-orange-500/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border border-orange-400 animate-pulse">
                      ONLY {spotsLeft} SPOTS LEFT
                  </div>
              ) : null}
          </div>

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
                 <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1">
                     <Monitor size={12} /> {mode}
                 </div>
             )}
          </div>

          <div className="p-5 flex flex-col justify-between h-[40%]">
            <h3 className="text-xl font-bold text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {title}
            </h3>
            
            <div className="flex flex-col gap-2 mt-2">
               <div className="flex items-center gap-2 text-sm text-light-200">
                  <Calendar size={16} className="text-primary" /> 
                  <span>{date}</span>
                  <span className="mx-1 text-gray-600">|</span>
                  <Clock size={16} className="text-primary" />
                  <span>{time}</span>
               </div>
               <div className="flex items-center gap-2 text-sm text-light-200 truncate">
                  <MapPin size={16} className="text-primary shrink-0" /> 
                  <span className="truncate">{location}</span>
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
                
                <p className="text-white text-sm leading-relaxed opacity-90 font-medium">
                    {shortDescription}
                </p>

                {/* Capacity Info on Back */}
                {!isSoldOut && (
                    <p className="text-xs text-gray-400 mt-4 font-mono">
                        {spotsLeft} of {capacity} spots remaining
                    </p>
                )}
            </div>

            <div className="flex gap-3 items-center pt-4 border-t border-white/10">
                <div className="shrink-0">
                    <ShareEventBtn slug={slug} />
                </div>

                <div className={`flex-1 py-2.5 rounded-lg text-center font-bold text-sm transition-colors ${isSoldOut ? "bg-gray-700 text-gray-400" : "bg-primary text-black hover:bg-white"}`}>
                    {isSoldOut ? "Sold Out" : "View Details"}
                </div>
            </div>
        </div>
      </div>
    </Link>
  )
}

export default EventCard;