interface WeatherStatProps {
  label: string;
  value: string | number;
  unit: string;
  delay?: number; // For staggered animation
}

export default function WeatherStat({
  label,
  value,
  unit,
  delay = 0,
}: WeatherStatProps) {
  return (
    <div
      className="flex flex-col p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm transition-all hover:bg-slate-800/60 hover:border-sky-500/30 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-mono text-slate-100">{value}</span>
        <span className="text-sm text-sky-400 font-mono">{unit}</span>
      </div>
    </div>
  );
}
