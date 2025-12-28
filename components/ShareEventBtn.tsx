"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";

export default function ShareEventBtn({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation if placed inside a card
    e.stopPropagation();

    // Construct full URL
    const url = `${window.location.origin}/events/${slug}`;
    
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleShare}
      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-primary transition-all group"
      title="Copy Link"
    >
      {copied ? (
        <Check size={18} className="text-green-400" />
      ) : (
        <Share2 size={18} className="text-gray-400 group-hover:text-primary" />
      )}
    </button>
  );
}