import { Skeleton } from "@/components/skeletons";

export default function LoadingEventDetails() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
         <div className="space-y-4 w-full max-w-2xl">
            <Skeleton className="h-14 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
         </div>
         <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
         {/* Left Content */}
         <div className="flex-[2] space-y-12">
            {/* Banner */}
            <Skeleton className="aspect-video w-full rounded-2xl" />
            
            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>

            {/* Text blocks */}
            <Skeleton className="h-64 rounded-2xl" />
         </div>

         {/* Right Sidebar */}
         <div className="flex-1 w-full lg:max-w-md">
            <Skeleton className="h-96 rounded-2xl" />
         </div>
      </div>
    </div>
  );
}