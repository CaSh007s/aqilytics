"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ForecastGraphProps {
  data: { time: number; aqi: number }[];
}

export default function ForecastGraph({ data }: ForecastGraphProps) {
  // Format data for the chart (convert timestamp to "2 PM", "3 PM")
  const chartData = data.map((item) => ({
    time: new Date(item.time * 1000).toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
    }),
    aqi: item.aqi,
  }));

  return (
    <div className="w-full h-64 p-4 bg-slate-900/40 border border-slate-700/50 rounded-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm text-slate-400 uppercase tracking-widest font-mono">
          24-Hour Prediction Trend
        </h3>
        <div className="flex gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          <span className="text-xs text-sky-500 font-bold">
            AI FORECAST ACTIVE
          </span>
        </div>
      </div>

      <div className="w-full h-full min-h-50">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={3} // Show every 3rd label to avoid clutter
            />
            <YAxis hide={true} domain={["dataMin - 10", "dataMax + 10"]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "8px",
                color: "#f8fafc",
              }}
              itemStyle={{ color: "#38bdf8" }}
              labelStyle={{ color: "#94a3b8", marginBottom: "0.5rem" }}
            />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#0ea5e9"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAqi)"
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
