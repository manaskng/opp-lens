import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
      <h1 className="text-9xl font-bold text-white/10 font-martian-mono">404</h1>
      <h2 className="text-3xl font-bold text-white mt-4">Event Not Found</h2>
      <p className="text-gray-400 mt-2 max-w-md">
        The event you are looking for might have been removed or the link is broken.
      </p>
      <Link 
        href="/" 
        className="mt-8 bg-primary text-black font-bold px-6 py-3 rounded-full hover:bg-white transition-all"
      >
        Back to Home
      </Link>
    </div>
  );
}