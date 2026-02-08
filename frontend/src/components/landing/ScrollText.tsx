"use client";
import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

function ScrollParagraph({ text }: { text: string }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.5"], // Writes while in the middle of the screen
  });

  const words = text.split(" ");

  return (
    <div
      ref={containerRef}
      className="flex flex-wrap gap-x-3 gap-y-2 text-3xl md:text-5xl font-light leading-tight justify-center max-w-4xl mx-auto px-6"
    >
      {words.map((word, i) => {
        // Calculate the range for this specific word to appear
        const start = i / words.length;
        const end = start + 1 / words.length;

        // Transform scroll progress to opacity for this word
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const opacity = useTransform(scrollYProgress, [start, end], [0.1, 1]);

        // "Surprise" Hover Effect: Color shift & glow
        return (
          <motion.span
            key={i}
            style={{ opacity }}
            className="transition-colors duration-300 hover:text-sky-400 hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] cursor-default"
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
}

export default function ScrollText() {
  const paragraph =
    "The air we breathe is invisible, but its impact is undeniable. Every year, millions of lives are silently affected by particulate matter that our eyes cannot see. AQILytics renders the invisible visible, transforming complex atmospheric data into a breath of clarity. We do not just measure the pollution; we predict its path, empowering you to protect what matters most.";

  return (
    <div className="min-h-[150vh] flex items-center justify-center bg-slate-950">
      <ScrollParagraph text={paragraph} />
    </div>
  );
}
