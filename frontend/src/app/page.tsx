"use client";
import { useState } from "react";
import dynamic from "next/dynamic"; // 1. Import dynamic
import { fetchAQI, AQIResponse } from "@/services/api";

// 2. Define SearchBar as a dynamic component (Client Side Only)
// ssr: false tells Next.js to skip rendering this on the server
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
      setError(
        "Unable to connect to Aeronomy Intelligence. Is the backend running?",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 1. Ambient Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      {/* 2. Brand Header */}
      <div
        className={`text-center transition-all duration-700 ${data ? "mt-12 mb-8" : "mb-12"}`}
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-linear-to-b from-white to-white/40 bg-clip-text text-transparent mb-4">
          AERONOMY
        </h1>
        <p className="text-slate-400 text-sm md:text-base tracking-[0.2em] uppercase font-medium">
          Predict. Explain. Protect.
        </p>
      </div>

      {/* 3. Search Interface */}
      <div
        className={`w-full max-w-md transition-all duration-500 ${data ? "mb-8" : "mb-0"}`}
      >
        <SearchBar onSearch={handleSearch} isLoading={loading} />
      </div>

      {/* 4. Error State */}
      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm animate-pulse">
          ⚠️ {error}
        </div>
      )}

      {/* 5. Temporary Data Dump */}
      {data && (
        <div className="w-full max-w-2xl mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
            <h3 className="text-sky-400 font-mono mb-4 text-sm uppercase">
              {"/// INCOMING TELEMETRY"}
            </h3>
            <pre className="text-xs text-slate-300 font-mono overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </main>
  );
}
