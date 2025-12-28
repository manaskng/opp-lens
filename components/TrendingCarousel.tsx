"use client";

import { IEvent } from "@/database";
import EventCard from "@/components/EventCard";

export default function TrendingCarousel({ events }: { events: IEvent[] }) {
  // If we have fewer than 3 events, don't animate (it looks weird), just show grid
  if (events.length < 3) {
    return (
      <div className="flex gap-6 overflow-x-auto pb-4 px-4 justify-center">
        {events.map((event) => (
          <div key={event._id as string} className="min-w-[320px]">
            <EventCard {...event} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
      
      {/* Scroll Group 1 */}
      <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 [&_img]:max-w-none animate-infinite-scroll hover:[animation-play-state:paused]">
        {events.map((event) => (
          <li key={event._id as string} className="w-[350px] shrink-0">
             <EventCard {...event} />
          </li>
        ))}
      </ul>

      {/* Scroll Group 2 (Duplicate for seamless loop) */}
      <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 [&_img]:max-w-none animate-infinite-scroll hover:[animation-play-state:paused]" aria-hidden="true">
        {events.map((event) => (
          <li key={`${event._id}-duplicate`} className="w-[350px] shrink-0">
             <EventCard {...event} />
          </li>
        ))}
      </ul>
    
    </div>
  );
}