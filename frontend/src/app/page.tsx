"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Github, FileText, Activity } from "lucide-react";
import DropletCanvas from "@/components/landing/DropletCanvas";
import DottedMap from "@/components/landing/DottedMap";
import ScrollText from "@/components/landing/ScrollText";
import BreathingOrb from "@/components/landing/BreathingOrb"; // Re-using your Orb
// InteractiveHeroTitle removed (unused)

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // --- Dynamic Orchestration ---

  // 1. Droplets: 100% at top, 0% at map, 100% at footer
  const dropletIntensity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [1, 0, 0, 1],
  );

  // 2. Name Reveal: Fades out as you scroll down
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  // 3. Footer Reveal: Fades in at the very end
  const footerOpacity = useTransform(scrollYProgress, [0.85, 1], [0, 1]);
  const footerY = useTransform(scrollYProgress, [0.85, 1], [50, 0]);

  return (
    <div
      ref={containerRef}
      className="bg-slate-950 text-slate-200 selection:bg-sky-500/30"
    >
      {/* 1. Global Droplet Layer (Controlled by Scroll) */}
      <motion.div
        style={{ opacity: dropletIntensity }}
        className="fixed inset-0 z-0 pointer-events-none"
      >
        <DropletCanvas intensity={1} />
      </motion.div>

      {/* 2. Hero Section (Sticky feeling) */}
      <section className="min-h-screen flex flex-col items-center justify-center relative z-10">
        {/* Dynamic Header - No Nav, just the name */}

        {/* The Breathing Core */}
        <div className="w-full">
          <BreathingOrb />
        </div>

        {/* Scroll Prompt */}
        <motion.div
          style={{ opacity: headerOpacity }}
          className="absolute bottom-10 animate-bounce text-slate-500 text-xs tracking-widest"
        >
          SCROLL TO EXPLORE
        </motion.div>
      </section>

      {/* 3. The Map Section */}
      <section className="min-h-screen flex items-center justify-center relative z-10 border-t border-slate-900/30 bg-slate-950/80 backdrop-blur-sm">
        <div className="w-full max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-light text-white mb-2">
              Global Pulse
            </h2>
            <p className="text-slate-500">
              Real-time telemetry across 6 continents.
            </p>
          </div>
          <DottedMap />
        </div>
      </section>

      {/* 4. The Scrollytelling Text */}
      <ScrollText />

      {/* 5. The Dynamic Footer & CTA */}
      <motion.section
        style={{ opacity: footerOpacity, y: footerY }}
        className="min-h-screen flex flex-col items-center justify-center relative z-10 bg-gradient-to-t from-black to-slate-950/0"
      >
        {/* The Two Buttons */}
        <div className="flex flex-col md:flex-row gap-8 mb-24">
          {/* Get Started - Magnetic Glow */}
          <Link href="/agent">
            <button className="group relative w-64 h-16 rounded-full bg-slate-900 border border-slate-700 hover:border-sky-500 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-sky-500/10 scale-0 group-hover:scale-100 rounded-full transition-transform duration-500 blur-xl" />
              <span className="relative z-10 flex items-center justify-center gap-3 text-lg text-slate-300 group-hover:text-white transition-colors">
                Get Started <Activity className="w-4 h-4" />
              </span>
            </button>
          </Link>

          {/* GitHub Repository */}
          <Link href="https://github.com/CaSh007s/aeronomy" target="_blank">
            <button className="group relative w-64 h-16 rounded-full border border-slate-800 hover:border-slate-600 transition-all">
              <span className="text-lg text-slate-500 group-hover:text-slate-300 transition-colors flex items-center justify-center gap-2">
                <Github className="w-5 h-5" /> GitHub Repository
              </span>
            </button>
          </Link>
        </div>

        {/* The Footer Content */}
        <div className="w-full max-w-5xl px-8 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-slate-900/50 pt-16">
          {/* Column 1: Identity */}
          <div className="space-y-4">
            <h3 className="text-xl font-thin tracking-widest text-white">
              AQILYTICS
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Atmospheric intelligence for the modern era. Predicting the unseen
              to protect the living.
            </p>
            <div className="pt-4">
              <a
                href="https://github.com/cash007s"
                target="_blank"
                className="inline-flex items-center gap-2 text-xs text-slate-600 hover:text-sky-400 transition-colors"
              >
                <Github className="w-4 h-4" /> Source Repository
              </a>
            </div>
          </div>

          {/* Column 2: Health Resources (Stacked) */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Health Intelligence
            </h4>
            <div className="space-y-3">
              <a
                href="https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health"
                target="_blank"
                rel="noreferrer noopener"
                className="block text-sm text-slate-400 hover:text-emerald-400 hover:translate-x-2 transition-all duration-300 flex items-center gap-2"
              >
                <FileText className="w-3 h-3" /> WHO Air Quality Guidelines
              </a>
              <a
                href="https://www.who.int/tools/health-impact-assessment"
                target="_blank"
                rel="noreferrer noopener"
                className="block text-sm text-slate-400 hover:text-emerald-400 hover:translate-x-2 transition-all duration-300 flex items-center gap-2"
              >
                <FileText className="w-3 h-3" /> Health Impact Assessment
              </a>
              <a
                href="https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health"
                target="_blank"
                rel="noreferrer noopener"
                className="block text-sm text-slate-400 hover:text-emerald-400 hover:translate-x-2 transition-all duration-300 flex items-center gap-2"
              >
                <FileText className="w-3 h-3" /> Particulate Matter Risks
              </a>
            </div>
          </div>

          {/* Column 3: Legal & Creator */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Project
            </h4>
            <div className="space-y-3">
              <Link
                href="/methodology"
                className="block text-sm text-slate-400 hover:text-white transition-colors"
              >
                Methodology
              </Link>
              <Link
                href="/api-status"
                className="block text-sm text-slate-400 hover:text-white transition-colors"
              >
                API Status
              </Link>
              <p className="text-xs text-slate-600 mt-8">
                Designed by Kalash Pratap Gaur
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
