"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import AtmosphericBackground from "@/components/dashboard/AtmosphericBackground";
import SensorSearch from "@/components/dashboard/SensorSearch";
import HistorySection from "@/components/HistorySection";
import { HistoryItem } from "@/context/HistoryContext";
import { ArrowRight } from "lucide-react";
import { useHistory } from "@/context/HistoryContext";

export default function AgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { history } = useHistory();

  // No Supabase, No "hasData" state checks, just Search -> Redirect

  const handleSearch = async (city: string) => {
    setLoading(true);

    // Immediate navigation - history is handled by the result page
    router.push(`/result/${city}`);

    // We don't need to unset loading here as the page will unmount/navigate
  };

  const handleHistorySelect = (item: HistoryItem) => {
    // If clicking history, just navigate!
    // Data is already in context (conceptually), but we might just want to
    // push to the URL and let the Result page grab it from context or refetch.
    router.push(`/result/${item.city}`);
  };

  return (
    <div className="relative w-full">
      <AtmosphericBackground />

      <AnimatePresence mode="wait">
        <motion.div
          key="intake"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }} // Fade out when navigating away
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

          {/* Simple Top Nav */}
          <div className="absolute top-8 right-8 z-50">
            <span
              onClick={() => router.push("/")}
              className="text-slate-500 hover:text-sky-400 text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
            </span>
          </div>

          <motion.div className="w-full max-w-xl px-6 relative">
            <SensorSearch onSearch={handleSearch} isLoading={loading} />
          </motion.div>

          {/* History Section now accepts context type directly */}
          <HistorySection history={history} onSelect={handleHistorySelect} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
