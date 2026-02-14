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
  LogOut,
  LayoutDashboard,
  Search,
  MapPin, // Added for location button
} from "lucide-react";
import { AQIResponse } from "@/services/api";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface NavbarProps {
  variant?: "agent" | "dashboard";
  // Agent-specific props
  activePollutant?: string | null;
  onSelectPollutant?: (key: string) => void;
  data?: AQIResponse | null;
  onRiskClick?: () => void;
  onReportClick?: () => void;
}

const pollutantItems = [
  { key: "PM2.5", label: "PM2.5", icon: CloudFog },
  { key: "PM10", label: "PM10", icon: Wind },
  { key: "NO2", label: "NO₂", icon: CloudRain },
  { key: "Ozone", label: "O₃", icon: Sun },
  { key: "SO2", label: "SO₂", icon: Droplets },
  // { key: "CO", label: "CO", icon: Flame }, // Example addition if needed
];

function getTrendIcon() {
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

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Agent", href: "/agent", icon: Search },
];

export default function Navbar({
  variant = "dashboard",
  activePollutant,
  onSelectPollutant,
  data,
  onRiskClick,
  onReportClick,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogoClick = () => {
    router.push("/");
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // Route using coordinates
        router.push(`/dashboard?lat=${lat}&lon=${lon}`);
      },
      () => {
        alert("Location permission denied.");
      },
    );
  };

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1.5 rounded-full bg-slate-950/80 border border-white/10 backdrop-blur-md shadow-2xl shadow-sky-900/10 hover:shadow-sky-900/20 transition-all"
    >
      {/* Logo */}
      <motion.div
        onClick={handleLogoClick}
        whileHover={{ scale: 1.05, textShadow: "0 0 8px rgba(56,189,248,0.5)" }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-3 border-r border-white/10 pr-3 mr-1 cursor-pointer"
      >
        <span className="font-bold text-white tracking-[0.2em] text-xs transition-all">
          AQILYTICS
        </span>
      </motion.div>

      {/* === AGENT LAYOUT: Pollutant Tabs === */}
      {variant === "agent" && data && onSelectPollutant && (
        <>
          {pollutantItems.map((item) => {
            const isActive = activePollutant === item.key;
            // Provide a default value if data.pollutants is missing specific key
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
                className={`relative group flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                  isActive
                    ? "text-sky-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${getRiskColor(
                    value,
                  )} shadow-[0_0_8px_currentColor] opacity-80`}
                />
                <span className="text-xs font-medium tabular-nums tracking-wide">
                  {item.label}
                  <span className="ml-1.5 opacity-70">{value}</span>
                </span>
                {getTrendIcon()}

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

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Risk & Report Actions */}
          <motion.button
            onClick={onRiskClick}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-slate-400 hover:text-rose-400 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-bold tracking-wider hidden sm:inline">
              Risk
            </span>
          </motion.button>

          <motion.button
            onClick={onReportClick}
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

          {/* Agent Exit Action */}
          <motion.button
            onClick={() => router.push("/dashboard")}
            whileHover={{
              backgroundColor: "rgba(255,255,255,0.05)",
              color: "#fff",
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-slate-400 hover:text-slate-300 transition-colors border-l border-white/10 ml-1 pl-4"
            title="Exit Agent"
          >
            <LogOut className="w-3.5 h-3.5 rotate-180" />
          </motion.button>
        </>
      )}

      {/* === DASHBOARD LAYOUT: Navigation Links === */}
      {variant === "dashboard" && (
        <>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "text-sky-400 bg-sky-500/10"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </motion.div>
              </Link>
            );
          })}

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Location Button (Replaces User Dropdown) */}
          <motion.button
            onClick={requestLocation}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-slate-400 hover:text-sky-400 transition-colors border border-transparent hover:border-sky-500/20"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">Use My Location</span>
          </motion.button>
        </>
      )}
    </motion.nav>
  );
}
