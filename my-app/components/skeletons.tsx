import { cn } from "@/lib/utils";
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-white/5", className)} />
  );
}

export function EventCardSkeleton() {
  return (
    <div className="h-[400px] w-full rounded-2xl border border-white/5 bg-white/5 overflow-hidden flex flex-col">
      <div className="h-[60%] w-full bg-white/10 animate-pulse" />
      <div className="p-5 flex flex-col justify-between flex-1">
        <Skeleton className="h-6 w-3/4 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <section className="pb-20 relative px-4 overflow-hidden">
      {/* Hero Skeleton */}
      <div className="relative z-10 text-center pt-16 pb-12 flex flex-col items-center">
         <Skeleton className="h-8 w-48 rounded-full mb-6" />
         <Skeleton className="h-16 w-3/4 md:w-1/2 mb-6" />
         <Skeleton className="h-6 w-1/3 mb-10" />
         <Skeleton className="h-14 w-full max-w-2xl rounded-full" />
      </div>

      {/* Trending Skeleton */}
      <div className="mb-24 w-full max-w-7xl mx-auto">
         <div className="flex justify-between items-end mb-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-24" />
         </div>
         <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3].map((i) => (
                <div key={i} className="min-w-[350px]">
                    <EventCardSkeleton />
                </div>
            ))}
         </div>
      </div>

      {/* Grid Skeleton */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
         {/* Main Feed */}
         <div className="lg:col-span-8 space-y-8">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <EventCardSkeleton key={i} />
                ))}
            </div>
         </div>

         {/* Sidebar */}
         <div className="lg:col-span-4 space-y-8">
             <Skeleton className="h-8 w-48 mb-6" />
             <div className="flex flex-col gap-6">
                 {[1, 2].map((i) => (
                    <EventCardSkeleton key={i} />
                 ))}
             </div>
         </div>
      </div>
    </section>
  );
}