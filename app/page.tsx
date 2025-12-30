import { auth } from "@/auth"; 
import { getUserOnboarding } from "@/lib/actions/user.actions"; 
import EventCard from "@/components/EventCard";
import SearchForm from "@/components/SearchForm";
import TrendingCarousel from "@/components/TrendingCarousel"; 
import { getAllEvents, getUpcomingEvents, getRecommendedEvents } from "@/lib/actions/event.actions";
import { IEvent } from "@/database/event.model";
import Link from "next/link";
import { Sparkles, Clock, Settings, Flame, SearchX } from "lucide-react"; 

export default async function Page({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
    const { query } = await searchParams;
    const session = await auth();

    // --- 1. SMART RECOMMENDATION LOGIC ---
    let userInterests = "Tech"; 
    let hasInterests = false;

    if (session) {
        const user = await getUserOnboarding();
        if (user?.interests && user.interests.length > 0) {
            userInterests = user.interests[0]; 
            hasInterests = true;
        }
    }

    // --- 2. DATA FETCHING ---
    // We always fetch 'allEvents' based on the query. 
    // If query is empty, it returns latest events. If query exists, it returns search results.
    const allEvents = await getAllEvents({ query: query || '', limit: 10 });
    
    // Only fetch extras if we are NOT searching (Optimization)
    const upcomingEvents = !query ? await getUpcomingEvents(6) : [];
    const recommendedEvents = !query ? await getRecommendedEvents({ topic: userInterests, limit: 3 }) : [];
    
    // Greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    return (
        <section className="pb-20 relative px-4 overflow-hidden">
            
            {/* HERO HEADER (Always Visible) */}
            <div className="relative z-10 text-center pt-16 pb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-6 animate-fade-in backdrop-blur-sm">
                   <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                   </span>
                   {greeting}, {session?.user?.name || "Builder"}.
                </div>

                <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 mb-6 tracking-tight">
                    Don't just code. <br /> <span className="text-primary">Connect.</span>
                </h1>
                <SearchForm />
            </div>

            {/* --- LOGIC BRANCHING --- */}
            
            {query ? (
                // 🔍 VIEW A: SEARCH RESULTS
                <div className="max-w-7xl mx-auto mt-8">
                    <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                        Results for <span className="text-primary">"{query}"</span>
                    </h2>

                    {allEvents.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {allEvents.map((event: IEvent) => (
                                <div key={event._id as string}>
                                    <EventCard {...event} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
                            <SearchX size={48} className="text-gray-600 mb-4" />
                            <h3 className="text-xl font-bold text-white">No matches found</h3>
                            <p className="text-gray-400 mt-2">Try searching for "React", "AI", or "London".</p>
                            <Link href="/" className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-bold transition-all">
                                Clear Search
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                // 🏠 VIEW B: SMART DASHBOARD (Default)
                <>
                    {/* Trending Section */}
                    {upcomingEvents.length > 0 && (
                        <div className="mb-24 w-full animate-fade-in-up">
                            <div className="flex justify-between items-end mb-8 px-4 max-w-7xl mx-auto">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <Clock className="text-blue-400" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold font-schibsted-grotesk text-white">Happening Soon</h2>
                                        <p className="text-sm text-gray-400">Urgent events closing soon</p>
                                    </div>
                                </div>
                            </div>
                            <TrendingCarousel events={upcomingEvents} />
                        </div>
                    )}

                    <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
                        
                        {/* Main Feed */}
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

                        {/* RELEVANCE SIDEBAR */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="sticky top-24">
                                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                                    <div className="flex items-center gap-2">
                                        <Flame className="text-orange-500" size={20} />
                                        <div>
                                            <h3 className="text-lg font-bold text-white">For You</h3>
                                            <p className="text-xs text-gray-400">Based on "{userInterests}"</p>
                                        </div>
                                    </div>
                                    <Link href="/profile/edit" title="Edit Interests" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                        <Settings size={16} className="text-gray-400" />
                                    </Link>
                                </div>

                                <div className="flex flex-col gap-6">
                                    {recommendedEvents.length > 0 ? recommendedEvents.map((event: IEvent) => (
                                        <div key={event._id as string} className="scale-95 origin-left">
                                            <EventCard {...event} />
                                        </div>
                                    )) : (
                                        <div className="p-6 text-center border border-dashed border-white/10 rounded-xl">
                                            <p className="text-gray-500 text-sm mb-4">No events found for "{userInterests}".</p>
                                            <Link href="/profile/edit" className="text-primary text-xs font-bold hover:underline">Change Interests</Link>
                                        </div>
                                    )}
                                </div>
                                
                                {!hasInterests && (
                                    <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10 text-center">
                                        <h4 className="font-bold text-white mb-2">Want better picks?</h4>
                                        <p className="text-sm text-gray-300 mb-4">Add your interests to get a curated feed.</p>
                                        <Link href="/profile/edit" className="text-xs font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
                                            Personalize Feed
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </section>
    )
}