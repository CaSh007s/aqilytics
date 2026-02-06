"use client";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [city, setCity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md relative z-10">
      <div className="relative group">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city (e.g., Delhi, London)..."
          disabled={isLoading}
          suppressHydrationWarning={true}
          className="w-full bg-slate-900/50 text-white border border-slate-700 rounded-xl px-6 py-4 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 focus:shadow-[0_0_30px_rgba(56,189,248,0.15)] transition-all placeholder:text-slate-500 disabled:opacity-50 backdrop-blur-md"
        />
        <button
          type="submit"
          disabled={isLoading || !city.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors text-slate-400 hover:text-sky-400 disabled:text-slate-700"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-slate-500 border-t-sky-400 rounded-full animate-spin" />
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
