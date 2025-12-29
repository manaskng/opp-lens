import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createEvent } from "@/lib/actions/event.actions";
import { ImagePlus, Calendar, MapPin, Tag, List } from "lucide-react";

const input =
  "w-full bg-dark-200 border border-border-dark rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-primary outline-none transition";
const label = "text-sm font-medium text-light-100 mb-2 block";

export default async function CreateEventPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <section className="max-w-5xl mx-auto px-4 py-14">
      {/* Header */}
      <div className="mb-14 text-center">
        <span className="inline-block mb-4 px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          Host an Event
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Create Your Event
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Share knowledge, build community, and bring developers together.
        </p>
      </div>

      <form action={createEvent} className="space-y-14">
        {/* SECTION: STORY */}
        <div className="glass rounded-2xl border border-dark-200 p-8 space-y-6">
          <h3 className="text-xl font-bold text-white">Event Story</h3>

          <div>
            <label className={label}>Event Title</label>
            <input
              name="title"
              required
              className={input}
              placeholder="React Summit 2025"
            />
          </div>

          <div>
            <label className={label}>Short Description</label>
            <textarea
              name="description"
              rows={3}
              required
              className={input}
              placeholder="A high-impact conference for modern React developers…"
            />
          </div>

          <div>
            <label className={label}>Detailed Overview</label>
            <textarea
              name="overview"
              rows={6}
              required
              className={input}
              placeholder="What will attendees learn? Who is this for? Why should they care?"
            />
          </div>
        </div>

        {/* SECTION: IMAGE */}
        <div className="glass rounded-2xl border border-dark-200 p-8 space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ImagePlus size={20} /> Event Cover
          </h3>

          <label className="group relative flex flex-col items-center justify-center border-2 border-dashed border-border-dark rounded-2xl p-10 cursor-pointer hover:border-primary transition">
            <ImagePlus className="text-gray-400 mb-3 group-hover:text-primary" size={32} />
            <p className="text-sm text-gray-400">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG — recommended 16:9
            </p>

            <input
              type="file"
              name="image"
              accept="image/*"
              required
              className="hidden"
            />
          </label>
        </div>

        {/* SECTION: LOGISTICS */}
        <div className="glass rounded-2xl border border-dark-200 p-8 space-y-8">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar size={20} /> Logistics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={label}>Date</label>
              <input type="date" name="date" required className={input} />
            </div>

            <div>
              <label className={label}>Time</label>
              <input type="time" name="time" required className={input} />
            </div>

            <div>
              <label className={label}>Mode</label>
              <select name="mode" className={input}>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className={label}>Target Audience</label>
              <input
                name="audience"
                required
                className={input}
                placeholder="Students, Senior Devs, Founders"
              />
            </div>

            <div>
              <label className={label}>City / Region</label>
              <input
                name="location"
                required
                className={input}
                placeholder="San Francisco, CA"
              />
            </div>

            <div>
              <label className={label}>Venue</label>
              <input
                name="venue"
                required
                className={input}
                placeholder="Moscone Center, Hall B"
              />
            </div>
          </div>
        </div>

        {/* SECTION: CONTENT */}
        <div className="glass rounded-2xl border border-dark-200 p-8 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <List size={20} /> Agenda & Tags
          </h3>

          <div>
            <label className={label}>Agenda (one per line)</label>
            <textarea
              name="agenda"
              rows={5}
              required
              className={input}
              placeholder="09:00 – Opening Keynote&#10;10:00 – Advanced React Patterns"
            />
          </div>

          <div>
            <label className={label}>Tags</label>
            <input
              name="tags"
              required
              className={input}
              placeholder="React, Next.js, AI, Networking"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            className="px-10 py-4 rounded-xl bg-primary text-black font-bold text-lg hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(89,222,202,0.35)]"
          >
            Publish Event 🚀
          </button>
        </div>
      </form>
    </section>
  );
}
