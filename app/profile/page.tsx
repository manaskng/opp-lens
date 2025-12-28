import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getBookingsByUser } from "@/lib/actions/booking.actions";
import EventCard from "@/components/EventCard";
import Image from "next/image";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const bookings = await getBookingsByUser();

  return (
    <section className="mt-10">
        {/* Profile Header */}
        <div className="glass p-8 rounded-2xl border border-dark-200 flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12 relative overflow-hidden">
            {/* User Avatar */}
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-blue-500 p-1">
               <div className="h-full w-full rounded-full bg-black flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
                  {/* Show Image if available, else Initials */}
                  {session.user.image ? (
                    <Image src={session.user.image} alt="User" width={96} height={96} className="object-cover" />
                  ) : (
                    session.user.name?.charAt(0).toUpperCase()
                  )}
               </div>
            </div>

            <div className="text-center sm:text-left z-10">
                <h1 className="text-3xl font-bold text-white mb-1">{session.user.name}</h1>
                <p className="text-light-200 mb-4">{session.user.email}</p>
                <div className="inline-flex items-center gap-2 bg-dark-200 px-4 py-1.5 rounded-full border border-border-dark">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-sm font-medium text-white">{bookings.length} Events Booked</span>
                </div>
            </div>
            
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>

        {/* Bookings Grid */}
        <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold font-schibsted-grotesk text-white">My Schedule</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-800 to-transparent"></div>
        </div>
        
        {bookings.length > 0 ? (
            <div className="events grid md:grid-cols-3 gap-10 sm:grid-cols-2 grid-cols-1">
                {bookings.map((booking: any) => {
                    // Check if eventId exists (in case an event was deleted)
                    if(!booking.eventId) return null;
                    
                    return (
                        <div key={booking._id} className="relative group">
                            {/* Booking Badge */}
                            <div className="absolute top-3 right-3 z-10 bg-green-500/20 backdrop-blur-md border border-green-500/50 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                                CONFIRMED
                            </div>
                            <EventCard {...booking.eventId} />
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-dark-100 rounded-xl border border-dashed border-dark-200 text-center">
                <div className="w-16 h-16 bg-dark-200 rounded-full flex items-center justify-center mb-4">
                    <Image src="/icons/calendar.svg" alt="calendar" width={24} height={24} className="opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Bookings Yet</h3>
                <p className="text-gray-400 max-w-sm mb-6">Looks like you haven't booked any events. Explore upcoming hackathons and meetups!</p>
                <a href="/#events" className="text-primary hover:underline">Browse Events &rarr;</a>
            </div>
        )}
    </section>
  );
}