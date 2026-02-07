interface PollutantStatProps {
  label: string;
  value: number;
  color?: string;
  delay?: number;
  onClick?: () => void; // <--- Added this so it accepts clicks
}

export default function PollutantStat({
  label,
  value,
  color = "bg-slate-700",
  delay = 0,
  onClick,
}: PollutantStatProps) {
  // Cap the visual bar at 100%
  const barWidth = Math.min((value / 100) * 100, 100);

  return (
    <div
      onClick={onClick} // <--- Hooked it up here
      className={`flex flex-col p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 
                  animate-in fade-in slide-in-from-bottom-2 fill-mode-both 
                  transition-all duration-300 hover:bg-slate-700/50 
                  ${onClick ? "cursor-pointer hover:border-sky-500/30" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs text-slate-400 font-mono">{label}</span>
        <span className="text-sm text-slate-200 font-bold">
          {value.toFixed(1)}
        </span>
      </div>

      {/* Visual Bar */}
      <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}
