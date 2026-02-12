"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { Search } from "lucide-react";

interface SensorSearchProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
  onFocusChange?: (focused: boolean) => void;
}

export default function SensorSearch({
  onSearch,
  isLoading,
  onFocusChange,
}: SensorSearchProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [city, setCity] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for "sensor" glow
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setFocused(true);
    onFocusChange?.(true);
  };

  const handleBlur = () => {
    setFocused(false);
    onFocusChange?.(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative z-20 flex justify-center">
      <motion.div
        ref={containerRef}
        initial={false}
        animate={{
          width: focused ? 600 : 500,
          backgroundColor: focused
            ? "rgba(0, 0, 0, 0.4)"
            : "rgba(0, 0, 0, 0.2)",
          borderColor: focused
            ? "rgba(56, 189, 248, 0.5)" // Sky-400
            : "rgba(255, 255, 255, 0.1)",
          boxShadow: focused
            ? "0 0 50px -10px rgba(56, 189, 248, 0.15), inset 0 0 20px rgba(0,0,0,0.5)" // Focus: Outer glow + Inner depth
            : "inset 0 2px 10px rgba(0,0,0,0.3)", // Idle: Inner depth
        }}
        whileTap={{ scale: 0.98 }} // Compression feedback
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        onMouseMove={handleMouseMove}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={() => inputRef.current?.focus()}
        className="relative h-16 rounded-full border flex items-center px-6 cursor-text group overflow-hidden backdrop-blur-md"
      >
        {/* Radial Glow Follows Cursor */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(56, 189, 248, 0.1), transparent 40%)`,
          }}
        />

        {/* Sensor "Eye" Icon */}
        <motion.div
          animate={{
            rotate: hovered ? 15 : 0,
            scale: focused ? 1.1 : 1,
            color: focused ? "#38bdf8" : "#64748b",
          }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mr-4 relative z-10"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-slate-500 border-t-sky-400 rounded-full animate-spin" />
          ) : (
            <Search className="w-5 h-5 opacity-70" />
          )}
        </motion.div>

        <motion.input
          ref={inputRef}
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={isLoading}
          placeholder="Enter city..."
          // Keypress ripple logic would be complex here, simplifying to subtle scale on container
          className="bg-transparent border-none outline-none text-lg text-slate-200 placeholder:text-slate-600 w-full font-light tracking-wide relative z-10"
        />

        {/* Drifting Placeholder Effect (Simulated via a separate layer if needed, but for now simple text alignment is cleaner) */}

        {/* Micro-interaction: Subtle pulsing line at bottom when focused */}
        <AnimatePresence>
          {focused && (
            <motion.div
              layoutId="sensor-underline"
              className="absolute bottom-0 left-10 right-10 h-[1px] bg-sky-500/50 blur-[2px]"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </form>
  );
}
