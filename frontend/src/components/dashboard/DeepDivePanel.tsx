"use client";

import { Activity, Flame, ShieldAlert } from "lucide-react";

interface DeepDivePanelProps {
  pollutant: string;
}

const INSIGHTS: Record<
  string,
  { health: string; sources: string; mitigation: string }
> = {
  "PM2.5": {
    health:
      "Fine particulate matter can penetrate deep into the lungs and enter the bloodstream, causing cardiovascular and respiratory impacts.",
    sources:
      "Combustion (vehicles, industry, wood burning) and secondary chemical formation.",
    mitigation:
      "Use air purifiers with HEPA filters. Avoid outdoor strenuous activity.",
  },
  PM10: {
    health:
      "Inhalable particles that can irritate eyes, nose, and throat. dangerous for people with asthma.",
    sources: "Dust from roads, farms, construction sites, and pollen.",
    mitigation:
      "Wear N95 masks significantly reduces exposure. Keep windows closed during high traffic.",
  },
  NO2: {
    health:
      "Inflames the lining of the lungs, and can reduce immunity to lung infections.",
    sources: "Primary source is burning of fuel (cars, trucks, power plants).",
    mitigation:
      "Avoid exercising near busy roads. Ensure gas appliances are vented.",
  },
  Ozone: {
    health: "Triggers asthma, reduces lung function and causes lung diseases.",
    sources: "Chemical reaction between NOx and VOCs in sunlight.",
    mitigation:
      "Limit outdoor activity in the afternoon when ozone levels optimize.",
  },
  SO2: {
    health: "Causes difficulty breathing, particularly for people with asthma.",
    sources:
      "Burning of fossil fuels by power plants and other industrial facilities.",
    mitigation: "Avoid areas downwind of industrial sites.",
  },
};

export default function DeepDivePanel({ pollutant }: DeepDivePanelProps) {
  const data = INSIGHTS[pollutant] || INSIGHTS["PM2.5"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 rounded-4xl bg-slate-900/40 border border-white/5 backdrop-blur-md">
      {/* Header (Left) */}
      <div className="md:col-span-1">
        <h3 className="text-3xl font-light text-white mb-2">Deep Dive</h3>
        <h4 className="text-xl text-sky-400 font-mono mb-6">
          {pollutant} Analysis
        </h4>
        <div className="h-1 w-12 bg-sky-500 rounded-full mb-6" />
        <p className="text-sm text-slate-400">
          Advanced breakdown of current atmospheric composition and its
          biological implications.
        </p>
      </div>

      {/* Content (Right) */}
      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-rose-400 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Health Impact
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-light">
            {data.health}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Primary Sources
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-light">
            {data.sources}
          </p>
        </div>

        <div className="sm:col-span-2 space-y-2 border-t border-white/5 pt-6">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Recommended Action
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-light">
            {data.mitigation}
          </p>
        </div>
      </div>
    </div>
  );
}
