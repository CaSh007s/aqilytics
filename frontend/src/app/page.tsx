"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import AQIDisplay from "@/components/AQIDisplay";
import WeatherStat from "@/components/WeatherStat";
import { fetchAQI, AQIResponse } from "@/services/api";
import PollutantStat from "@/components/PollutantStat";

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
                {data.city}
                <span className="text-sky-400 font-bold ml-2 text-xl align-top opacity-80">
                  {new Intl.DisplayNames(["en"], { type: "region" }).of(
                    data.country,
                  )}
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
              />
              <PollutantStat
                label="PM10"
                value={data.pollutants["PM10"]}
                color="bg-orange-400"
                delay={600}
              />
              <PollutantStat
                label="NO2"
                value={data.pollutants["NO2"]}
                color="bg-yellow-400"
                delay={700}
              />
              <PollutantStat
                label="Ozone"
                value={data.pollutants["Ozone"]}
                color="bg-sky-400"
                delay={800}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
