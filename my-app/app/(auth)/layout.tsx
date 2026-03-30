import LightRays from "@/components/LightRays";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-dark-100">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
        <LightRays
            raysOrigin="top-center"
            raysColor="#59deca"
            raysSpeed={0.2}
            lightSpread={0.5}
            rayLength={1.2}
            followMouse={true}
            mouseInfluence={0.05}
        />
      </div>

      {/* The Login/Register Card */}
      <div className="z-10 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}