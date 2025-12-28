import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import SearchForm from "@/components/SearchForm";
import TrendingCarousel from "@/components/TrendingCarousel"; 
import { getAllEvents, getUpcomingEvents, getRecommendedEvents } from "@/lib/actions/event.actions"; // Import new actions
import { IEvent } from "@/database";
import Link from "next/link";
import { ArrowRight, Flame, Sparkles, Clock } from "lucide-react";

export default async function Page({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
    
    const { query } = await searchParams;

    //  INTELLIGENT DATA FETCHING ---
    const upcomingEvents = await getUpcomingEvents(6);

    //  "Recommended" 
    const recommendedEvents = await getRecommendedEvents({ topic: 'React', limit: 3 });
    
    //  Search/All (Discovery Layer)
    const allEvents = await getAllEvents({ 
        query: query || '',
        limit: 10 
    });

    // ---  DYNAMIC GREETING ---
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    return (
        <section className="pb-20 relative px-4 overflow-hidden">
            
            {/* HERO SECTION */}
            <div className="relative z-10 text-center pt-16 pb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-6 animate-fade-in backdrop-blur-sm">
                   <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                   </span>
                   {greeting}, Builder.
                </div>

                <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 mb-6 tracking-tight">
                    Don't just code. <br /> <span className="text-primary">Connect.</span>
                </h1>
                
                <SearchForm />
            </div>

            {/* IF SEARCHING: Show clean results */}
            {query ? (
                <div id="search-results" className="space-y-8 max-w-7xl mx-auto mt-12">
                    <h3 className="text-2xl font-bold font-schibsted-grotesk text-white">
                        Results for "{query}"
                    </h3>
                    {allEvents.length > 0 ? (
                        <ul className="grid md:grid-cols-3 gap-8 sm:grid-cols-2 grid-cols-1">
                            {allEvents.map((event: IEvent) => (
                                <li key={event._id as string} className="list-none">
                                    <EventCard {...event} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-20 text-gray-500">No events found.</div>
                    )}
                </div>
            ) : (
                /* IF NOT SEARCHING: Show Intelligent Feed */
                <>
                    {/* SECTION 1: URGENCY (Happening Soon) */}
                    {upcomingEvents.length > 0 && (
                        <div className="mb-24 w-full">
                            <div className="flex justify-between items-end mb-8 px-4 max-w-7xl mx-auto">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <Clock className="text-blue-400" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold font-schibsted-grotesk text-white">Happening Soon</h2>
                                        <p className="text-sm text-gray-400">Don't miss out on these upcoming sessions</p>
                                    </div>
                                </div>
                            </div>
                            <TrendingCarousel events={upcomingEvents} />
                        </div>
                    )}

                    <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
                        
                        {/* SECTION 2: DISCOVERY (Main Feed) */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <Sparkles className="text-purple-400" size={24} />
                                </div>
                                <h3 className="text-2xl font-bold font-schibsted-grotesk text-white">Latest Drops</h3>
                            </div>

                            <ul className="grid sm:grid-cols-2 gap-6">
                                {allEvents.map((event: IEvent) => (
                                    <li key={event._id as string} className="list-none">
                                        <EventCard {...event} />
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* SECTION 3: RELEVANCE (Sidebar Recommendations) */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="sticky top-24">
                                <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                                    <Flame className="text-orange-500" size={20} />
                                    <h3 className="text-lg font-bold text-white">Recommended for You</h3>
                                </div>

                                <div className="flex flex-col gap-6">
                                    {recommendedEvents.length > 0 ? recommendedEvents.map((event: IEvent) => (
                                        // We reuse EventCard but maybe you want a "Mini" version later
                                        <div key={event._id as string} className="scale-95 origin-left">
                                            <EventCard {...event} />
                                        </div>
                                    )) : (
                                        <p className="text-gray-500 text-sm">
                                            Book more events to get personalized recommendations!
                                        </p>
                                    )}
                                </div>
                                
                                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10 text-center">
                                    <h4 className="font-bold text-white mb-2">Want better picks?</h4>
                                    <p className="text-sm text-gray-300 mb-4">Complete your profile to get AI-curated event suggestions.</p>
                                    <Link href="/profile" className="text-xs font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
                                        Update Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </section>
    )
}