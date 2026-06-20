"use client";

export default function TrendingCarousel({ items }: { items: React.ReactNode[] }) {
  // If we have fewer than 3 items, don't animate (it looks weird), just show grid
  if (items.length < 3) {
    return (
      <div className="flex gap-6 overflow-x-auto pb-4 px-4 justify-center">
        {items.map((item, i) => (
          <div key={i} className="min-w-[320px]">
            {item}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
      
      {/* Scroll Group 1 */}
      <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 [&_img]:max-w-none animate-infinite-scroll hover:[animation-play-state:paused]">
        {items.map((item, i) => (
          <li key={i} className="w-[350px] shrink-0">
             {item}
          </li>
        ))}
      </ul>

      {/* Scroll Group 2 (Duplicate for seamless loop) */}
      <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 [&_img]:max-w-none animate-infinite-scroll hover:[animation-play-state:paused]" aria-hidden="true">
        {items.map((item, i) => (
          <li key={`duplicate-${i}`} className="w-[350px] shrink-0">
             {item}
          </li>
        ))}
      </ul>
    
    </div>
  );
}