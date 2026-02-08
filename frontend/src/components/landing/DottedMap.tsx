"use client";
import { useState, useMemo } from "react";
import DottedMap from "dotted-map";
import { motion } from "framer-motion";

interface CityData {
  name: string;
  country: string;
  aqi: number;
  lat: number;
  lng: number;
  color: string;
  text: string;
  x?: number; // Calculated dynamically via library
  y?: number; // Calculated dynamically via library
}

const CITIES_DATA: CityData[] = [
  {
    name: "Delhi",
    country: "India",
    aqi: 245,
    lat: 28.6139,
    lng: 77.209,
    color: "bg-red-500",
    text: "text-red-500",
  },
  {
    name: "Beijing",
    country: "China",
    aqi: 180,
    lat: 39.9042,
    lng: 116.4074,
    color: "bg-orange-500",
    text: "text-orange-500",
  },
  {
    name: "New York",
    country: "USA",
    aqi: 45,
    lat: 40.7128,
    lng: -74.006,
    color: "bg-green-400",
    text: "text-green-400",
  },
  {
    name: "London",
    country: "UK",
    aqi: 82,
    lat: 51.5074,
    lng: -0.1278,
    color: "bg-yellow-400",
    text: "text-yellow-400",
  },
  {
    name: "Tokyo",
    country: "Japan",
    aqi: 112,
    lat: 35.6762,
    lng: 139.6503,
    color: "bg-orange-400",
    text: "text-orange-400",
  },
  {
    name: "Sydney",
    country: "Australia",
    aqi: 28,
    lat: -33.8688,
    lng: 151.2093,
    color: "bg-green-400",
    text: "text-green-400",
  },
  {
    name: "São Paulo",
    country: "Brazil",
    aqi: 150,
    lat: -23.5505,
    lng: -46.6333,
    color: "bg-orange-500",
    text: "text-orange-500",
  },
  {
    name: "Cape Town",
    country: "SA",
    aqi: 55,
    lat: -33.9249,
    lng: 18.4241,
    color: "bg-yellow-400",
    text: "text-yellow-400",
  },
  {
    name: "Moscow",
    country: "Russia",
    aqi: 95,
    lat: 55.7558,
    lng: 37.6173,
    color: "bg-yellow-400",
    text: "text-yellow-400",
  },
  {
    name: "Dubai",
    country: "UAE",
    aqi: 160,
    lat: 25.2048,
    lng: 55.2708,
    color: "bg-orange-500",
    text: "text-orange-500",
  },
];

// Possible corners for the legend to jump to.
// We use consistent 'top' and 'left' percentages to avoid layout thrashing/stretching
// when animating between 'bottom'/'right' and 'auto'.
const LEGEND_POSITIONS = [
  { top: "80%", left: "70%" }, // Bottom-Right
  { top: "80%", left: "5%" }, // Bottom-Left
  { top: "5%", left: "5%" }, // Top-Left
  { top: "5%", left: "70%" }, // Top-Right
];

export default function DottedMapComponent() {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  // Fix: Generate map and projections once using useMemo.
  const { svgMap, projectedCities, mapSize } = useMemo(() => {
    const map = new DottedMap({ height: 60, grid: "diagonal" });

    const svg = map.getSVG({
      radius: 0.22,
      color: "#334155", // slate-700
      shape: "circle",
      backgroundColor: "transparent",
    });

    // Project Cities using the Library's Logic
    // This ensures 100% perfect alignment with the dots
    const projected = CITIES_DATA.map((city) => {
      const pin = map.getPin({ lat: city.lat, lng: city.lng });
      return {
        ...city,
        // Convert grid units to percentages relative to the generated map size
        x: (pin.x / map.image.width) * 100,
        y: (pin.y / map.image.height) * 100,
      };
    });

    return {
      svgMap: svg,
      projectedCities: projected,
      mapSize: { width: map.image.width, height: map.image.height },
    };
  }, []);

  // Legend State
  const [legendIndex, setLegendIndex] = useState(0);

  // Handle Legend Runaway Effect
  const moveLegend = () => {
    // Pick a random index that isn't the current one
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * LEGEND_POSITIONS.length);
    } while (nextIndex === legendIndex);
    setLegendIndex(nextIndex);
  };

  if (!svgMap) {
    return <div className="w-full h-[60vh] md:h-[80vh] bg-slate-950/50" />;
  }

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm overflow-hidden">
      {/* Map Aspect Ratio Container 
          We enforce the exact aspect ratio of the generated map so the 
          CSS percentages line up perfectly with the SVG background.
      */}
      <div
        className="relative w-full max-w-6xl px-4 md:px-0"
        style={{
          aspectRatio:
            mapSize.width && mapSize.height
              ? `${mapSize.width} / ${mapSize.height}`
              : "2/1",
        }}
      >
        {/* BACKGROUND: The Generated SVG Map */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40 animate-in fade-in duration-1000"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}")`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />

        {/* OVERLAY: The Interactive Cities */}
        {projectedCities.map((city) => {
          // Determine if the city is on the right side of the map
          const isRightEdge = (city.x || 0) > 50;

          return (
            <div
              key={city.name}
              className={`absolute group ${hoveredCity === city.name ? "z-50" : "z-10"}`}
              style={{ left: `${city.x}%`, top: `${city.y}%` }}
              onMouseEnter={() => setHoveredCity(city.name)}
              onMouseLeave={() => setHoveredCity(null)}
            >
              {/* The Glowing Dot */}
              <div className="relative cursor-pointer -translate-x-1/2 -translate-y-1/2">
                <div
                  className={`w-2 h-2 rounded-full ${city.color} relative z-10 transition-transform duration-300 group-hover:scale-150`}
                />
                <div
                  className={`absolute inset-0 w-2 h-2 rounded-full ${city.color} animate-ping opacity-75`}
                />

                {/* Anchor City Pulse (Delhi) */}
                {city.name === "Delhi" && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-red-500/20 rounded-full blur-md animate-pulse pointer-events-none" />
                )}
              </div>

              {/* The Hover Tooltip 
                  Dynamically positioned based on horizontal location to avoid cutoff.
              */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-48 bg-slate-900/90 border border-slate-700 p-3 rounded-xl backdrop-blur-md shadow-2xl z-20 transition-all duration-300 
                ${
                  isRightEdge
                    ? "right-6 origin-right" // Show on Left
                    : "left-6 origin-left" // Show on Right
                }
                ${
                  hoveredCity === city.name
                    ? "opacity-100 translate-x-0"
                    : `opacity-0 pointer-events-none ${isRightEdge ? "translate-x-2" : "-translate-x-2"}`
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      {city.country}
                    </p>
                    <p className="text-lg font-bold text-white leading-none">
                      {city.name}
                    </p>
                  </div>
                  <span className={`text-xl font-mono font-bold ${city.text}`}>
                    {city.aqi}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Dynamic Legend */}
        <motion.div
          className="absolute bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-md text-xs space-y-3 z-30 cursor-crosshair"
          initial={false}
          animate={LEGEND_POSITIONS[legendIndex]}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onMouseEnter={moveLegend}
        >
          <h4 className="text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2 mb-2 pointer-events-none">
            Live Index
          </h4>
          <div className="flex items-center gap-3 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />{" "}
            <span className="text-slate-300">0-50 Good</span>
          </div>
          <div className="flex items-center gap-3 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]" />{" "}
            <span className="text-slate-300">51-100 Moderate</span>
          </div>
          <div className="flex items-center gap-3 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />{" "}
            <span className="text-slate-300">101-200 Unhealthy</span>
          </div>
          <div className="flex items-center gap-3 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />{" "}
            <span className="text-slate-300">201+ Hazardous</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
