"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  TrendingUp,
  Activity,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import AtmosphericBackground from "@/components/dashboard/AtmosphericBackground";
import Navbar from "@/components/Navbar";
import { fetchAQIByCoords } from "@/services/api";
// import { getSession, User } from "@/services/auth";

interface Analysis {
  city: string;
  aqi: number;
  category: string;
  timestamp: string;
  trend: string;
}

interface Insight {
  message: string;
  color: string;
}

interface ActivityItem {
  id: number;
  city: string;
  aqi: number;
  category: string;
  timestamp: string;
}

export default function DashboardHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  // User state removed
  const searchParams = useSearchParams();
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");
  const [showAllActivity, setShowAllActivity] = useState(false);
  // State for mock data
  const [latestAnalysis, setLatestAnalysis] = useState<Analysis | null>(null);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Artificial minimum load time to prevent flicker
    const minLoadTime = new Promise((resolve) => setTimeout(resolve, 800));

    // Simulating open access load
    minLoadTime.then(() => {
      // If we have coordinates, fetch real data
      if (latParam && lonParam) {
        setLoading(true);
        fetchAQIByCoords(parseFloat(latParam), parseFloat(lonParam))
          .then((data) => {
            const analysis: Analysis = {
              city: data.city,
              aqi: data.current_aqi,
              category: data.aqi_category,
              timestamp: new Date().toISOString(),
              trend: "stable", // API doesn't return trend yet
            };
            setLatestAnalysis(analysis);
            setIsStale(false);

            // Generate insight based on fresh data
            if (analysis.aqi > 150)
              setInsight({
                message: "Exposure risk elevated. Limit outdoor exertion.",
                color: "text-orange-300 bg-orange-500/10 border-orange-500/20",
              });
            else if (analysis.aqi > 100)
              setInsight({
                message:
                  "Air quality is fair, but sensitive groups should take care.",
                color: "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
              });
            else
              setInsight({
                message: "Air quality is optimized for outdoor activity.",
                color:
                  "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
              });

            setLoading(false);
          })
          .catch((err) => {
            console.error("Failed to fetch dashboard data", err);
            // Fallback to empty state or mock?
            // For now, let's just clear loading so empty state shows
            setLoading(false);
          });
        return;
      }

      // Fallback Mock Data only if no coordinates (or initial load without params)
      // Actually, if no params, we probably want to show "Use Location" empty state,
      // so we might NO-OP here or just set loading false.
      if (!latParam && !lonParam) {
        // We can keep the mock data for demonstration if user just goes to /dashboard directly,
        // OR purely rely on empty state. User said "Dashboard should extract coordinates... If no params exist -> show location prompt UI."
        // The empty state hero in the current code (lines 405+) is a "Ready for first investigation" prompt.
        // Maybe we just set loading false and let it render empty?
        // BUT the mock data was "Simulating open access load".
        // To strictly follow "If no params exist -> show location prompt UI", I should NOT load mock data.
        // So I will just set loading false.
        setLoading(false);
      }
    });
  }, [router, latParam, lonParam]);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (loading) {
    return (
      <div className="relative w-full min-h-screen p-8 md:p-12 overflow-hidden bg-slate-950">
        <AtmosphericBackground />
        <div className="relative z-10 max-w-5xl mx-auto space-y-12 pt-10">
          {/* Greeting Skeleton */}
          <div className="space-y-4 animate-pulse">
            <div className="h-10 w-96 bg-slate-800/50 rounded-lg"></div>
            <div className="h-6 w-64 bg-slate-800/30 rounded-lg"></div>
          </div>

          {/* Hero Card Skeleton - Precise Dimension Match */}
          <div className="rounded-3xl bg-slate-900/40 border border-slate-800/50 p-10 h-80 animate-pulse flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-4 w-32 bg-slate-800/50 rounded-full"></div>
              <div className="h-10 w-64 bg-slate-800/50 rounded-xl"></div>
              <div className="h-16 w-32 bg-slate-800/50 rounded-xl"></div>
            </div>
            <div className="self-end h-14 w-48 bg-slate-800/50 rounded-xl"></div>
          </div>

          {/* Metrics Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-slate-900/40 border border-slate-800/50 animate-pulse p-6 space-y-3"
              >
                <div className="h-3 w-24 bg-slate-800/50 rounded-full"></div>
                <div className="h-10 w-16 bg-slate-800/50 rounded-lg"></div>
              </div>
            ))}
          </div>

          {/* Activity Skeleton - List Style */}
          <div className="space-y-6">
            <div className="h-8 w-48 bg-slate-800/50 rounded-lg animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-slate-900/40 border border-slate-800/50 animate-pulse flex items-center justify-between p-5"
                >
                  <div className="flex items-center gap-6 w-full">
                    <div className="w-1.5 h-12 bg-slate-800 rounded-full" />
                    <div className="space-y-2 w-1/3">
                      <div className="w-24 h-5 bg-slate-800 rounded" />
                      <div className="w-16 h-4 bg-slate-800/60 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getAQIStyles = (aqi: number) => {
    if (aqi > 200) {
      return {
        bg: "bg-purple-500/10",
        border: "border-purple-500/30",
        text: "text-purple-400",
        badge: "bg-purple-500/10 text-purple-400",
        shadow: "shadow-[0_0_10px_rgba(168,85,247,0.4)]",
      };
    } else if (aqi > 150) {
      return {
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        text: "text-red-400",
        badge: "bg-red-500/10 text-red-400",
        shadow: "shadow-[0_0_10px_rgba(239,68,68,0.4)]",
      };
    } else if (aqi > 100) {
      return {
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
        text: "text-orange-400",
        badge: "bg-orange-500/10 text-orange-400",
        shadow: "shadow-[0_0_10px_rgba(249,115,22,0.4)]",
      };
    } else if (aqi > 50) {
      return {
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/30",
        text: "text-yellow-400",
        badge: "bg-yellow-500/10 text-yellow-400",
        shadow: "shadow-[0_0_10px_rgba(234,179,8,0.4)]",
      };
    } else {
      return {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        text: "text-emerald-400",
        badge: "bg-emerald-500/10 text-emerald-400",
        shadow: "shadow-[0_0_10px_rgba(16,185,129,0.4)]",
      };
    }
  };

  return (
    <div className="relative w-full min-h-screen p-8 md:p-12 overflow-hidden">
      <Navbar variant="dashboard" />
      <AtmosphericBackground />

      {/* Subtle Breathing Glow Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-radial-gradient from-sky-500/5 via-transparent to-transparent opacity-50 animate-[pulse_8s_ease-in-out_infinite]" />

      <div className="relative z-10 max-w-5xl mx-auto pt-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-16" // Increased spacing for breathing room
        >
          {/* Simple Top Nav */}
          <div className="flex justify-end mb-4">
            <Link
              href="/agent"
              className="text-slate-500 hover:text-sky-400 text-sm font-medium transition-colors flex items-center gap-2"
            >
              Go to Agent <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Welcome & Hero Summary Panel */}
          <motion.div variants={containerVariants} className="space-y-10">
            {/* Greeting */}
            <motion.div variants={itemVariants} className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-light text-white tracking-tight">
                Welcome back,{" "}
                <span className="font-medium text-sky-400">Researcher</span>
              </h1>
              <p className="text-slate-400 text-lg">
                Here is the status of your most recent investigation.
              </p>

              {/* Insight Strip */}
              {latestAnalysis && insight && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border w-fit mt-4 ${insight.color}`}
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span className="text-xs font-medium tracking-wide">
                    {insight.message}
                  </span>
                </motion.div>
              )}
            </motion.div>

            {/* Hero Card - Conditional Rendering */}
            {latestAnalysis ? (
              <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-2xl p-8 md:p-10 shadow-2xl shadow-sky-900/20 group transition-all duration-500 hover:shadow-sky-500/10 hover:border-slate-600/80"
              >
                <div className="absolute top-0 right-0 p-px">
                  <div className="w-32 h-32 bg-sky-500/10 blur-3xl rounded-full group-hover:bg-sky-500/20 transition-colors duration-700" />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  {/* Left: City & Metrics */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-slate-400 uppercase tracking-widest text-xs font-semibold">
                      <Activity className="w-4 h-4 text-sky-500" />
                      Latest Analysis
                      <span className="text-slate-600 px-2">•</span>
                      <span className="text-slate-500 normal-case tracking-normal font-medium">
                        {isStale ? "Data > 24h old" : "Updated just now"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-3xl font-medium text-white flex items-center gap-3">
                        <MapPin className="w-6 h-6 text-slate-500" />
                        {latestAnalysis.city}
                      </h2>
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-5xl font-thin text-white">
                          {latestAnalysis.aqi}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                            AQI Score
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              latestAnalysis.aqi > 100
                                ? "text-orange-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {latestAnalysis.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions & Trend */}
                  <div className="flex flex-col items-end gap-6 w-full md:w-auto">
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/50 border border-slate-800/50 text-slate-400 text-sm group-hover:border-slate-700 transition-colors">
                        <TrendingUp className="w-4 h-4 text-orange-400" />
                        <span>Trend is {latestAnalysis.trend}</span>
                      </div>
                      {isStale && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-1.5 text-xs text-amber-400/80 font-medium bg-amber-900/10 px-2 py-1 rounded"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Fresh analysis suggested</span>
                        </motion.div>
                      )}
                    </div>

                    <Link href="/agent" className="w-full md:w-auto">
                      <button className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-sky-600/90 hover:bg-sky-500 text-white font-medium transition-all shadow-lg shadow-sky-900/20 hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 group/btn">
                        Run New Analysis
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Empty State Hero */
              <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-dashed border-slate-700/50 p-10 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-2">
                  <Sparkles className="w-8 h-8 text-sky-400" />
                </div>
                <div className="max-w-md space-y-2">
                  <h2 className="text-2xl font-light text-white">
                    Ready for your first investigation?
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Run an analysis on any city to instantly generate a
                    comprehensive air quality report and unlock the
                    dashboard&apos;s full potential.
                  </p>
                </div>
                <Link href="/agent">
                  <button className="flex items-center gap-2 px-8 py-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium transition-all shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-1">
                    Run Your First Analysis
                  </button>
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Intelligence Metrics Section */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                label: "Total Analyses Run",
                value: "42",
                desc: "Cumulative reports generated",
              },
              {
                label: "Reports Generated",
                value: "18",
                desc: "Full PDF downloads created",
              },
              {
                label: "Avg. AQI (Recent)",
                value: "92",
                desc: "Average across last 7 days",
              },
            ].map((metric) => (
              <motion.div
                key={metric.label}
                variants={itemVariants}
                className="relative group p-6 rounded-2xl bg-slate-900/30 border border-white/5 backdrop-blur-md overflow-hidden hover:bg-slate-800/40 transition-all duration-300 hover:border-white/10 hover:shadow-lg hover:shadow-sky-900/5 hover:-translate-y-1"
              >
                {/* Tooltip */}
                <div className="absolute z-20 top-2 left-1/2 -translate-x-1/2 md:top-4 md:right-4 md:left-auto md:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
                  <div className="text-[10px] text-slate-300 bg-slate-900/95 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md shadow-xl max-w-45 whitespace-normal text-center md:text-right leading-relaxed">
                    {metric.desc}
                  </div>
                </div>

                {/* Subtle Glow Gradient */}
                <div className="absolute -inset-1 bg-linear-to-r from-sky-500/0 via-sky-500/5 to-sky-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />

                {/* Content */}
                <div className="relative z-10 flex flex-col gap-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {metric.label}
                  </p>
                  <span className="text-3xl font-semibold text-white tracking-tight group-hover:text-sky-100 transition-colors">
                    {metric.value}
                  </span>
                </div>

                {/* Pulse Indicator */}
                <div className="absolute bottom-5 right-5">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-20 group-hover:opacity-40" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500/40 group-hover:bg-sky-400 transition-colors duration-500" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Activity Section */}
          <motion.div variants={containerVariants} className="space-y-8">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-light text-white tracking-wide flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-500" />
                Recent Analyses
              </h3>
              {/* Soft Gradient Divider */}
              <div className="h-px w-full bg-linear-to-r from-transparent via-slate-800/60 to-transparent" />
            </div>

            {recentActivity.length > 0 ? (
              <div className="relative">
                <AnimatePresence mode="popLayout" initial={false}>
                  {(showAllActivity
                    ? recentActivity
                    : recentActivity.slice(0, 5)
                  ).map((item, index) => {
                    const styles = getAQIStyles(item.aqi);
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        className="group relative flex flex-col md:flex-row items-start md:items-center justify-between p-5 mb-3 rounded-xl bg-slate-900/20 border border-white/5 hover:bg-slate-800/40 hover:border-sky-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-sky-900/5 hover:-translate-y-0.5"
                      >
                        <div className="flex items-center gap-6">
                          <div
                            className={`w-1.5 h-12 rounded-full ${styles.bg.replace("/10", "/80")} ${styles.shadow}`}
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-medium text-slate-200 group-hover:text-white transition-colors">
                                {item.city}
                              </h4>
                              <span
                                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${styles.badge}`}
                              >
                                {item.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {item.timestamp}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-slate-700" />
                              <span>AQI: {item.aqi}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 md:mt-0 flex items-center md:self-center w-full md:w-auto">
                          <Link
                            href={`/agent?city=${item.city}`}
                            className="w-full md:w-auto text-center text-sm font-medium text-sky-400 hover:text-white hover:bg-sky-600/20 border border-sky-500/30 hover:border-sky-500/50 px-6 py-2 rounded-lg transition-all duration-300"
                          >
                            View Report
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* View All / Collapse Control */}
                {recentActivity.length > 5 && (
                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={() => setShowAllActivity(!showAllActivity)}
                      className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-sky-400 transition-colors"
                    >
                      {showAllActivity
                        ? "Show Less"
                        : `View All (${recentActivity.length})`}
                      {showAllActivity ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-slate-600" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-slate-300">
                    No Recent Activity
                  </h4>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                    Your investigation log is empty. Start by running an
                    analysis on any city.
                  </p>
                </div>
                <Link
                  href="/agent"
                  className="text-sky-400 hover:text-sky-300 text-sm font-medium flex items-center gap-2"
                >
                  Run First Analysis <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
