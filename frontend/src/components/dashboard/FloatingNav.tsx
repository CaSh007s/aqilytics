"use client";

import { motion } from "framer-motion";
import {
  Download,
  Wind,
  CloudFog,
  CloudRain,
  Droplets,
  Sun,
} from "lucide-react";

interface FloatingNavProps {
  onSelectPollutant: (key: string) => void;
  activePollutant: string | null;
  data: any; // Using any for now to speed up prototyping, will type strictly later
}

const navItems = [
  { key: "PM2.5", label: "PM2.5", icon: CloudFog },
  { key: "PM10", label: "PM10", icon: Wind },
  { key: "NO2", label: "NO₂", icon: CloudRain },
  { key: "Ozone", label: "O₃", icon: Sun },
  { key: "SO2", label: "SO₂", icon: Droplets },
];

export default function FloatingNav({
  onSelectPollutant,
  activePollutant,
  data,
}: FloatingNavProps) {
  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
      className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 rounded-full bg-slate-900/40 border border-slate-700/50 backdrop-blur-xl shadow-2xl"
    >
      <div className="flex items-center gap-1 px-2 border-r border-slate-700/50 pr-4 mr-2">
        <span className="font-bold text-white tracking-widest text-sm">
          AQILYTICS
        </span>
      </div>

      {navItems.map((item) => {
        const isActive = activePollutant === item.key;
        const Icon = item.icon;

        // Don't show if data doesn't exist for this pollutant
        // (Assuming data structure matches API response)
        // For now, we render all to match the design request of "key particulate matters"

        return (
          <motion.button
            key={item.key}
            onClick={() => onSelectPollutant(item.key)}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
            whileTap={{ scale: 0.95 }}
            animate={{
              backgroundColor: isActive
                ? "rgba(56, 189, 248, 0.2)"
                : "transparent",
              color: isActive ? "#38bdf8" : "#94a3b8",
            }}
            className="relative group flex items-center gap-2 px-4 py-2 rounded-full transition-colors"
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{item.label}</span>

            {/* Hover Glow */}
            <motion.div
              className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
              layoutId="nav-hover"
            />
          </motion.button>
        );
      })}

      <div className="h-6 w-[1px] bg-slate-700/50 mx-2" />

      <motion.button
        whileHover={{ scale: 1.05, color: "#fff" }}
        className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Report</span>
      </motion.button>
    </motion.nav>
  );
}
