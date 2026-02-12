"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import AtmosphericBackground from "@/components/dashboard/AtmosphericBackground";
import SensorSearch from "@/components/dashboard/SensorSearch";
import AuthenticatedNavbar from "@/components/AuthenticatedNavbar";
import AQIStatusPanel from "@/components/dashboard/AQIStatusPanel";
import TelemetryStrip from "@/components/dashboard/TelemetryStrip";
import ContextualComparison from "@/components/dashboard/ContextualComparison";
import DeepDivePanel from "@/components/dashboard/DeepDivePanel";
import PredictiveIntelligencePanel from "@/components/dashboard/PredictiveIntelligencePanel";
import RiskIntelligencePanel from "@/components/dashboard/RiskIntelligencePanel";
import ReportGateModal from "@/components/dashboard/ReportGateModal";
import ForecastGraph from "@/components/ForecastGraph";
import {
  fetchAQI,
  fetchForecast,
  AQIResponse,
  ForecastResponse,
} from "@/services/api";
import { getSession } from "@/services/auth";

export default function AgentPage() {
  const router = useRouter();
  const [data, setData] = useState<AQIResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activePollutant, setActivePollutant] = useState<string>("PM2.5");

  // Interaction States
  const [viewMode, setViewMode] = useState<"dashboard" | "risk">("dashboard");
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  // Risk Toggle Logic
  const handleRiskToggle = () => {
    setViewMode((prev) => (prev === "dashboard" ? "risk" : "dashboard"));
  };

  // Report Gating Logic
  const handleReportClick = async () => {
    try {
      const user = await getSession();
      if (user) {
        console.log("Generating report for:", user.username);
        // Future logic for generating PDF
      } else {
        setShowAuthModal(true);
      }
    } catch {
      setShowAuthModal(true);
    }
  };

  const handleLoginRedirect = () => {
    router.push("/login?redirect=/agent");
  };

  return (
    <div className="relative w-full">
      <AtmosphericBackground />

      {/* Auth Modal Portal */}
      <ReportGateModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLoginRedirect}
      />

      <AnimatePresence mode="wait">
        {/* === STATE 1: INTAKE CHAMBER === */}
        {!hasData && (
          <motion.div
            key="intake"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center min-h-[80vh] relative z-10"
          >
            <div className="flex justify-center mb-12 cursor-default select-none">
              {"AQILYTICS".split("").map((char, i) => (
                <motion.span
                  key={i}
                  className="text-6xl md:text-8xl font-thin uppercase text-slate-300 inline-block transition-colors"
                  style={{
                    marginRight: i === "AQILYTICS".length - 1 ? 0 : "0.2em",
                  }}
                  whileHover={{
                    scale: 1.1,
                    color: "#38bdf8", // sky-400
                    textShadow: "0 0 20px rgba(56,189,248,0.5)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  {char}
                </motion.span>
              ))}
            </div>

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
            className="relative z-10 flex flex-col pt-24" // Added padding for navbar
          >
            {/* Top Navigation Stream */}
            <AuthenticatedNavbar
              variant="agent"
              activePollutant={activePollutant}
              onSelectPollutant={setActivePollutant}
              data={data}
              onRiskClick={handleRiskToggle}
              onReportClick={handleReportClick}
            />

            {/* Risk Overlay Panel */}
            <RiskIntelligencePanel
              isOpen={viewMode === "risk"}
              onClose={() => setViewMode("dashboard")}
              data={data}
            />

            {/* Main Content Grid - Animated Container for Risk Mode */}
            <motion.div
              className="flex-1 w-full max-w-7xl mx-auto px-6 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 origin-bottom"
              animate={{
                scale: viewMode === "risk" ? 0.92 : 1,
                opacity: viewMode === "risk" ? 0.4 : 1,
                filter: viewMode === "risk" ? "blur(4px)" : "blur(0px)",
                y: viewMode === "risk" ? -20 : 0,
              }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            >
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
