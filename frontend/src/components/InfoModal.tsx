interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    key: string;
    name: string;
    source: string;
    effect: string;
    limit: string;
    value: number;
  } | null;
}

export default function InfoModal({ isOpen, onClose, data }: InfoModalProps) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* The Card */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-800/50 p-6 border-b border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{data.key}</h2>
              <p className="text-sky-400 text-sm font-mono uppercase tracking-wider">
                {data.name}
              </p>
            </div>
            <div className="text-right">
              <span className="block text-3xl font-bold text-slate-200">
                {data.value.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500">Current Level</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-slate-400 text-xs uppercase tracking-widest mb-1">
              Primary Sources
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              {data.source}
            </p>
          </div>

          <div>
            <h4 className="text-slate-400 text-xs uppercase tracking-widest mb-1">
              Health Impact
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              {data.effect}
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">WHO Recommended Limit:</span>
              <span className="text-emerald-400 font-mono">{data.limit}</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
