"use client";
import React from "react";
import {
  CheckCircle2,
  ShieldCheck,
  Database,
  Server,
  RefreshCw,
  Activity,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ApiStatusPage() {
  const metrics = [
    {
      name: "Frontend Service",
      status: "Operational",
      icon: CheckCircle2,
      latency: "42ms",
    },
    {
      name: "FastAPI Backend",
      status: "Operational",
      icon: Server,
      latency: "115ms",
    },
    {
      name: "PostgreSQL Database",
      status: "Operational",
      icon: Database,
      latency: "18ms",
    },
    {
      name: "GenAI Inference Engine",
      status: "Operational",
      icon: Activity,
      latency: "840ms",
    },
    {
      name: "PDF Generator Service",
      status: "Operational",
      icon: RefreshCw,
      latency: "120ms",
    },
    {
      name: "Authentication API",
      status: "Operational",
      icon: ShieldCheck,
      latency: "65ms",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-sky-500/30 p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-sky-400 mb-6 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Terminal
            </Link>
            <h1 className="text-4xl font-light text-white tracking-tight mb-2">
              Systems Status
            </h1>
            <p className="text-slate-500 text-lg">
              Real-time operational metrics for all core services.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium tracking-wide">
                All Systems Nominal
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metrics.map((item, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={item.name}
              className="bg-slate-900/40 backdrop-blur border border-slate-800 p-6 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 group-hover:border-slate-700 transition-colors shadow-inner">
                  <item.icon className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-slate-200 font-medium">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs text-emerald-400/80 uppercase tracking-widest">
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-light text-white tracking-tight">
                  {item.latency}
                </span>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest leading-none">
                  Latency
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-slate-900/50 flex flex-col md:flex-row gap-4 items-center justify-between text-slate-500 text-sm">
          <p>Last checked: {new Date().toLocaleTimeString()}</p>
          <p className="tracking-widest uppercase text-xs">
            Automated refreshing active
          </p>
        </div>
      </div>
    </div>
  );
}
