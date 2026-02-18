"use client";
import { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

function ScrollWord({
  word,
  index,
  totalWords,
  scrollYProgress,
}: {
  word: string;
  index: number;
  totalWords: number;
  scrollYProgress: MotionValue<number>;
}) {
  // Calculate the specific range for this word to appear
  // We spread the reveal across the middle 60% of the scroll range (0.2 to 0.8)
  // to ensure entry and exit are clean.
  const step = 0.6 / totalWords;
  const start = 0.2 + index * step;
  const end = start + step;

  // Opacity goes strictly from 0 to 1
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);

  return (
    <motion.span
      style={{ opacity }}
      className="inline-block transition-colors duration-300 hover:text-sky-400 cursor-default"
    >
      {word}
    </motion.span>
  );
}

export default function ScrollText() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress of the TALL container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const paragraph =
    "The air we breathe is invisible, but its impact is undeniable. Every year, millions of lives are silently affected by particulate matter that our eyes cannot see. AQILYTICS renders the invisible visible, transforming complex atmospheric data into a breath of clarity. We do not just measure the pollution; we predict its path, empowering you to protect what matters most.";

  const words = paragraph.split(" ");

  return (
    // The "Track" - 600vh tall to slow down the reveal significantly (previously 300vh)
    <div ref={containerRef} className="h-[600vh] bg-slate-950 relative">
      {/* The "Stage" - Sticky frame that stays in view */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Maximum width container for the text */}
        <div className="max-w-4xl px-6 relative z-10">
          <p className="text-3xl md:text-5xl font-light leading-tight text-white flex flex-wrap justify-center text-center gap-x-3 gap-y-2">
            {words.map((word, i) => (
              <ScrollWord
                key={i}
                word={word}
                index={i}
                totalWords={words.length}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}
