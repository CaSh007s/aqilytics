"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Layers, Cpu, Database } from "lucide-react";
import Image from "next/image";

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-sky-500/30 p-8 pt-24">
      <div className="max-w-4xl mx-auto relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-sky-400 mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Terminal
        </Link>

        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 text-slate-400 text-xs tracking-widest uppercase rounded-full mb-6">
            <BookOpen className="w-3 h-3" /> Technical Review
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-white tracking-tight mb-6">
            System Methodology
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed font-light">
            An in-depth look into the architectural decisions, pipeline
            workflows, and intelligent algorithms powering AQILYTICS.
          </p>
        </header>

        <section className="mb-16">
          <h2 className="text-2xl font-light text-white mb-6 flex items-center gap-3">
            <Layers className="w-6 h-6 text-sky-500" /> Platform Architecture
          </h2>
          <div className="prose prose-invert prose-slate max-w-none text-slate-400 mb-8 font-light leading-relaxed">
            <p>
              AQILYTICS relies on a modern, decoupled architecture designed to
              maintain high performance in visualizing geospatial data while
              simultaneously supporting heavy lifting on the AI inference
              backend.
            </p>
          </div>

          {/* Responsive SVG wrapper */}
          <div className="relative w-full overflow-hidden p-4 rounded-xl border border-slate-800 bg-slate-900/30 backdrop-blur-sm">
            <div className="w-full flex justify-center items-center">
              <Image
                src="/architecture.svg"
                alt="AQILYTICS Architecture Flowchart"
                width={800}
                height={500}
                className="w-full max-w-full h-auto object-contain rounded-md"
                priority
              />
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-light text-white mb-6 flex items-center gap-3">
            <Cpu className="w-6 h-6 text-indigo-400" /> Multi-modal AI Symphony
          </h2>
          <div className="prose prose-invert prose-slate max-w-none text-slate-400 mb-8 font-light leading-relaxed space-y-4">
            <p>
              Our intelligent engine orchestrates two primary models
              symbiotically:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-slate-600">
              <li>
                <strong className="text-slate-200 font-medium">
                  Telemetric Inference (XGBoost):
                </strong>{" "}
                The backbone prediction engine processes historical air quality
                variables mapped against geo-spatial meteorological data to
                forecast trends over the next 48-72 hours. These structural
                predictions guarantee data-driven exactitude.
              </li>
              <li>
                <strong className="text-slate-200 font-medium">
                  Generative Synthesis (Gemini API):
                </strong>{" "}
                The raw inference outputs are piped into a tuned LLM workflow
                that unpacks complex biochemical thresholds and frames them in
                actionable, human-readable insights optimized for localized
                geographic anomalies.
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-light text-white mb-6 flex items-center gap-3">
            <Database className="w-6 h-6 text-emerald-400" /> Data Pipeline &
            Persistence
          </h2>
          <div className="prose prose-invert prose-slate max-w-none text-slate-400 mb-8 font-light leading-relaxed space-y-4">
            <p>
              Subscriptions and global telemetry histories are routed
              asynchronously via our Node.js gateway and persisted optimally
              using a Neon PostgreSQL distributed database.
            </p>
            <p>
              Our nightly cron jobs interface directly with the{" "}
              <strong>Resend</strong> messaging topology to securely dispatch
              personalized, dynamically-rendered PDFs detailing high-priority
              localized atmospheric shifts to registered observers.
            </p>
          </div>
        </section>

        <div className="mt-24 pb-12 pt-8 border-t border-slate-900/50 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm gap-4">
          <p>
            For more programmatic details, consult the{" "}
            <a
              href="https://github.com/CaSh007s/aqilytics"
              target="_blank"
              className="text-sky-400 hover:text-sky-300 transition-colors"
            >
              Source Repository
            </a>
            .
          </p>
          <p className="tracking-widest uppercase text-xs">
            AQILYTICS Core Systems
          </p>
        </div>
      </div>
    </div>
  );
}
