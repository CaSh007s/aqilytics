"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  ChevronLeft,
  ChevronRight,
  History,
  Settings,
  LogOut,
  RefreshCw,
  User as UserIcon,
  ChevronsUp,
  Loader2,
} from "lucide-react";
import { getSession, logout, User } from "@/services/auth";
import { fetchHistory, Analysis } from "@/services/api";

function getTimeAgo(dateString: string) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  } catch {
    return "";
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [history, setHistory] = useState<Analysis[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Derived state to determine if we should show expanded view
  const isExpanded = !isCollapsed || isHovered;

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    const data = await fetchHistory();
    setHistory(data);
    setLoadingHistory(false);
  }, []);

  useEffect(() => {
    getSession().then(setUser);
    // eslint-disable-next-line
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Agent", href: "/agent", icon: Search },
  ];

  return (
    <motion.aside
      className="relative h-screen bg-slate-950/90 border-r border-white/5 flex flex-col z-50 transition-all duration-300 backdrop-blur-xl"
      initial={{ width: 260 }}
      animate={{ width: isExpanded ? 260 : 80 }}
      onMouseEnter={() => isCollapsed && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="h-20 flex items-center px-6 border-b border-white/5 relative">
        <div
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-3 cursor-pointer overflow-hidden whitespace-nowrap"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/20">
            <span className="font-bold text-white text-lg">A</span>
          </div>
          <motion.span
            animate={{
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? "auto" : 0,
            }}
            className="font-bold text-lg text-white tracking-widest"
          >
            AQILYTICS
          </motion.span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`relative flex items-center h-12 px-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-sky-500/10 text-sky-400"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <item.icon className="w-6 h-6 shrink-0" strokeWidth={1.5} />

                <motion.span
                  animate={{
                    opacity: isExpanded ? 1 : 0,
                    x: isExpanded ? 0 : -10,
                  }}
                  className="ml-4 font-medium whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>

                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sky-500 rounded-r-full"
                  />
                )}
              </div>
            </Link>
          );
        })}

        {/* History Section */}
        <div className="mt-8 mb-2 px-3 flex items-center justify-between text-slate-500">
          <div className="flex items-center gap-3 overflow-hidden">
            <History className="w-5 h-5 shrink-0" />
            <motion.span
              animate={{
                opacity: isExpanded ? 1 : 0,
                width: isExpanded ? "auto" : 0,
              }}
              className="text-xs font-bold uppercase tracking-wider whitespace-nowrap"
            >
              History
            </motion.span>
          </div>
          {isExpanded && (
            <motion.button
              onClick={loadHistory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`hover:text-sky-400 transition-colors ${loadingHistory ? "animate-spin" : ""}`}
              title="Refresh History"
            >
              {loadingHistory ? (
                <Loader2 className="w-3.5 h-3.5" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
            </motion.button>
          )}
        </div>

        <div className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-350px)] scrollbar-hide">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/agent?city=${item.city}`)}
              className="flex col px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer text-slate-400 hover:text-slate-200 transition-colors group"
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 shrink-0 transition-colors ${
                  item.current_aqi <= 50
                    ? "bg-emerald-500"
                    : item.current_aqi <= 100
                      ? "bg-yellow-500"
                      : item.current_aqi <= 150
                        ? "bg-orange-500"
                        : "bg-rose-500"
                }`}
              />
              <motion.div
                animate={{
                  opacity: isExpanded ? 1 : 0,
                  width: isExpanded ? "auto" : 0,
                }}
                className="ml-4 overflow-hidden"
              >
                <p className="text-sm font-medium truncate group-hover:text-white transition-colors">
                  {item.city}
                </p>
                <p className="text-xs text-slate-600 truncate group-hover:text-slate-500 transition-colors">
                  {getTimeAgo(item.created_at)} • AQI{" "}
                  {Math.round(item.current_aqi)}
                </p>
              </motion.div>
            </div>
          ))}
          {history.length === 0 && !loadingHistory && isExpanded && (
            <div className="px-3 py-4 text-xs text-slate-600 text-center italic">
              No recent analysis
            </div>
          )}
        </div>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-white/5 bg-black/20" ref={menuRef}>
        <AnimatePresence>
          {showUserMenu && isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: -10, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-4 right-4 mb-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl"
            >
              <div className="p-1 flex flex-col gap-1">
                <button className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors w-full text-left">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          onClick={() => isExpanded && setShowUserMenu(!showUserMenu)}
          className={`flex items-center gap-3 p-2 rounded-xl transition-all duration-200 ${isExpanded ? "hover:bg-white/5 cursor-pointer" : ""}`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-inner border border-white/10">
            {user?.username?.[0]?.toUpperCase() || (
              <UserIcon className="w-5 h-5" />
            )}
          </div>

          <motion.div
            animate={{
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? "auto" : 0,
            }}
            className="flex-1 overflow-hidden"
          >
            <p className="text-sm font-semibold text-white truncate">
              {user?.username || "Guest"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.role || "Viewer"}
            </p>
          </motion.div>

          {isExpanded && (
            <ChevronsUp
              className={`w-4 h-4 text-slate-500 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
            />
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-9 -right-3 w-6 h-6 bg-slate-800 border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:scale-110 transition-all shadow-lg z-50"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </motion.aside>
  );
}
