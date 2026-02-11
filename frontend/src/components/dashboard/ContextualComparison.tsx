"use client";

import { motion } from "framer-motion";

interface ContextualComparisonProps {
  pollutant: string;
  value: number;
}

// WHO Daily Limits (approximate for demo)
const WHO_LIMITS: Record<string, number> = {
  "PM2.5": 15,
  PM10: 45,
  NO2: 25,
  O3: 100, // 8-hour mean
  SO2: 40,
};

export default function ContextualComparison({
  pollutant,
  value,
}: ContextualComparisonProps) {
  const limit = WHO_LIMITS[pollutant] || 50;
  const percentage = Math.min((value / (limit * 2)) * 100, 100); // Cap at 200% of limit for visual
  const isSafe = value <= limit;

  return (
    <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md flex flex-col justify-center">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
        WHO Guideline Comparison
      </h3>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-2xl font-mono text-white">{value}</span>
            <span className="text-xs text-slate-500 ml-1">µg/m³</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Safety Limit</span>
            <span className="text-lg font-mono text-slate-300">{limit}</span>
          </div>
        </div>

        {/* The Bar */}
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
          {/* The Limit Marker */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-white z-10 left-1/2" />

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${isSafe ? "bg-emerald-500" : "bg-rose-500"}`}
          />
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Current {pollutant} levels are{" "}
          <span className={isSafe ? "text-emerald-400" : "text-rose-400"}>
            {isSafe ? "within" : "exceeding"}
          </span>{" "}
          the recommended {limit} µg/m³ threshold set by WHO guidelines for
          24-hour exposure.
        </p>
      </div>
    </div>
  );
}
