"use client";
// motion and useState removed (unused)
import InteractiveHeroTitle from "./InteractiveHeroTitle";

export default function BreathingOrb() {
  // State removed as it was unused (permission, aqi)

  // _handleGrant removed (unused)

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Background Particles (Simplified CSS for now, Three.js later) */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="z-10 text-center space-y-8">
        {/* The Title - Revealed by Fog */}
        {/* The Title - Revealed by Fog */}
        <div className="flex justify-center">
          <InteractiveHeroTitle />
        </div>

        {/* State 2: The Breathing Data */}
        {/* State 2: The Breathing Data - Temporarily removed as it was unreachable */}
      </div>
    </div>
  );
}
