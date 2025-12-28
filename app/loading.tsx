export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-5 py-10 mt-10">
      <h1 className="h-10 w-64 bg-white/5 rounded-lg animate-pulse mb-8 mx-auto" />
      
      <div className="grid md:grid-cols-3 gap-10 sm:grid-cols-2 grid-cols-1 mt-10">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-[400px] w-full bg-white/5 rounded-2xl animate-pulse border border-white/10" />
        ))}
      </div>
    </div>
  );
}