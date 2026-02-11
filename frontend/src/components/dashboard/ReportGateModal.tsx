"use client";

import { motion, AnimatePresence } from "framer-motion";
import { History, FileText, X, Lock } from "lucide-react";

interface ReportGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export default function ReportGateModal({
  isOpen,
  onClose,
  onLogin,
}: ReportGateModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl shadow-sky-900/20 overflow-hidden"
          >
            {/* Decorative Top Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-sky-500 via-indigo-500 to-sky-500" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-sky-500/10 flex items-center justify-center mb-6 ring-1 ring-sky-500/20">
                <Lock className="w-8 h-8 text-sky-400" />
              </div>
              <h2 className="text-2xl font-light text-white mb-2">
                Authentication Required
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                To generate, download, and archive detailed atmospheric reports,
                please access your researcher account.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-slate-200">
                    Full PDF Generation
                  </h4>
                  <p className="text-xs text-slate-500">
                    Comprehensive pollutant breakdown.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <History className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-slate-200">
                    Historical Archives
                  </h4>
                  <p className="text-xs text-slate-500">
                    Track and compare past analysis.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={onClose}
                className="px-4 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onLogin}
                className="px-4 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-900/20 transition-all text-sm font-bold tracking-wide"
              >
                Login to Access
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
