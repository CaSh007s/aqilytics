"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MapPin, TrendingUp, Activity } from "lucide-react";
import AtmosphericBackground from "@/components/dashboard/AtmosphericBackground";
import { getSession, User } from "@/services/auth";

export default function DashboardHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getSession().then((session) => {
      if (!session) {
        router.push("/login?redirect=/dashboard");
      } else {
        setUser(session);
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  // Mock "Latest Analysis" - In a real app, fetch from backend history
  const latestAnalysis = {
    city: "Shanghai",
    aqi: 142,
    category: "Unhealthy for Sensitive Groups",
    trend: "rising", // rising, falling, stable
  };

  return (
    <div className="relative w-full min-h-screen p-8 md:p-12 overflow-hidden">
      <AtmosphericBackground />

      <div className="relative z-10 max-w-5xl mx-auto space-y-12 pt-10">
        {/* Welcome & Hero Summary Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Greeting */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-light text-white tracking-tight">
              Welcome back,{" "}
              <span className="font-medium text-sky-400">
                {user?.username || "Researcher"}
              </span>
            </h1>
            <p className="text-slate-400 text-lg">
              Here is the status of your most recent investigation.
            </p>
          </div>

          {/* Hero Card */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-8 md:p-10 shadow-2xl shadow-sky-900/10 group">
            <div className="absolute top-0 right-0 p-px">
              <div className="w-32 h-32 bg-sky-500/10 blur-3xl rounded-full" />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              {/* Left: City & Metrics */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-slate-400 uppercase tracking-widest text-xs font-semibold">
                  <Activity className="w-4 h-4 text-sky-500" />
                  Latest Analysis
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
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/50 border border-slate-800/50 text-slate-400 text-sm">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  <span>Trend is {latestAnalysis.trend}</span>
                </div>

                <Link href="/agent" className="w-full md:w-auto">
                  <button className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium transition-all shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 group/btn">
                    Run New Analysis
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
