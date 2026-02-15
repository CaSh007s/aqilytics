import { motion } from "framer-motion";
import { HistoryItem } from "@/context/HistoryContext";
import { Clock, MapPin, Wind } from "lucide-react";

interface HistorySectionProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

export default function HistorySection({
  history,
  onSelect,
}: HistorySectionProps) {
  if (!history || history.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/50 mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10 flex items-center gap-3"
      >
        <Clock className="w-5 h-5 text-slate-500" />
        <h3 className="text-xl font-light text-slate-300 tracking-wider uppercase">
          Recent Analysis
        </h3>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {history.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(item)}
            className="group relative bg-slate-900/50 border border-slate-800 hover:border-sky-500/50 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <MapPin className="w-3 h-3" />
                  <span>{item.city}</span>
                </div>
                <div className="text-xs text-slate-600">
                  {item.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${
                  item.data.current_aqi <= 50
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : item.data.current_aqi <= 100
                      ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                      : item.data.current_aqi <= 150
                        ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                        : item.data.current_aqi <= 200
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : item.data.current_aqi <= 300
                            ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                            : "bg-rose-900/20 border-rose-800/50 text-rose-500"
                }`}
              >
                {item.data.current_aqi}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Classification</span>
                <span className="text-slate-300">{item.data.aqi_category}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Primary Pollutant</span>
                <span className="text-sky-400 flex items-center gap-1">
                  <Wind className="w-3 h-3" /> PM2.5
                </span>
              </div>
            </div>

            {/* Hover visual cue */}
            <div className="absolute inset-0 border border-sky-500/0 group-hover:border-sky-500/20 rounded-xl transition-colors duration-500 pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
