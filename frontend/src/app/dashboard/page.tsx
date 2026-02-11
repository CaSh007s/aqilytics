"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AtmosphericBackground from "@/components/dashboard/AtmosphericBackground";
import SensorSearch from "@/components/dashboard/SensorSearch";
import FloatingNav from "@/components/dashboard/FloatingNav";
import AQIStatusPanel from "@/components/dashboard/AQIStatusPanel";
import TelemetryStrip from "@/components/dashboard/TelemetryStrip";
import ContextualComparison from "@/components/dashboard/ContextualComparison";
import DeepDivePanel from "@/components/dashboard/DeepDivePanel";
import PredictiveIntelligencePanel from "@/components/dashboard/PredictiveIntelligencePanel";
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
  const [activePollutant, setActivePollutant] = useState<string>("PM2.5");

  // State to track if we have valid data ("Report View") vs "Intake View"
  const hasData = !!data;

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
      setActivePollutant("PM2.5");
    } catch (err) {
      console.error("Failed to fetch data", err);
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
            <h1 className="text-6xl md:text-8xl tracking-[0.2em] font-thin uppercase mb-12 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 opacity-80">
              AQILYTICS
            </h1>

            <motion.div className="w-full max-w-xl px-6 relative">
              <SensorSearch onSearch={handleSearch} isLoading={loading} />
            </motion.div>
          </motion.div>
        )}

        {/* === STATE 2: SCIENTIFIC COMMAND CENTER === */}
        {hasData && (
          <motion.div
            key="report"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative z-10 min-h-screen flex flex-col pb-20"
          >
            {/* Top Navigation Stream */}
            <FloatingNav
              activePollutant={activePollutant}
              onSelectPollutant={setActivePollutant}
              data={data}
            />

            {/* Main Content Grid */}
            <div className="flex-1 w-full max-w-[1600px] mx-auto px-6 pt-32 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Header (Left Aligned for cinematic feel) */}
              <div className="lg:col-span-12 flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-6 mb-4">
                <div>
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-6xl font-thin text-white tracking-tight"
                  >
                    {data.city}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sky-400 font-mono text-sm tracking-widest uppercase mt-2"
                  >
                    Live Telemetry • {new Date().toLocaleTimeString()} • Station
                    ID: #8821X
                  </motion.p>
                </div>
              </div>

              {/* ROW 1: The Core Metrics */}
              {/* Left: The Eye (AQI) */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-4"
              >
                <AQIStatusPanel
                  aqi={data.current_aqi}
                  category={data.aqi_category}
                />
              </motion.div>

              {/* Right: Telemetry & Comparison */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {/* Telemetry Strip */}
                <TelemetryStrip weather={data.weather} />

                {/* Comparison & Forecast split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                  {/* Contextual Comparison */}
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <ContextualComparison
                      pollutant={activePollutant}
                      value={
                        (data.pollutants as Record<string, number>)[
                          activePollutant
                        ] || 0
                      }
                    />
                  </motion.div>

                  {/* Predictive Intelligence Panel */}
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="h-full"
                  >
                    <PredictiveIntelligencePanel
                      forecast={forecast ? forecast.forecast : null}
                    />
                  </motion.div>
                </div>
              </div>

              {/* ROW 2: Expanded Forecast Trajectory */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="lg:col-span-12"
              >
                {forecast && <ForecastGraph data={forecast.forecast} />}
              </motion.div>

              {/* ROW 3: Deep Dive */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="lg:col-span-12"
              >
                <DeepDivePanel pollutant={activePollutant} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
