"use client";
import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    mermaid: any;
  }
}

export default function MermaidDiagram({ chart }: { chart: string }) {
  const [svgStr, setSvgStr] = useState<string>("");
  const [mermaidLoaded, setMermaidLoaded] = useState(false);
  const chartId = useRef(
    "mermaid-svg-" + Math.random().toString(36).substring(2, 9),
  );

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        if (window.mermaid) {
          window.mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            fontFamily: "inherit",
            background: "transparent",
          });
          const { svg } = await window.mermaid.render(chartId.current, chart);
          setSvgStr(svg);
        }
      } catch (err) {
        console.error("Mermaid parsing failed", err);
      }
    };

    if (chart && mermaidLoaded) {
      renderDiagram();
    }
  }, [chart, mermaidLoaded]);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"
        strategy="lazyOnload"
        onLoad={() => setMermaidLoaded(true)}
      />
      {!svgStr ? (
        <div className="flex justify-center items-center h-48 my-8 bg-slate-900/50 rounded-xl border border-slate-700/50 text-slate-500 text-sm animate-pulse">
          Rendering architectural layout...
        </div>
      ) : (
        <div
          className="mermaid-wrapper flex justify-center my-8 p-6 bg-slate-900/30 backdrop-blur-sm rounded-xl border border-slate-800"
          dangerouslySetInnerHTML={{ __html: svgStr }}
        />
      )}
    </>
  );
}
