import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getBookingsByUser } from "@/lib/actions/booking.actions";
import { getUserOnboarding } from "@/lib/actions/user.actions"; 
import EventCard from "@/components/EventCard";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Settings, Globe, Github, Building2, Calendar, PlusCircle } from "lucide-react"; 

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [bookings, userProfile] = await Promise.all([
    getBookingsByUser(),
    getUserOnboarding()
  ]);

  return (
    // 1. WIDER PAGE CONTAINER
    <section className="mt-10 pb-20 max-w-[90rem] mx-auto px-4 md:px-8">
      
      {/* --- WIDE PROFILE HEADER --- */}
      <div className="relative glass p-8 md:p-12 rounded-[2.5rem] border border-white/10 overflow-hidden bg-gradient-to-br from-[#1a1f2e] to-black mb-16 shadow-2xl w-full">
        
        {/* Edit Button */}
        <Link 
            href="/profile/edit" 
            className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors z-20 group backdrop-blur-md"
            title="Edit Profile"
        >
            <Settings size={22} className="text-gray-400 group-hover:text-white transition-colors" />
        </Link>

        <div className="flex flex-col lg:flex-row items-start gap-10 relative z-10">
          
          {/* Avatar Area */}
          <div className="relative shrink-0 mx-auto lg:mx-0">
            <div className="h-32 w-32 md:h-44 md:w-44 rounded-full bg-gradient-to-br from-primary to-purple-600 p-[3px] shadow-[0_0_40px_rgba(89,222,202,0.3)]">
              <div className="h-full w-full rounded-full bg-black flex items-center justify-center overflow-hidden relative">
                {userProfile?.image || session.user.image ? (
                  <Image
                    src={userProfile?.image || session.user.image!}
                    alt="Profile"
                    width={176}
                    height={176}
                    className="object-cover w-full h-full"
                    priority
                  />
                ) : (
                  <span className="text-6xl font-bold text-white">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* User Info Area */}
          <div className="flex-1 w-full space-y-6 pt-2 text-center lg:text-left">
            <div>
                <h1 className="text-5xl font-bold text-white tracking-tight mb-3">
                    {userProfile?.name || session.user.name}
                </h1>
                
                {/* Meta Row */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-gray-400 text-sm md:text-base">
                    <p className="font-medium text-gray-500 mr-2">{session.user.email}</p>
                    
                    {userProfile?.institution ? (
                        <div className="flex items-center gap-1.5 text-gray-300 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                             <Building2 size={14} className="text-purple-400" />
                             {userProfile.institution}
                        </div>
                    ) : (
                        <Link href="/profile/edit" className="flex items-center gap-1.5 text-gray-500 hover:text-primary bg-white/5 px-3 py-1 rounded-full border border-dashed border-white/10 transition-colors">
                             <PlusCircle size={14} /> Add Institution
                        </Link>
                    )}

                    {userProfile?.location ? (
                        <div className="flex items-center gap-1.5 text-gray-300 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                             <MapPin size={14} className="text-primary" />
                             {userProfile.location}
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Bio */}
            {userProfile?.bio ? (
                <p className="text-light-100 text-lg leading-relaxed max-w-3xl font-light lg:border-l-2 lg:border-primary/30 lg:pl-4 mx-auto lg:mx-0">
                    "{userProfile.bio}"
                </p>
            ) : (
                <p className="text-gray-600 italic lg:border-l-2 lg:border-gray-800 lg:pl-4">
                    No bio added yet.
                </p>
            )}

            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row items-center gap-6 pt-6 border-t border-white/5 w-full mt-4">
                
                {/* Social Links (Dynamic Fallback) */}
                <div className="flex gap-3">
                    {userProfile?.portfolio ? (
                        <a href={userProfile.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 transition-all text-sm font-bold text-white group">
                            <Globe size={18} className="text-gray-400 group-hover:text-primary transition-colors" /> 
                            Portfolio
                        </a>
                    ) : (
                        <Link href="/profile/edit" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-transparent border border-dashed border-gray-700 hover:border-gray-500 text-gray-500 hover:text-gray-300 transition-all text-sm font-medium">
                            <Globe size={18} /> Add Portfolio
                        </Link>
                    )}

                    {userProfile?.github ? (
                        <a href={userProfile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#24292e] hover:bg-[#2f363d] border border-transparent hover:border-white/20 transition-all text-sm font-bold text-white group shadow-lg">
                            <Github size={18} className="text-white" />
                            GitHub
                        </a>
                    ) : (
                        <Link href="/profile/edit" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-transparent border border-dashed border-gray-700 hover:border-gray-500 text-gray-500 hover:text-gray-300 transition-all text-sm font-medium">
                            <Github size={18} /> Add GitHub
                        </Link>
                    )}
                </div>

                <div className="hidden lg:block w-[1px] h-8 bg-white/10 mx-2" />

                {/* Interests */}
                {userProfile?.interests && userProfile.interests.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-2">
                        {userProfile.interests.map((tag: string) => (
                            <span key={tag} className="px-3 py-1.5 rounded-lg bg-dark-200 border border-white/10 text-xs font-bold text-gray-300 uppercase tracking-wide">
                                {tag}
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className="text-sm text-gray-600">No interests selected.</span>
                )}
            </div>
          </div>
        </div>

        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-40"></div>
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-dark-100/50 to-transparent"></div>
      </div>

      {/* --- SCHEDULE SECTION --- */}
      <div className="flex items-center gap-4 mb-10">
        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
            <Calendar className="text-primary" size={24} />
        </div>
        <h2 className="text-3xl font-bold font-schibsted-grotesk text-white">
          My Schedule
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
        <span className="text-sm text-gray-500 font-mono bg-white/5 px-3 py-1 rounded-full border border-white/5">
            {bookings.length} {bookings.length === 1 ? 'EVENT' : 'EVENTS'}
        </span>
      </div>

      {bookings.length > 0 ? (
        // 2. WIDER GRID FOR CARDS
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {bookings.map((booking: any) => {
            if (!booking.eventId) return null;

            return (
              <div key={booking._id} className="relative group w-full">
                 <div className="absolute top-3 right-3 z-20 bg-green-500/20 backdrop-blur-md border border-green-500/40 text-green-400 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                    CONFIRMED
                 </div>
                 <EventCard {...booking.eventId} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-6 bg-white/5 rounded-[2rem] border border-dashed border-white/10 text-center">
          <div className="w-20 h-20 bg-dark-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
             <Image src="/icons/calendar.svg" alt="calendar" width={32} height={32} className="opacity-40" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Your schedule is clear</h3>
          <p className="text-gray-400 max-w-sm mb-8">
            You haven't booked any events yet. Check out the "For You" section on the homepage!
          </p>
          <Link href="/" className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-colors">
            Explore Events
          </Link>
        </div>
      )}
    </section>
  );
}