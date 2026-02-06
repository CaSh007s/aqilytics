interface AQIDisplayProps {
  aqi: number;
  category: string;
}

export default function AQIDisplay({ aqi, category }: AQIDisplayProps) {
  // Determine color theme based on AQI severity
  const getColor = (value: number) => {
    if (value <= 50)
      return "text-emerald-400 border-emerald-500/30 shadow-emerald-500/20"; // Good
    if (value <= 100)
      return "text-teal-400 border-teal-500/30 shadow-teal-500/20"; // Satisfactory
    if (value <= 200)
      return "text-yellow-400 border-yellow-500/30 shadow-yellow-500/20"; // Moderate
    if (value <= 300)
      return "text-orange-400 border-orange-500/30 shadow-orange-500/20"; // Poor
    if (value <= 400) return "text-red-400 border-red-500/30 shadow-red-500/20"; // Very Poor
    return "text-purple-400 border-purple-500/30 shadow-purple-500/20"; // Severe
  };

  const themeClass = getColor(aqi);

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-64 h-64 rounded-full border-4 ${themeClass} bg-slate-900/40 backdrop-blur-xl shadow-[0_0_50px_currentColor] transition-all duration-1000 animate-in zoom-in-50`}
    >
      {/* Inner pulsing ring */}
      <div className="absolute inset-2 rounded-full border border-white/5 animate-pulse" />

      {/* The Number */}
      <span className="text-7xl font-mono font-bold tracking-tighter">
        {Math.round(aqi)}
      </span>

      {/* The Label */}
      <span className="mt-2 text-lg uppercase tracking-[0.2em] font-medium text-slate-300">
        {category}
      </span>

      <span className="absolute bottom-8 text-xs text-slate-500 uppercase tracking-widest">
        Current AQI
      </span>
    </div>
  );
}
