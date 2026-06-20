"use client";

import { useEffect, useState } from "react";
import { getNewSinceLastVisit, recordLastVisit } from "@/lib/actions/opportunity.actions";
import { Sparkles } from "lucide-react";

export default function NewBadge({ email }: { email?: string | null }) {
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    async function fetchNew() {
      if (email) {
        const count = await getNewSinceLastVisit(email);
        setNewCount(count);
        
        // After fetching, record that they visited today
        await recordLastVisit(email);
      }
    }
    fetchNew();
  }, [email]);

  if (newCount === 0) return null;

  return (
    <div className="flex items-center gap-2 bg-primary/20 text-primary border border-primary/30 px-3 py-1.5 rounded-full text-sm font-bold animate-pulse">
      <Sparkles size={16} />
      <span>{newCount} New Opportunities</span>
    </div>
  );
}
