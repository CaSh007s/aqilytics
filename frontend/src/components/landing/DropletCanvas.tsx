"use client";
import { useEffect, useRef } from "react";

export default function DropletCanvas({ intensity }: { intensity: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const droplets: {
      x: number;
      y: number;
      size: number;
      speed: number;
      alpha: number;
    }[] = [];

    // Create 200 static-ish droplets (condensation style)
    for (let i = 0; i < 200; i++) {
      droplets.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.2 + 0.1,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    let animationId: number;

    const render = () => {
      // Clear with transparency
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // If intensity is 0, don't draw (save performance)
      if (intensity <= 0.01) return;

      droplets.forEach((d) => {
        d.y += d.speed;
        if (d.y > canvas.height) d.y = 0;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 163, 184, ${d.alpha * intensity})`; // Slate-400 color
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 mix-blend-screen"
    />
  );
}
