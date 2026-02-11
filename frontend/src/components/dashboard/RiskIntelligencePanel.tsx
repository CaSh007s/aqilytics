"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Shield, Activity, X } from "lucide-react";
import { AQIResponse } from "@/services/api";

interface RiskIntelligencePanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: AQIResponse;
}

export default function RiskIntelligencePanel({
  isOpen,
  onClose,
  data,
}: RiskIntelligencePanelProps) {
  const aqi = data?.current_aqi || 0;

  // Risk Logic Helper
  const getRiskData = (aqi: number) => {
    if (aqi > 300)
      return {
        level: "CRITICAL HAZARD",
        bg: "bg-red-950/90",
        border: "border-red-500/30",
        text: "text-red-400",
        impact:
          "Emergency conditions. Health effects likely for entire population.",
        guidance: "Avoid all outdoor exertion. Use air filtration immediately.",
      };
    if (aqi > 200)
      return {
        level: "VERY UNHEALTHY",
        bg: "bg-purple-950/90",
        border: "border-purple-500/30",
        text: "text-purple-400",
        impact:
          "Significant respiratory stress predicted for sensitive groups.",
        guidance:
          "Limit outdoor exposure. Wear N95 masks if transit is necessary.",
      };
    if (aqi > 150)
      return {
        level: "UNHEALTHY",
        bg: "bg-rose-950/90",
        border: "border-rose-500/30",
        text: "text-rose-400",
        impact: "Prolonged exposure may cause discomfort and breathing issues.",
        guidance:
          "Reduce intense outdoor activities. Monitor symptoms closely.",
      };
    if (aqi > 100)
      return {
        level: "MODERATE RISK",
        bg: "bg-orange-950/90",
        border: "border-orange-500/30",
        text: "text-orange-400",
        impact:
          "Air quality is acceptable but may affect very sensitive individuals.",
        guidance: "No specific action needed for general public.",
      };
    return {
      level: "SAFE / LOW RISK",
      bg: "bg-emerald-950/90",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      impact: "Air quality is satisfactory. Minimal risk detected.",
      guidance: "Ideal conditions for outdoor activity.",
    };
  };

  const risk = getRiskData(aqi);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 top-25 z-40 flex items-end justify-center pointer-events-none px-6 pb-6">
          {/* Panel Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`pointer-events-auto w-full max-w-5xl h-[85vh] rounded-t-3xl backdrop-blur-xl border-t border-x border-white/10 shadow-2xl relative overflow-hidden flex flex-col`}
          >
            {/* Dynamic Background Tint */}
            <div
              className={`absolute inset-0 ${risk.bg} opacity-80 z-0 transition-colors duration-1000`}
            />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-8 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl bg-black/20 border border-white/10 ${risk.text}`}
                >
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-thin text-white tracking-tighter">
                    RISK INTELLIGENCE
                  </h2>
                  <span
                    className={`text-sm font-bold tracking-[0.2em] uppercase ${risk.text}`}
                  >
                    {risk.level} DETECTED
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 rounded-full bg-black/20 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Grid */}
            <div className="relative z-10 flex-1 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
              {/* Left Col: Impact & Guidance */}
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-black/20 border border-white/5">
                  <div className="flex items-center gap-3 mb-4 text-slate-300">
                    <Activity className="w-5 h-5" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">
                      Biological Impact
                    </h3>
                  </div>
                  <p className="text-xl font-light text-white leading-relaxed">
                    {risk.impact}
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-black/20 border border-white/5">
                  <div className="flex items-center gap-3 mb-4 text-slate-300">
                    <Shield className="w-5 h-5" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">
                      Recommended Actions
                    </h3>
                  </div>
                  <p className="text-xl font-light text-white leading-relaxed">
                    {risk.guidance}
                  </p>
                </div>
              </div>

              {/* Right Col: Expanded Metrics */}
              <div className="grid grid-cols-2 gap-4 content-start">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-center items-center text-center">
                  <span className="text-xs text-slate-400 uppercase tracking-widest mb-2">
                    Deviation from Safe Limit
                  </span>
                  <span className={`text-4xl font-mono ${risk.text}`}>
                    {aqi > 50
                      ? `+${(((aqi - 50) / 50) * 100).toFixed(0)}%`
                      : "SAFE"}
                  </span>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-center items-center text-center">
                  <span className="text-xs text-slate-400 uppercase tracking-widest mb-2">
                    Exposure Duration Risk
                  </span>
                  <span className="text-xl font-mono text-white">
                    {aqi > 150
                      ? "< 2 hrs"
                      : aqi > 100
                        ? "< 6 hrs"
                        : "Unlimited"}
                  </span>
                </div>
                <div className="col-span-2 p-6 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-xs text-slate-400 uppercase tracking-widest block mb-4">
                    Vulnerable Groups
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-slate-200 uppercase">
                      Children
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-slate-200 uppercase">
                      Elderly
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-slate-200 uppercase">
                      Athletes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
