import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import SearchForm from "@/components/SearchForm";
import TrendingCarousel from "@/components/TrendingCarousel"; // <--- Import
import { getAllEvents } from "@/lib/actions/event.actions";
import { IEvent } from "@/database";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react"; // Nice icons

export default async function Page({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
    
    const { query } = await searchParams;

    // 1. Fetch Top 6 for Trending
    const trendingEvents = await getAllEvents({ limit: 6 });
    
    // 2. Fetch Search Results
    const allEvents = await getAllEvents({ 
        query: query || '',
        limit: 10 
    });

    return (
        <section className="pb-20 relative px-4 overflow-hidden">
            
            {/* HERO SECTION */}
            <div className="relative z-10 text-center pt-16 pb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-6 animate-fade-in backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Live Event Sync Active
                </div>

                <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 mb-6 tracking-tight">
                    Discover. Connect. <br /> <span className="text-primary">Experience.</span>
                </h1>
                <p className="text-light-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                    The ultimate hub for developer hackathons, meetups, and conferences. 
                    Book your spot in seconds.
                </p>
                
                <SearchForm />
            </div>

            {/* SECTION 1: TRENDING (Auto-Scroll) */}
            {!query && (
                <div className="mb-24 w-full">
                    <div className="flex justify-between items-end mb-8 px-4 max-w-7xl mx-auto">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Flame className="text-orange-500" size={24} />
                            </div>
                            <h2 className="text-2xl font-bold font-schibsted-grotesk text-white">Trending Now</h2>
                        </div>
                        <Link href="/#all-events" className="text-sm text-primary flex items-center gap-1 hover:gap-2 transition-all">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    
                    {/* The Infinite Carousel */}
                    <TrendingCarousel events={trendingEvents} />
                </div>
            )}

            {/* SECTION 2: ALL EVENTS (Grid) */}
            <div id="all-events" className="space-y-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-bold font-schibsted-grotesk border-l-4 border-primary pl-4 text-white">
                        {query ? `Search Results for "${query}"` : "All Upcoming Events"}
                    </h3>
                    <div className="h-[1px] flex-1 bg-white/10"></div>
                </div>

                {allEvents && allEvents.length > 0 ? (
                    <ul className="grid md:grid-cols-3 gap-8 sm:grid-cols-2 grid-cols-1">
                        {allEvents.map((event: IEvent) => (
                            <li key={event._id as string} className="list-none">
                                <EventCard {...event} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-dark-200 rounded-full flex items-center justify-center text-3xl mb-4 grayscale opacity-50">
                            🔍
                        </div>
                        <h4 className="text-xl font-bold text-white">No matches found</h4>
                        <p className="text-gray-400 mt-2">Try adjusting your search for "{query}"</p>
                    </div>
                )}
            </div>
        </section>
    )
}