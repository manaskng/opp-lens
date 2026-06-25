import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import LightRays from "@/components/LightRays";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Suspense } from "react"; 
import ScrollToTop from "@/components/ScrollToTop";

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OppLens",
  description: "syncing events made easy",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${schibstedGrotesk.variable} ${martianMono.variable} antialiased min-h-screen bg-dark-100 text-white`}
        suppressHydrationWarning
      >
        {/* 2. Wrap Navbar in Suspense. fallback is what shows while loading */}
        <Suspense fallback={<div className="h-16 w-full glass fixed top-0 z-50 opacity-50" />}>
          <Navbar />
        </Suspense>

        <div className="absolute inset-0 top-0 z-[-1] min-h-screen pointer-events-none">
          <LightRays
            raysOrigin="top-center-offset"
            raysColor="#5dfeca"
            raysSpeed={0.5}
            lightSpread={0.9}
            rayLength={1.4}
            followMouse={true}
            mouseInfluence={0.02}
            className="custom-rays"
          />
        </div>
        
        <main className="relative z-0 pt-24">
        {children}
    </main>
    <ScrollToTop />
      </body>
    </html>
  );
}