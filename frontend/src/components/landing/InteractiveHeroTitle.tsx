import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAQIByCoords, AQIResponse } from "../../services/api";

export default function InteractiveHeroTitle() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [aqiData, setAqiData] = useState<AQIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOrbClick = () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    // Expand immediately to show loading state
    setIsExpanded(true);

    // If we already have data, no need to fetch again (unless we want to refresh)
    if (aqiData) return;

    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const data = await fetchAQIByCoords(latitude, longitude);
          setAqiData(data);
        } catch (err) {
          console.error("Failed to fetch AQI:", err);
          setError("Failed to fetch data");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Location access denied");
        setLoading(false);
      },
    );
  };

  return (
    <div className="relative flex items-center justify-center min-h-[120px]">
      {/* Container for Text and Bubble to manage layout alignment */}
      <motion.div
        layout
        className="flex items-center gap-6"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* The Title Text */}
        <motion.h1
          layout="position"
          className="text-6xl md:text-8xl tracking-[0.2em] font-thin uppercase text-slate-400 whitespace-nowrap z-20 cursor-default"
        >
          AQILyticS
        </motion.h1>

        {/* The Interactive Bubble / Card */}
        <div className="relative flex items-center justify-center">
          <motion.div
            layout
            onClick={handleOrbClick}
            className={`
                relative cursor-pointer backdrop-blur-md overflow-hidden flex-shrink-0
                ${
                  isExpanded
                    ? "bg-slate-900/90 border border-slate-700 rounded-3xl"
                    : "bg-radial-gradient from-sky-400 to-blue-600 rounded-full"
                }
              `}
            initial={false}
            animate={{
              width: isExpanded ? 320 : 64,
              height: isExpanded ? 140 : 64,
              // When collapsed: organic bubbling shape
              // When expanded: standard rounded rect
              borderRadius: isExpanded ? 24 : 100,
            }}
            // The subtle organic motion when collapsed
            style={{
              boxShadow: isExpanded
                ? "0 20px 50px -10px rgba(0,0,0,0.5)"
                : "0 0 30px rgba(56, 189, 248, 0.4)",
            }}
            transition={{
              layout: { type: "spring", stiffness: 300, damping: 30 },
              width: { type: "spring", stiffness: 300, damping: 30 },
              height: { type: "spring", stiffness: 300, damping: 30 },
              borderRadius: { duration: 0.4 },
            }}
          >
            {/* Organic Motion for Bubble State (only when collapsed) */}
            {!isExpanded && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-sky-300 via-blue-500 to-indigo-500 opacity-90"
                animate={{
                  scale: [1, 1.15, 0.95, 1.1, 1],
                  rotate: [0, 90, 180, 270, 360],
                  borderRadius: [
                    "50%",
                    "45% 55% 60% 40% / 50% 60% 40% 50%",
                    "60% 40% 45% 55% / 50%",
                    "50%",
                  ],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}

            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="absolute inset-0 p-4 flex flex-col justify-center"
                >
                  {loading ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-slate-400 text-sm">
                        Locating...
                      </span>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="text-red-400 text-sm font-medium mb-1">
                        Error
                      </span>
                      <span className="text-slate-400 text-xs px-2">
                        {error}
                      </span>
                    </div>
                  ) : aqiData ? (
                    <>
                      {/* Top Row: Location */}
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3
                            className="text-white font-medium text-lg leading-none truncate max-w-[200px]"
                            title={aqiData.city}
                          >
                            {aqiData.city}
                          </h3>
                          <p className="text-slate-400 text-xs uppercase tracking-wider">
                            {aqiData.country}
                          </p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse" />
                      </div>

                      {/* Bottom Row: Data */}
                      <div className="flex items-end gap-3 mt-2">
                        <span className="text-3xl font-light text-white">
                          {aqiData.current_aqi}
                        </span>
                        <span className="mb-1 text-sm text-green-400 font-medium">
                          US AQI • {aqiData.aqi_category}
                        </span>
                      </div>
                    </>
                  ) : null}
                </motion.div>
              ) : // Optional: add a tiny icon or just keep it abstract
              null}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      {/* Click outside listener could be added here or on the parent section */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsExpanded(false)}
          aria-label="Close details"
        />
      )}
    </div>
  );
}
