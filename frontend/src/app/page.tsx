"use client";
import { useState, useEffect } from "react"; // <--- Imported useEffect
import dynamic from "next/dynamic";
import AQIDisplay from "@/components/AQIDisplay";
import WeatherStat from "@/components/WeatherStat";
import PollutantStat from "@/components/PollutantStat";
import HealthTip from "@/components/HealthTip";
import ForecastGraph from "@/components/ForecastGraph";
import InfoModal from "@/components/InfoModal";
import { pollutantInfo } from "@/data/pollutantInfo";
import {
  fetchAQI,
  fetchForecast,
  AQIResponse,
  ForecastResponse,
} from "@/services/api";

const SearchBar = dynamic(() => import("@/components/SearchBar"), {
  ssr: false,
});

interface PollutantData {
  key: string;
  value: number;
  name: string;
  source: string;
  effect: string;
  limit: string;
}

export default function Home() {
  const [data, setData] = useState<AQIResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPollutant, setSelectedPollutant] =
    useState<PollutantData | null>(null);

  // --- MEMORY FEATURE: Load last city on startup ---
  useEffect(() => {
    // Check if we are in the browser
    if (typeof window !== "undefined") {
      const lastCity = localStorage.getItem("lastCity");
      if (lastCity) {
        handleSearch(lastCity);
      }
    }
  }, []);

  const handleSearch = async (city: string) => {
    setLoading(true);
    setError("");
    setData(null);
    setForecast(null);

    // --- MEMORY FEATURE: Save city to browser memory ---
    if (typeof window !== "undefined") {
      localStorage.setItem("lastCity", city);
    }

    try {
      const [currentData, forecastData] = await Promise.all([
        fetchAQI(city),
        fetchForecast(city),
      ]);

      setData(currentData);
      setForecast(forecastData);
    } catch (err) {
      console.error(err);
      setError("Unable to connect. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handlePollutantClick = (key: string, value: number) => {
    // @ts-expect-error - Dictionary lookup is safe here
    const info = pollutantInfo[key] || {
      name: "Unknown",
      source: "-",
      effect: "-",
      limit: "-",
    };
    setSelectedPollutant({ key, value, ...info });
    setModalOpen(true);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden text-slate-200 selection:bg-sky-500/30">
      {/* 1. Ambient Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div
          className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-colors duration-1000 
          ${
            data && data.current_aqi > 300
              ? "bg-red-600/20"
              : data && data.current_aqi > 200
                ? "bg-orange-600/20"
                : "bg-sky-500/5"
          }`}
        />
        <div
          className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-colors duration-1000
          ${
            data && data.current_aqi > 300
              ? "bg-purple-600/20"
              : data && data.current_aqi > 200
                ? "bg-yellow-600/20"
                : "bg-indigo-500/5"
          }`}
        />
      </div>

      {/* 2. Header */}
      <div
        className={`text-center transition-all duration-700 ${data ? "mt-8 mb-8" : "mb-12"}`}
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-linear-to-b from-white to-white/40 bg-clip-text text-transparent mb-4">
          AERONOMY
        </h1>
        <p className="text-slate-400 text-sm md:text-base tracking-[0.2em] uppercase font-medium">
          Predict. Explain. Protect.
        </p>
      </div>

      {/* 3. Search Bar */}
      <div
        className={`w-full max-w-md transition-all duration-500 z-20 ${data ? "mb-12" : "mb-0"}`}
      >
        <SearchBar onSearch={handleSearch} isLoading={loading} />
      </div>

      {/* 4. Loading State (New!) */}
      {loading && (
        <div className="mt-12 flex flex-col items-center animate-pulse">
          <div className="w-12 h-12 border-4 border-sky-500/30 border-t-sky-400 rounded-full animate-spin mb-4" />
          <p className="text-sky-400 font-mono text-sm tracking-widest">
            RUNNING PREDICTION MODEL...
          </p>
        </div>
      )}

      {/* 5. Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm animate-pulse">
          ⚠️ {error}
        </div>
      )}

      {/* 6. Main Dashboard Grid */}
      {!loading && data && (
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Left Column: Gauge & Health Tip */}
          <div className="flex flex-col items-center md:items-end gap-6">
            <AQIDisplay aqi={data.current_aqi} category={data.aqi_category} />
            <div className="w-full max-w-xs">
              <HealthTip aqi={data.current_aqi} />
            </div>
          </div>

          {/* Right Column: Stats & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 mb-2">
              <h2 className="text-3xl font-light text-white">
                {data.city}
                <span className="text-sky-400 font-bold ml-2 text-xl align-top opacity-80">
                  {(() => {
                    try {
                      return new Intl.DisplayNames(["en"], {
                        type: "region",
                      }).of(data.country);
                    } catch (_) {
                      return data.country;
                    }
                  })()}
                </span>
              </h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest">
                Live Telemetry
              </p>
            </div>

            <WeatherStat
              label="Temperature"
              value={data.weather.temp}
              unit="°C"
              delay={100}
            />
            <WeatherStat
              label="Humidity"
              value={data.weather.humidity}
              unit="%"
              delay={200}
            />
            <WeatherStat
              label="Wind Speed"
              value={data.weather.wind_speed}
              unit="m/s"
              delay={300}
            />
            <WeatherStat
              label="Pressure"
              value={data.weather.pressure}
              unit="hPa"
              delay={400}
            />
          </div>

          {/* Pollutant Section */}
          <div className="col-span-1 md:col-span-2 mt-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <h3 className="text-sm text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
              Atmospheric Composition (µg/m³)
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <PollutantStat
                label="PM2.5"
                value={data.pollutants["PM2.5"]}
                color="bg-red-400"
                delay={500}
                onClick={() =>
                  handlePollutantClick("PM2.5", data.pollutants["PM2.5"])
                }
              />
              <PollutantStat
                label="PM10"
                value={data.pollutants["PM10"]}
                color="bg-orange-400"
                delay={600}
                onClick={() =>
                  handlePollutantClick("PM10", data.pollutants["PM10"])
                }
              />
              <PollutantStat
                label="NO2"
                value={data.pollutants["NO2"]}
                color="bg-yellow-400"
                delay={700}
                onClick={() =>
                  handlePollutantClick("NO2", data.pollutants["NO2"])
                }
              />
              <PollutantStat
                label="Ozone"
                value={data.pollutants["Ozone"]}
                color="bg-sky-400"
                delay={800}
                onClick={() =>
                  handlePollutantClick("Ozone", data.pollutants["Ozone"])
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* 7. Forecast Graph */}
      {!loading && forecast && (
        <div className="w-full max-w-4xl mt-6 mb-12">
          <ForecastGraph data={forecast.forecast} />
        </div>
      )}

      {/* 8. The Info Modal */}
      <InfoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={selectedPollutant}
      />
    </main>
  );
}
