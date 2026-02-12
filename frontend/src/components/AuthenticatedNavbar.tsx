"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Zap,
  LogOut,
  Settings,
  ChevronDown,
  User,
} from "lucide-react";
import { logout } from "@/services/auth";

export default function AuthenticatedNavbar() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Agent", href: "/agent", icon: Zap },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Area */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="group flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-shadow">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-slate-200 font-medium tracking-wide group-hover:text-white transition-colors">
              AQILYTICS
            </span>
          </Link>
        </div>

        {/* Center Navigation */}
        <div className="flex items-center gap-1 bg-slate-900/50 backdrop-blur-md px-2 py-1.5 rounded-full border border-slate-800/50 shadow-inner">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`relative px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 ${
                    isActive
                      ? "text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-slate-800 rounded-full shadow-sm"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2 text-sm font-medium">
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-slate-900/50 backdrop-blur-md border border-slate-800/50 hover:bg-slate-800/50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">
              Account
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-56 bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden z-50"
              >
                <div className="p-2 space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <div className="h-px bg-slate-800 my-1" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
