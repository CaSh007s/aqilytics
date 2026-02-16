"use client";

import { useEffect, useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

import AtmosphericBackground from "@/components/dashboard/AtmosphericBackground";
import AQIStatusPanel from "@/components/dashboard/AQIStatusPanel";
import TelemetryStrip from "@/components/dashboard/TelemetryStrip";
import ContextualComparison from "@/components/dashboard/ContextualComparison";
import DeepDivePanel from "@/components/dashboard/DeepDivePanel";
import PredictiveIntelligencePanel from "@/components/dashboard/PredictiveIntelligencePanel";
import RiskIntelligencePanel from "@/components/dashboard/RiskIntelligencePanel";
import ForecastGraph from "@/components/ForecastGraph";
import {
  fetchAQI,
  fetchForecast,
  AQIResponse,
  ForecastResponse,
} from "@/services/api";
import Navbar from "@/components/Navbar";
import { useHistory } from "@/context/HistoryContext";

// Define the params interface for the page
interface PageParams {
  city: string;
}

export default function ResultPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const city = decodeURIComponent(resolvedParams.city);

  const { history, addToHistory } = useHistory();

  const [data, setData] = useState<AQIResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePollutant, setActivePollutant] = useState<string>("PM2.5");
  const [viewMode, setViewMode] = useState<"dashboard" | "risk">("dashboard");

  useEffect(() => {
    const loadData = async () => {
      // 1. Try to find in history first (Instant load)
      // We look for the MOST RECENT entry for this city
      const historyItem = history.find(
        (item) => item.city.toLowerCase() === city.toLowerCase(),
      );

      if (historyItem) {
        setData(historyItem.data);
        setForecast(historyItem.forecast);
        setLoading(false);
        return;
      }

      // 2. If not in history (Direct link), fetch fresh
      try {
        const [currentData, forecastData] = await Promise.all([
          fetchAQI(city),
          fetchForecast(city),
        ]);
        setData(currentData);
        setForecast(forecastData);

        // 3. Silently add to history in background
        addToHistory(currentData.city, currentData, forecastData);
      } catch (err) {
        console.error("Failed to fetch data", err);
        // Handle error (maybe redirect back to agent or show error)
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [city, history, addToHistory]);

  // Risk Toggle Logic
  const handleRiskToggle = () => {
    setViewMode((prev) => (prev === "dashboard" ? "risk" : "dashboard"));
  };

  const handleReportClick = async () => {
    const element = document.getElementById("report-content");
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        backgroundColor: "#020617", // slate-950
        cacheBust: true,
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [element.offsetWidth, element.offsetHeight],
      });

      pdf.addImage(
        dataUrl,
        "PNG",
        0,
        0,
        element.offsetWidth,
        element.offsetHeight,
      );
      pdf.save(
        `AQI_Report_${city}_${new Date().toISOString().split("T")[0]}.pdf`,
      );
    } catch (err) {
      console.error("Report generation failed", err);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <AtmosphericBackground />
        <div className="animate-pulse text-sky-400 font-mono tracking-widest">
          Initialising Telemetry...
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen">
      <AtmosphericBackground />

      <AnimatePresence mode="wait">
        <motion.div
          key="report"
          id="report-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 flex flex-col pt-24 bg-slate-950"
        >
          {/* Top Control Bar */}
          <div className="mb-4">
            <Navbar
              variant="agent"
              activePollutant={activePollutant}
              onSelectPollutant={setActivePollutant}
              data={data}
              onRiskClick={handleRiskToggle}
              onReportClick={handleReportClick}
            />
          </div>

          {/* Risk Overlay Panel */}
          <RiskIntelligencePanel
            isOpen={viewMode === "risk"}
            onClose={() => setViewMode("dashboard")}
            data={data}
          />

          {/* Main Content Grid */}
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
            {/* Header */}
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

            <div className="lg:col-span-8 flex flex-col gap-6">
              <TelemetryStrip weather={data.weather} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
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

            {/* ROW 2: Forecast */}
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
      </AnimatePresence>
    </div>
  );
}
