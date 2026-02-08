"use client";
import { motion } from "framer-motion";
import { useState } from "react";

export default function BreathingOrb() {
  const [permission, setPermission] = useState(false);
  const [aqi, setAqi] = useState<number | null>(null);

  const handleGrant = () => {
    // Simulate API call for "My Location"
    setPermission(true);
    setTimeout(() => setAqi(42), 1500); // Fake "Good" AQI for demo
  };

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
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-6xl md:text-8xl font-thin tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white to-white/50"
        >
          AQILytics
        </motion.h1>

        {/* State 1: Permission */}
        {!permission && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            onClick={handleGrant}
            className="group relative px-8 py-3 bg-transparent overflow-hidden rounded-full border border-white/10 hover:border-white/30 transition-colors"
          >
            <span className="relative z-10 text-sm tracking-[0.2em] uppercase text-slate-300 group-hover:text-white transition-colors">
              Allow us to breathe your air
            </span>
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
          </motion.button>
        )}

        {/* State 2: The Breathing Data */}
        {permission && aqi && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            {/* The Orb */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} // Breathing rhythm
              className="w-48 h-48 rounded-full border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm flex items-center justify-center relative"
            >
              <div className="text-5xl font-light text-emerald-400">{aqi}</div>

              {/* Ripple Effect */}
              <div className="absolute inset-0 border border-emerald-500/20 rounded-full animate-ping opacity-20" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 text-sm text-slate-500 tracking-widest uppercase"
            >
              Kothri Kalan • Good Air
            </motion.p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
