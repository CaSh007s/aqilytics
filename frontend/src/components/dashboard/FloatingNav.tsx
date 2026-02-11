"use client";

import { motion } from "framer-motion";
import {
  Download,
  Wind,
  CloudFog,
  CloudRain,
  Droplets,
  Sun,
  AlertTriangle,
} from "lucide-react";
import { AQIResponse } from "@/services/api";

interface FloatingNavProps {
  onSelectPollutant: (key: string) => void;
  activePollutant: string | null;
  data: AQIResponse;
}

const navItems = [
  { key: "PM2.5", label: "PM2.5", icon: CloudFog },
  { key: "PM10", label: "PM10", icon: Wind },
  { key: "NO2", label: "NO₂", icon: CloudRain },
  { key: "Ozone", label: "O₃", icon: Sun },
  { key: "SO2", label: "SO₂", icon: Droplets },
];

function getTrendIcon(value: number) {
  // Mock trend logic for demo purposes
  const random = Math.random();
  if (random > 0.6)
    return <span className="text-emerald-400 text-[10px]">↓</span>;
  if (random > 0.3) return <span className="text-rose-400 text-[10px]">↑</span>;
  return <span className="text-slate-400 text-[10px]">→</span>;
}

function getRiskColor(value: number) {
  if (value > 150) return "bg-rose-500";
  if (value > 100) return "bg-orange-500";
  if (value > 50) return "bg-yellow-500";
  return "bg-emerald-500";
}

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
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1.5 rounded-full bg-slate-950/80 border border-white/10 backdrop-blur-md shadow-2xl shadow-sky-900/10 hover:shadow-sky-900/20 transition-shadow"
    >
      <div className="flex items-center gap-2 px-3 border-r border-white/10 pr-3 mr-1">
        <span className="font-bold text-white tracking-[0.2em] text-xs">
          AQILYTICS
        </span>
      </div>

      {navItems.map((item) => {
        const isActive = activePollutant === item.key;
        const Icon = item.icon;
        const value =
          data.pollutants[item.key as keyof typeof data.pollutants] || 0;

        return (
          <motion.button
            key={item.key}
            onClick={() => onSelectPollutant(item.key)}
            whileHover={{
              backgroundColor: "rgba(255,255,255,0.05)",
            }}
            whileTap={{ scale: 0.95 }}
            animate={{
              backgroundColor: isActive
                ? "rgba(56, 189, 248, 0.15)"
                : "transparent",
            }}
            className={`relative group flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${isActive ? "text-sky-400" : "text-slate-400 hover:text-slate-200"}`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${getRiskColor(value)} shadow-[0_0_8px_currentColor] opacity-80`}
            />
            <span className="text-xs font-medium tabular-nums tracking-wide">
              {item.label}
              <span className="ml-1.5 opacity-70">{value}</span>
            </span>
            {getTrendIcon(value)}

            {/* Active Glow */}
            {isActive && (
              <motion.div
                layoutId="nav-active"
                className="absolute inset-0 rounded-full border border-sky-500/30"
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        );
      })}

      <div className="h-4 w-[1px] bg-white/10 mx-1" />

      {/* Risk Summary Tab */}
      <motion.button
        whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-slate-400 hover:text-rose-400 transition-colors"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase font-bold tracking-wider hidden sm:inline">
          Risk
        </span>
      </motion.button>

      {/* Download Action */}
      <motion.button
        whileHover={{
          backgroundColor: "rgba(255,255,255,0.05)",
          color: "#fff",
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-slate-400 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase font-bold tracking-wider hidden sm:inline">
          Report
        </span>
      </motion.button>
    </motion.nav>
  );
}
