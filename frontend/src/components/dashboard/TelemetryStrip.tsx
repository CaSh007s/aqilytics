"use client";

import { motion } from "framer-motion";
import { Thermometer, Droplets, Wind, Gauge } from "lucide-react";

interface TelemetryStripProps {
  weather: {
    temp: number;
    humidity: number;
    wind_speed: number;
    pressure: number;
  };
}

export default function TelemetryStrip({ weather }: TelemetryStripProps) {
  const metrics = [
    { label: "TEMP", value: weather.temp, unit: "°C", icon: Thermometer },
    { label: "HUMIDITY", value: weather.humidity, unit: "%", icon: Droplets },
    { label: "WIND", value: weather.wind_speed, unit: "m/s", icon: Wind },
    { label: "PRESSURE", value: weather.pressure, unit: "hPa", icon: Gauge },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="flex flex-col p-5 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-2 mb-2 opacity-50">
              <Icon className="w-3 h-3 group-hover:text-sky-400 transition-colors" />
              <span className="text-[10px] font-bold tracking-widest text-slate-300">
                {metric.label}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-light text-white tracking-tight">
                {metric.value}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {metric.unit}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
