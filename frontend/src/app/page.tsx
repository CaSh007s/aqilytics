"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import AQIDisplay from "@/components/AQIDisplay";
import WeatherStat from "@/components/WeatherStat";
import { fetchAQI, AQIResponse } from "@/services/api";

const SearchBar = dynamic(() => import("@/components/SearchBar"), {
  ssr: false,
});

export default function Home() {
  const [data, setData] = useState<AQIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (city: string) => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const result = await fetchAQI(city);
      setData(result);
    } catch (err) {
      console.error(err);
      setError("Unable to connect. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden text-slate-200 selection:bg-sky-500/30">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header - Moves up when data is present */}
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

      {/* Search Bar */}
      <div
        className={`w-full max-w-md transition-all duration-500 z-20 ${data ? "mb-12" : "mb-0"}`}
      >
        <SearchBar onSearch={handleSearch} isLoading={loading} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm animate-pulse">
          ⚠️ {error}
        </div>
      )}

      {/* --- THE DASHBOARD --- */}
      {data && (
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Left Column: The Big Gauge */}
          <div className="flex justify-center md:justify-end">
            <AQIDisplay aqi={data.current_aqi} category={data.aqi_category} />
          </div>

          {/* Right Column: The Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 mb-2">
              {/* Display City + Country Code */}
              <h2 className="text-3xl font-light text-white">
                {data.city},{" "}
                <span className="text-sky-400 font-bold">{data.country}</span>
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
        </div>
      )}
    </main>
  );
}
