"use client";
import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CloudFog,
  Wind,
  CloudRain,
  Sun,
  Droplets,
  Activity,
} from "lucide-react";

interface ForecastPoint {
  time: number;
  aqi: number;
  pollutants: {
    "PM2.5": number;
    PM10: number;
    NO2: number;
    Ozone: number;
    SO2: number;
  };
}

interface ForecastGraphProps {
  data: ForecastPoint[];
}

const POLLUTANT_OPTIONS = [
  { key: "aqi", label: "AQI", color: "#0ea5e9", icon: Activity },
  { key: "PM2.5", label: "PM2.5", color: "#f87171", icon: CloudFog },
  { key: "PM10", label: "PM10", color: "#fb923c", icon: Wind },
  { key: "NO2", label: "NO₂", color: "#facc15", icon: CloudRain },
  { key: "Ozone", label: "O₃", color: "#38bdf8", icon: Sun },
  { key: "SO2", label: "SO₂", color: "#a78bfa", icon: Droplets },
];

export default function ForecastGraph({ data }: ForecastGraphProps) {
  const [selectedKey, setSelectedKey] = useState("aqi");

  // Format data for the chart
  const chartData = data.map((item) => ({
    time: new Date(item.time * 1000).toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
    }),
    aqi: item.aqi,
    ...item.pollutants,
  }));

  const activeOption =
    POLLUTANT_OPTIONS.find((opt) => opt.key === selectedKey) ||
    POLLUTANT_OPTIONS[0];

  return (
    <div className="w-full bg-slate-900/40 border border-white/5 rounded-4xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 overflow-hidden flex flex-col min-h-112.5">
      {/* Header & Tabs */}
      <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-sm text-slate-400 uppercase tracking-widest font-mono mb-1">
            24-Hour Prediction Trend
          </h3>
          <div className="flex gap-2 items-center">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: activeOption.color }}
            />
            <span
              className="text-xs font-bold"
              style={{ color: activeOption.color }}
            >
              {activeOption.label} FORECAST ACTIVE
            </span>
          </div>
        </div>

        {/* Pollutant Switcher */}
        <div className="flex gap-1 bg-slate-950/50 p-1 rounded-xl overflow-x-auto max-w-full no-scrollbar">
          {POLLUTANT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = selectedKey === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setSelectedKey(opt.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-slate-800 text-white shadow-sm ring-1 ring-white/10"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
                }`}
              >
                <Icon className="w-3 h-3" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full h-80 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={`gradient-${selectedKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={activeOption.color}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={activeOption.color}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b" // Slate-800 (Darker grid)
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={3}
              dy={10} // Push labels down slightly
            />
            <YAxis
              hide={false} // Show Y Axis for context now that we change values
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={30}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)", // Slate-950/90
                borderColor: "rgba(51, 65, 85, 0.5)", // Slate-700/50
                borderRadius: "12px",
                color: "#f8fafc",
                backdropFilter: "blur(8px)",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
              itemStyle={{ color: activeOption.color }}
              labelStyle={{
                color: "#94a3b8",
                marginBottom: "0.25rem",
                fontSize: "0.75rem",
              }}
              formatter={(
                value: number | string | Array<number | string> | undefined,
              ) => [
                typeof value === "number" ? value.toFixed(1) : value,
                activeOption.label,
              ]}
            />
            <Area
              key={selectedKey} // Force re-render animation on key change
              type="monotone"
              dataKey={selectedKey}
              stroke={activeOption.color}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#gradient-${selectedKey})`}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
