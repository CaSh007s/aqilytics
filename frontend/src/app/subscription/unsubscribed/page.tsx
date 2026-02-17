"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Frown, ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import AtmosphericBackground from "@/components/dashboard/AtmosphericBackground";
import Navbar from "@/components/Navbar";
import SubscriptionModal from "@/components/SubscriptionModal";

export default function UnsubscribedPage() {
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);

  // Optional: Get email/city from params if we passed them, to pre-fill the modal
  const city = searchParams.get("city") || "";

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white overflow-hidden font-sans selection:bg-pink-500/30">
      <div className="fixed inset-0 z-0 opacity-50 grayscale">
        <AtmosphericBackground /> {/* Unhealthy/Grayish vibe */}
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar variant="agent" />

        <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-8 text-center"
          >
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-800/50 ring-1 ring-slate-700"
            >
              <Frown className="h-12 w-12 text-slate-400" />
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                We&apos;re sorry to see you go.
              </h1>
              <p className="text-lg text-slate-400">
                You have been successfully unsubscribed from daily AQI reports.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setShowModal(true)}
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-linear-to-r from-sky-500 to-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-sky-500/25 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                <Mail className="h-4 w-4" />
                <span>Subscribe Again</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Re-use the existing Subscription Modal */}
      <SubscriptionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        city={city || "London"} // Default or passed city
      />
    </div>
  );
}
