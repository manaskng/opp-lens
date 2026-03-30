"use client";

import { useState } from "react";
import { createBooking } from "@/lib/actions/booking.actions";
import { Loader2, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  eventId: string;
  slug: string;
  email: string;
  isSoldOut: boolean;
}

export default function BookEventBtn({ eventId, slug, email, isSoldOut }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleBooking = async () => {
    setIsLoading(true);
    setError("");

    // Call the server action
    const result = await createBooking({ eventId, slug, email });

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      // Success: Redirect to profile ticket wallet
      router.push("/profile");
    }
  };

  //  SOLD OUT STATE
  if (isSoldOut) {
    return (
        <button disabled className="w-full py-4 bg-gray-800 text-gray-500 font-bold rounded-xl cursor-not-allowed border border-white/5 flex items-center justify-center gap-2">
            🚫 Event Sold Out
        </button>
    );
  }

  // 2. ACTIVE STATE
  return (
    <div className="w-full">
        {/* Error Message (e.g. "You already booked this") */}
        {error && (
            <div className="mb-3 p-3 text-xs bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-center font-medium animate-pulse">
                {error}
            </div>
        )}
        
        <button 
            onClick={handleBooking}
            disabled={isLoading}
            className="w-full py-4 bg-primary text-black font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(89,222,202,0.4)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
        >
            {isLoading ? (
                <>
                    <Loader2 size={20} className="animate-spin" /> Securing Spot...
                </>
            ) : (
                <>
                    <Ticket size={20} /> Book Ticket Now
                </>
            )}
        </button>
        
        <p className="text-center text-[10px] text-gray-500 mt-3 uppercase tracking-wider font-mono">
            Atomic Booking Enabled • Instant Confirmation
        </p>
    </div>
  );
}