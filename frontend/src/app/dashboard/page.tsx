"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AtmosphericBackground from "@/components/dashboard/AtmosphericBackground";
import SensorSearch from "@/components/dashboard/SensorSearch";
import FloatingNav from "@/components/dashboard/FloatingNav";
import AQIDisplay from "@/components/AQIDisplay";
import HealthTip from "@/components/HealthTip";
import WeatherStat from "@/components/WeatherStat";
import ForecastGraph from "@/components/ForecastGraph";
import {
  fetchAQI,
  fetchForecast,
  AQIResponse,
  ForecastResponse,
} from "@/services/api";

export default function DashboardPage() {
  const [data, setData] = useState<AQIResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activePollutant, setActivePollutant] = useState<string | null>(null);

  // State to track if we have valid data ("Report View") vs "Intake View"
  const hasData = !!data;

  // Initial load check (optional, matching previous logic)
  useEffect(() => {
    // Could load from localStorage here if desired
  }, []);

  const handleSearch = async (city: string) => {
    setLoading(true);
    // Slight artificial delay to allow animations to breathe
    await new Promise((r) => setTimeout(r, 800));

    try {
      const [currentData, forecastData] = await Promise.all([
        fetchAQI(city),
        fetchForecast(city),
      ]);
      setData(currentData);
      setForecast(forecastData);
      setActivePollutant("PM2.5"); // Default selection
    } catch (err) {
      console.error("Failed to fetch data", err);
      // Handle error gracefully (maybe a toast or shake animation)
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen text-slate-200 relative overflow-hidden font-sans selection:bg-sky-500/30">
      <AtmosphericBackground />

      <AnimatePresence mode="wait">
        {/* === STATE 1: INTAKE CHAMBER === */}
        {!hasData && (
          <motion.div
            key="intake"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center min-h-screen relative z-10"
          >
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-6xl md:text-8xl font-thin tracking-tighter text-white/90 mb-12 uppercase"
            >
              Aqilytics
            </motion.h1>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="w-full max-w-xl px-6"
            >
              <SensorSearch onSearch={handleSearch} isLoading={loading} />
            </motion.div>
          </motion.div>
        )}

        {/* === STATE 2: REPORT VIEW === */}
        {hasData && (
          <motion.div
            key="report"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative z-10 min-h-screen flex flex-col"
          >
            {/* Top Navigation Stream */}
            <FloatingNav
              activePollutant={activePollutant}
              onSelectPollutant={setActivePollutant}
              data={data}
            />

            {/* Main Content Area: "Controlled Storm" */}
            <div className="flex-1 w-full max-w-7xl mx-auto px-6 pt-32 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Core Metrics (The Eye of the Storm) */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="lg:col-span-4 flex flex-col gap-8"
              >
                <div>
                  <h2 className="text-4xl font-light text-white mb-1">
                    {data.city}
                  </h2>
                  <p className="text-sky-400 font-mono text-sm tracking-widest uppercase opacity-80">
                    Live Telemetry • {new Date().toLocaleTimeString()}
                  </p>
                </div>

                <div className="p-8 rounded-3xl bg-slate-900/40 border border-white/5 backdrop-blur-xl">
                  <AQIDisplay
                    aqi={data.current_aqi}
                    category={data.aqi_category}
                  />
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                  <HealthTip aqi={data.current_aqi} />
                </div>
              </motion.div>

              {/* Middle/Right: Dynamic Data Stream */}
              <div className="lg:col-span-8 flex flex-col gap-8">
                {/* Weather Strip */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, staggerChildren: 0.1 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  <WeatherStat
                    label="Temp"
                    value={data.weather.temp}
                    unit="°C"
                    delay={0}
                  />
                  <WeatherStat
                    label="Humidity"
                    value={data.weather.humidity}
                    unit="%"
                    delay={100}
                  />
                  <WeatherStat
                    label="Wind"
                    value={data.weather.wind_speed}
                    unit="m/s"
                    delay={200}
                  />
                  <WeatherStat
                    label="Pressure"
                    value={data.weather.pressure}
                    unit="hPa"
                    delay={300}
                  />
                </motion.div>

                {/* Forecast Graph (The "Future Probability") */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="w-full h-80 bg-slate-900/20 border border-white/5 rounded-3xl p-6 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent opacity-50" />
                  <h3 className="text-sm font-medium text-slate-400 mb-6 uppercase tracking-widest">
                    Predictive Trajectory
                  </h3>
                  {forecast && <ForecastGraph data={forecast.forecast} />}
                </motion.div>

                {/* Detail Panel: Changes based on selected pollutant (Placeholder logic for now) */}
                <motion.div
                  key={activePollutant}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="p-8 rounded-3xl bg-slate-800/20 border border-white/5 min-h-[200px]"
                >
                  <h4 className="text-2xl font-light text-white mb-2">
                    Deep Dive:{" "}
                    <span className="text-sky-400">{activePollutant}</span>
                  </h4>
                  <p className="text-slate-400 leading-relaxed max-w-2xl">
                    Real-time concentration analysis suggests {activePollutant}{" "}
                    levels are currently stable. Sources may include local
                    traffic emissions and industrial activity relative to wind
                    patterns.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
