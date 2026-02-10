"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { Search } from "lucide-react";

interface SensorSearchProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

export default function SensorSearch({
  onSearch,
  isLoading,
}: SensorSearchProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [city, setCity] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative z-20 flex justify-center">
      <motion.div
        initial={false}
        animate={{
          width: focused ? 600 : 500,
          backgroundColor: focused
            ? "rgba(255, 255, 255, 0.05)"
            : hovered
              ? "rgba(255, 255, 255, 0.03)"
              : "rgba(255, 255, 255, 0.01)",
          borderColor: focused
            ? "rgba(56, 189, 248, 0.3)" // Sky-400
            : hovered
              ? "rgba(148, 163, 184, 0.3)" // Slate-400
              : "rgba(148, 163, 184, 0.1)",
          boxShadow: focused
            ? "0 0 40px -10px rgba(56, 189, 248, 0.2)"
            : hovered
              ? "0 0 20px -10px rgba(255, 255, 255, 0.05)"
              : "none",
        }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} // Ease out cubic
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={() => inputRef.current?.focus()}
        className="relative h-16 rounded-full border border-white/10 backdrop-blur-md flex items-center px-6 cursor-text group"
      >
        {/* Sensor "Eye" Icon */}
        <motion.div
          animate={{
            scale: focused ? 1.1 : 1,
            color: focused ? "#38bdf8" : "#94a3b8",
          }}
          className="mr-4"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-slate-500 border-t-sky-400 rounded-full animate-spin" />
          ) : (
            <Search className="w-5 h-5 opacity-70" />
          )}
        </motion.div>

        <input
          ref={inputRef}
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={isLoading}
          placeholder="Enter city..."
          className="bg-transparent border-none outline-none text-lg text-slate-200 placeholder:text-slate-600 w-full font-light tracking-wide"
        />

        {/* Micro-interaction: Subtle pulsing line at bottom when focused */}
        {focused && (
          <motion.div
            layoutId="sensor-underline"
            className="absolute bottom-0 left-10 right-10 h-[1px] bg-sky-500/50 blur-[2px]"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
          />
        )}
      </motion.div>
    </form>
  );
}
