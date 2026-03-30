"use client";

import { deleteEvent } from "@/lib/actions/event.actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function DeleteEventBtn({ slug }: { slug: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure? This cannot be undone.");
    if (!confirmed) return;

    setIsDeleting(true);
    const res = await deleteEvent(slug);
    
    if (res?.success) {
      router.push("/");
    } else {
      alert(res?.error || "Failed to delete");
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex items-center gap-2 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
    >
      <Trash2 size={16} />
      {isDeleting ? "Deleting..." : "Delete Event"}
    </button>
  );
}