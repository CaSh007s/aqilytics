"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, CheckCircle, Loader2 } from "lucide-react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: string;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  city,
}: SubscriptionModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, city }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
      // Persist that looking at this modal resulted in a "success" (or just treated as handled)
      // so we don't nag them again immediately?
      // For now, we just rely on parent handling dismissal persistence if needed,
      // or we can set a flag here.
      localStorage.setItem("aqi_subscription_dismissed", "true");
    } catch (error) {
      setStatus("error");
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred");
      }
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("aqi_subscription_dismissed", "true");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 border border-white/10 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              {status === "success" ? (
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Check your email
                  </h3>
                  <p className="text-slate-400">
                    We&apos;ve sent a verification link to{" "}
                    <strong>{email}</strong>.
                    <br />
                    Click it to confirm your daily report subscription.
                  </p>
                  <button
                    onClick={handleDismiss}
                    className="mt-4 w-full rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 mb-4">
                      <Mail size={20} />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      Get Daily Reports
                    </h3>
                    <p className="mt-2 text-slate-400">
                      Would you like to receive this AQI report for{" "}
                      <span className="text-white font-medium">{city}</span> via
                      email every morning?
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="sr-only">
                        Email address
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={status === "loading"}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                      />
                    </div>

                    {status === "error" && (
                      <p className="text-sm text-red-400">{errorMessage}</p>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleDismiss}
                        className="flex-1 rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
                      >
                        No thanks
                      </button>
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="flex-1 rounded-lg bg-sky-500 px-4 py-3 text-sm font-medium text-white hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                      >
                        {status === "loading" ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          "Subscribe"
                        )}
                      </button>
                    </div>
                  </form>
                  <p className="text-xs text-center text-slate-500 mt-4">
                    Unsubscribe at any time. No spam.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
