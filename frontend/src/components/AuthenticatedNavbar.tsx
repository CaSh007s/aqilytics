"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Wind,
  CloudFog,
  CloudRain,
  Droplets,
  Sun,
  AlertTriangle,
  LogOut,
  Settings,
  User as UserIcon,
  LayoutDashboard,
  Search,
  Shield,
  BarChart,
} from "lucide-react";
import { AQIResponse } from "@/services/api";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getSession, logout, User } from "@/services/auth";

interface AuthenticatedNavbarProps {
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

// Role-based Navigation Configuration
const NAV_CONFIG = {
  User: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Agent", href: "/agent", icon: Search },
  ],
  Admin: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Agent", href: "/agent", icon: Search },
    { label: "Admin Panel", href: "/admin", icon: Shield },
  ],
  Analyst: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Agent", href: "/agent", icon: Search },
    { label: "Analytics", href: "/analytics", icon: BarChart },
  ],
};

function getRoleBadgeStyle(role: string) {
  switch (role.toLowerCase()) {
    case "admin":
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    case "analyst":
      return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    default:
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }
}

export default function AuthenticatedNavbar({
  variant = "dashboard",
  activePollutant,
  onSelectPollutant,
  data,
  onRiskClick,
  onReportClick,
}: AuthenticatedNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSession().then((userData) => setUser(userData));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoClick = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  const handleLogout = async () => {
    await logout();
    // Force specific redirect to landing page if logout utility behavior is different
    window.location.href = "/";
  };

  const currentRole = user?.role || "User";
  const navItems =
    NAV_CONFIG[currentRole as keyof typeof NAV_CONFIG] || NAV_CONFIG.User;

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

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              onClick={() => setShowDropdown(!showDropdown)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 hover:border-slate-500 transition-colors overflow-hidden"
            >
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.username?.[0]?.toUpperCase() || (
                  <UserIcon className="w-4 h-4" />
                )}
              </div>
            </motion.button>

            <AnimatePresence>
              {showDropdown && user && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-64 p-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 origin-top-right overflow-hidden ring-1 ring-white/5"
                >
                  {/* Identity Section */}
                  <div className="px-3 py-3 mb-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/20">
                        {user.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">
                          {user.username}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {user.email || "No email"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(
                          user.role,
                        )} transition-colors`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-white/5 my-1" />

                  {/* Actions */}
                  <div className="flex flex-col gap-1 p-1">
                    <button className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2 transition-all group">
                      <Settings className="w-4 h-4 text-slate-400 group-hover:text-sky-400 transition-colors" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-left text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 transition-all group"
                    >
                      <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </motion.nav>
  );
}
