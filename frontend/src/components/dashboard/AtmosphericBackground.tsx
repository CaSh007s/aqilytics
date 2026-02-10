"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AtmosphericBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="fixed inset-0 bg-slate-950 -z-50" />;

  return (
    <div className="fixed inset-0 bg-slate-950 -z-50 overflow-hidden pointer-events-none">
      {/* 1. Base Gradient (Deep Muted) */}
      <div className="absolute inset-0 bg-radial-[circle_at_center_var(--tw-gradient-stops)] from-slate-900 via-slate-950 to-black opacity-80" />

      {/* 2. Noise Texture (Grain) - Static but adds texture */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 3. Drifting Air Currents (Slow moving blobs) */}
      <motion.div
        animate={{
          x: [-20, 20, -20],
          y: [-20, 20, -20],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px]"
      />

      <motion.div
        animate={{
          x: [30, -30, 30],
          y: [30, -30, 30],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-sky-900/10 rounded-full blur-[100px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-800/20 rounded-full blur-[150px]"
      />
    </div>
  );
}
