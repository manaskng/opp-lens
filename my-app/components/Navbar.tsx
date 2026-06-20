import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/auth";

const Navbar = async () => {
  const session = await auth();

  return (
    <header className="fixed top-0 w-full z-50 transition-all duration-300 px-5 py-4">
      {/* Glass Container */}
      <nav className="glass max-w-5xl mx-auto rounded-full px-6 py-3 flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/10 backdrop-blur-md">
        
        {/* LEFT: Logo */}
        <Link href='/' className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 transition-transform group-hover:rotate-12">
            <Image src="/icons/logo.png" alt="logo" fill className="object-contain" />
          </div>
          <p className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            DevEvent
          </p>
        </Link>

        {/* CENTER: Nav Links (Desktop) */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-light-200">
          <li>
            <Link href="/" className="hover:text-primary transition-colors duration-200">
              Home
            </Link>
          </li>
          <li>
            <Link href="/opportunities" className="hover:text-primary transition-colors duration-200 relative pr-10">
              Opportunities 
              <span className="absolute -top-1 -right-2 bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full border border-primary/30">New</span>
            </Link>
          </li>
        </ul>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-4">
          {session && session?.user ? (
            <>
              {/* 1. Create Event Button (Icon Style) */}
              <Link 
                href="/events/create" 
                className="hidden sm:flex items-center gap-2 bg-dark-200 hover:bg-dark-100 border border-white/10 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105 active:scale-95 group"
              >
                <span className="text-primary text-lg leading-none group-hover:rotate-90 transition-transform duration-300">+</span>
                <span>Create</span>
              </Link>

              {/* 2. User Avatar (Links to Profile) */}
              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                <Link href="/profile" className="relative group">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-blue-600 p-[2px] transition-transform group-hover:scale-110 shadow-[0_0_10px_rgba(89,222,202,0.4)]">
                        <div className="h-full w-full rounded-full bg-black overflow-hidden relative">
                             {/* Initials or Image */}
                             {session.user.image ? (
                                <Image src={session.user.image} alt="user" fill className="object-cover" />
                             ) : (
                                <div className="flex items-center justify-center h-full w-full text-white font-bold text-xs">
                                    {session.user.name?.charAt(0).toUpperCase()}
                                </div>
                             )}
                        </div>
                    </div>
                </Link>

                {/* 3. Logout (Minimal Icon) */}
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button 
                    type="submit" 
                    title="Logout"
                    className="text-gray-400 hover:text-red-400 transition-colors p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Guest State */
            <Link 
              href="/login" 
              className="bg-primary hover:bg-primary/90 text-black px-5 py-2 rounded-full text-sm font-bold transition-all hover:shadow-[0_0_20px_rgba(89,222,202,0.4)] hover:-translate-y-0.5"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;