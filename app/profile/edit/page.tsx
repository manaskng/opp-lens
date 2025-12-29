import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserOnboarding, updateUser } from "@/lib/actions/user.actions";
import { Save, ArrowLeft, Globe, Github, Building2 } from "lucide-react"; // Import Icons
import Link from "next/link";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await getUserOnboarding();

  return (
    <div className="max-w-3xl mx-auto mt-10 mb-20 p-8 glass rounded-3xl border border-white/10 shadow-2xl">
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
        <div>
            <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
            <p className="text-gray-400 text-sm mt-1">Update your professional details</p>
        </div>
        <Link href="/profile" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors px-4 py-2 bg-white/5 rounded-full hover:bg-white/10">
            <ArrowLeft size={16} /> Cancel
        </Link>
      </div>

      <form action={async (formData) => {
          "use server";
          await updateUser(formData);
          redirect("/profile");
      }} className="space-y-8">
        
        {/* SECTION 1: BASIC INFO */}
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full"/> Basic Info
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Institution / Company</label>
                    <div className="relative">
                        <Building2 size={16} className="absolute left-3 top-3.5 text-gray-500" />
                        <input 
                            name="institution" 
                            type="text"
                            defaultValue={user?.institution || ""}
                            placeholder="University of Delhi"
                            className="w-full bg-dark-200 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-primary outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Location</label>
                    <input 
                        name="location" 
                        type="text"
                        defaultValue={user?.location || ""}
                        placeholder="New Delhi, India"
                        className="w-full bg-dark-200 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-white">Bio</label>
                <textarea 
                    name="bio" 
                    rows={3} 
                    defaultValue={user?.bio || ""}
                    placeholder="Tell us about yourself..."
                    className="w-full bg-dark-200 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none"
                />
            </div>
        </div>

        {/* SECTION 2: SOCIAL LINKS */}
        <div className="space-y-4">
             <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full"/> Social Links
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Portfolio URL</label>
                    <div className="relative">
                        <Globe size={16} className="absolute left-3 top-3.5 text-gray-500" />
                        <input 
                            name="portfolio" 
                            type="url"
                            defaultValue={user?.portfolio || ""}
                            placeholder="https://mywebsite.com"
                            className="w-full bg-dark-200 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-primary outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">GitHub URL</label>
                    <div className="relative">
                        <Github size={16} className="absolute left-3 top-3.5 text-gray-500" />
                        <input 
                            name="github" 
                            type="url"
                            defaultValue={user?.github || ""}
                            placeholder="https://github.com/username"
                            className="w-full bg-dark-200 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-primary outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* SECTION 3: INTERESTS */}
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <span className="w-1 h-6 bg-purple-500 rounded-full"/> Interests
            </h3>
            <div className="p-4 bg-dark-200 border border-white/10 rounded-xl focus-within:border-primary transition-colors">
                <input 
                    name="interests" 
                    type="text"
                    defaultValue={user?.interests?.join(", ") || ""}
                    placeholder="React, AI, Cloud Computing..."
                    className="w-full bg-transparent border-none text-white placeholder:text-gray-600 focus:outline-none font-medium text-lg"
                />
            </div>
            <p className="text-xs text-gray-500">Separate multiple interests with commas.</p>
        </div>

        <button 
            type="submit" 
            className="w-full bg-primary hover:bg-white text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-8"
        >
            <Save size={18} />
            Save Profile
        </button>
      </form>
    </div>
  );
}