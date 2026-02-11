"use client";

import { motion } from "framer-motion";
import { BrainCircuit, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ForecastResponse } from "@/services/api";

interface PredictiveIntelligencePanelProps {
  forecast: ForecastResponse["forecast"] | null;
}

export default function PredictiveIntelligencePanel({
  forecast,
}: PredictiveIntelligencePanelProps) {
  if (!forecast || forecast.length === 0) {
    return (
      <div className="h-full min-h-75 flex items-center justify-center p-8 rounded-4xl bg-slate-900/40 border border-white/5 backdrop-blur-md">
        <p className="text-slate-500 font-mono text-sm animate-pulse">
          Initializing Predictive Model...
        </p>
      </div>
    );
  }

  // --- Analytical Logic (Mocking the AI) ---
  const aqis = forecast.map((f) => f.aqi);
  const currentAQI = aqis[0];
  const peakAQI = Math.max(...aqis);
  const minAQI = Math.min(...aqis);
  const lastAQI = aqis[aqis.length - 1];

  let trendDirection: "rising" | "falling" | "stable" = "stable";
  if (lastAQI > currentAQI + 10) trendDirection = "rising";
  else if (lastAQI < currentAQI - 10) trendDirection = "falling";

  // Generate Insight Text
  const getInsight = () => {
    if (trendDirection === "rising") {
      return "Atmospheric stability is trapping pollutants. Expect accumulation over the next 12 hours due to low wind dispersal.";
    } else if (trendDirection === "falling") {
      return "Ventilation is improving. Incoming flow is expected to clear particulate matter significantly by evening.";
    } else {
      return "Conditions are stagnant. Pollutant levels will remain persistent with minimal variance in the near term.";
    }
  };

  const getHealthProjection = () => {
    if (peakAQI > 150)
      return "High risk exposure windows predicted. Sensitive groups should limit outdoor exertion during peak hours.";
    if (peakAQI > 100)
      return "Moderate impact anticipated. General population is safe, but respiratory sensitivity may be triggered.";
    return "Favorable respiratory conditions expected for the next 24-hour cycle.";
  };

  return (
    <div className="h-full min-h-75 flex flex-col p-8 rounded-4xl bg-slate-900/40 border border-white/5 backdrop-blur-md overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">
            Predictive Intelligence
          </h3>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            AI-DRIVEN FORECAST ANALYSIS
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-indigo-400/70 font-mono bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
            CONFIDENCE: 89%
          </span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
            Trend
          </span>
          <div
            className={`flex items-center gap-1.5 ${
              trendDirection === "rising"
                ? "text-rose-400"
                : trendDirection === "falling"
                  ? "text-emerald-400"
                  : "text-sky-400"
            }`}
          >
            {trendDirection === "rising" && <TrendingUp className="w-5 h-5" />}
            {trendDirection === "falling" && (
              <TrendingDown className="w-5 h-5" />
            )}
            {trendDirection === "stable" && <Minus className="w-5 h-5" />}
            <span className="text-sm font-bold uppercase">
              {trendDirection}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
            Proj. Peak
          </span>
          <span className="text-xl font-mono text-slate-200">{peakAQI}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
            Proj. Low
          </span>
          <span className="text-xl font-mono text-slate-200">{minAQI}</span>
        </div>
      </div>

      {/* Narrative Analysis */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3"
        >
          <div className="mt-1 min-w-1 w-1 rounded-full bg-indigo-500/50" />
          <div>
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wide mb-1">
              Synopsis
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              {getInsight()}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3"
        >
          <div className="mt-1 min-w-1 w-1 rounded-full bg-emerald-500/50" />
          <div>
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wide mb-1">
              Health Projection
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              {getHealthProjection()}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
