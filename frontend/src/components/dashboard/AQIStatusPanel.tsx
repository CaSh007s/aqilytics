"use client";

import { motion } from "framer-motion";

interface AQIStatusPanelProps {
  aqi: number;
  category: string;
}

export default function AQIStatusPanel({ aqi, category }: AQIStatusPanelProps) {
  // Determine color based on AQI
  let color = "text-emerald-400";
  let gradient = "from-emerald-500/20 to-transparent";

  if (aqi > 50) {
    color = "text-yellow-400";
    gradient = "from-yellow-500/20 to-transparent";
  }
  if (aqi > 100) {
    color = "text-orange-400";
    gradient = "from-orange-500/20 to-transparent";
  }
  if (aqi > 150) {
    color = "text-rose-500";
    gradient = "from-rose-500/20 to-transparent";
  }
  if (aqi > 200) {
    color = "text-purple-500";
    gradient = "from-purple-500/20 to-transparent";
  }
  if (aqi > 300) {
    color = "text-red-600";
    gradient = "from-red-900/20 to-transparent";
  }

  return (
    <div className="relative h-full min-h-75 flex items-center justify-center p-8 rounded-4xl bg-slate-900/40 border border-white/5 backdrop-blur-xl overflow-hidden group">
      {/* Ambient Glow */}
      <div
        className={`absolute inset-0 bg-radial-[circle_at_center_var(--tw-gradient-stops)] ${gradient} opacity-20 blur-3xl`}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* The Ring */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Outer pulsing ring */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-white/10"
          />
          {/* Rotating Segment */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border-t-2 border-r-2 border-white/5"
          />

          {/* Main Color Ring */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`absolute inset-6 rounded-full border-[6px] border-${color.split("-")[1]}-${color.split("-")[2]}/20`}
          />

          {/* Central Content Container - Strictly Centered via Flex */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
            {/* AQI Value with Dynamic Sizing */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={aqi} // Remount animation on value change
              className={`font-thin tracking-tighter tabular-nums leading-none ${color} drop-shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-300`}
              style={{
                fontSize:
                  aqi.toString().length <= 2
                    ? "6rem"
                    : aqi.toString().length === 3
                      ? "4rem"
                      : aqi.toString().length === 4
                        ? "3rem"
                        : "2.5rem",
              }}
            >
              {aqi}
            </motion.div>

            {/* Category Label */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-bold tracking-[0.3em] text-slate-400 mt-2 uppercase text-center max-w-[80%]"
            >
              {category}
            </motion.div>

            <div className="text-[10px] text-slate-600 tracking-widest mt-1 uppercase">
              Current AQI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
