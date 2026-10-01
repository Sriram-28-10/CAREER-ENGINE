"use client";

import React, { useEffect, useRef, useState } from "react";
import { Shield, Cpu, Target, Activity } from "lucide-react";

interface TransitionOverlayProps {
  message?: string;
  onComplete: () => void;
}

export default function TransitionOverlay({
  message = "SYNCHRONIZING CAREER ENGINE METRICS...",
  onComplete,
}: TransitionOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = useState(true);
  const [hudStatus, setHudStatus] = useState("INITIALIZING CAREER ENGINE CORE...");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let frame = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Silver spark particles
    const sparks = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 3.5,
      vy: (Math.random() - 0.5) * 3.5,
      size: Math.random() * 2 + 1,
      life: Math.random() * 50 + 50,
      alpha: Math.random() * 0.7 + 0.3,
    }));

    const drawSilverEngineCore = (c: CanvasRenderingContext2D, cx: number, cy: number, scale: number) => {
      c.save();
      c.translate(cx, cy);
      c.scale(scale, scale);

      // Outer Rotating Hexagon Frame
      c.save();
      c.rotate(frame * 0.02);
      c.strokeStyle = "rgba(241, 245, 249, 0.85)";
      c.shadowColor = "rgba(255, 255, 255, 0.9)";
      c.shadowBlur = 15;
      c.lineWidth = 2.5;

      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const x = Math.cos(a) * 65;
        const y = Math.sin(a) * 65;
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.closePath();
      c.stroke();
      c.restore();

      // Middle Counter-Rotating Gyroscope Ring
      c.save();
      c.rotate(-frame * 0.035);
      c.strokeStyle = "rgba(203, 213, 225, 0.9)";
      c.lineWidth = 2;
      c.beginPath();
      c.arc(0, 0, 48, 0, Math.PI * 2);
      c.stroke();

      // Ring notch dashes
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6;
        c.beginPath();
        c.moveTo(Math.cos(a) * 44, Math.sin(a) * 44);
        c.lineTo(Math.cos(a) * 52, Math.sin(a) * 52);
        c.stroke();
      }
      c.restore();

      // Inner Glowing Quantum Core
      c.beginPath();
      c.arc(0, 0, 24, 0, Math.PI * 2);
      const coreGrad = c.createRadialGradient(0, 0, 2, 0, 0, 24);
      coreGrad.addColorStop(0, "#ffffff");
      coreGrad.addColorStop(0.5, "rgba(226, 232, 240, 0.9)");
      coreGrad.addColorStop(1, "rgba(148, 163, 184, 0.2)");
      c.fillStyle = coreGrad;
      c.shadowBlur = 20;
      c.shadowColor = "#ffffff";
      c.fill();

      // Central Starlight Flare
      c.beginPath();
      c.moveTo(-35, 0);
      c.lineTo(35, 0);
      c.moveTo(0, -35);
      c.lineTo(0, 35);
      c.strokeStyle = "rgba(255, 255, 255, 0.95)";
      c.lineWidth = 1.5;
      c.stroke();

      c.restore();
    };

    const render = () => {
      frame++;
      
      // Base Twinkle Black space background
      ctx.fillStyle = "#03050a";
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Cybernetic Silver radar concentric circles
      ctx.strokeStyle = "rgba(226, 232, 240, 0.06)";
      ctx.lineWidth = 1;
      for (let r = 60; r < width; r += 90) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshairs gridlines
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, height);
      ctx.strokeStyle = "rgba(226, 232, 240, 0.08)";
      ctx.stroke();

      // Radar scanning sweep line
      const sweepAngle = (frame * 0.025) % (Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(sweepAngle) * 380, centerY + Math.sin(sweepAngle) * 380);
      ctx.strokeStyle = "rgba(241, 245, 249, 0.25)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rotating corner brackets
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(frame * 0.005);
      ctx.strokeStyle = "rgba(203, 213, 225, 0.35)";
      ctx.lineWidth = 1.5;
      const bracketSize = 200;
      ctx.strokeRect(-bracketSize, -bracketSize, 35, 35);
      ctx.strokeRect(bracketSize - 35, -bracketSize, 35, 35);
      ctx.strokeRect(-bracketSize, bracketSize - 35, 35, 35);
      ctx.strokeRect(bracketSize - 35, bracketSize - 35, 35, 35);
      ctx.restore();

      // Draw Central Silver Engine Core
      const scale = Math.min(1.7, (frame * 0.04) + 0.2);
      drawSilverEngineCore(ctx, centerX, centerY - 45, scale);

      // Render silver sparks
      sparks.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 1;
        if (s.life <= 0) {
          s.x = Math.random() * width;
          s.y = Math.random() * height;
          s.life = Math.random() * 50 + 50;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(241, 245, 249, ${s.alpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#ffffff";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Sequence progress messages
    const timers = [
      setTimeout(() => setHudStatus("SYNCHRONIZING CAREER READINESS PROFILES..."), 600),
      setTimeout(() => setHudStatus("OVERCLOCKING COGNITIVE CAREER ENGINE..."), 1300),
      setTimeout(() => setHudStatus("CAREER ENGINE ACTIVE. SYNC COMPLETE!"), 2000),
      setTimeout(() => {
        setVisible(false);
        const exitTimer = setTimeout(() => {
          onComplete();
        }, 500);
        return () => clearTimeout(exitTimer);
      }, 2500)
    ];

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      timers.forEach(clearTimeout);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-end bg-[#03050a] pb-12 transition-opacity duration-500 ease-out ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* HUD Radar & Silver Engine Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Silver Tech Dashboard Console Bar */}
      <div className="relative z-10 w-full max-w-xl px-6 py-5 bg-zinc-950/85 border border-zinc-700/80 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/80 space-y-4 text-center">
        
        {/* Core Stats Indicator Row */}
        <div className="grid grid-cols-4 gap-2 text-[10px] text-zinc-300 font-mono tracking-wider border-b border-zinc-800 pb-2.5">
          <div className="flex items-center gap-1 justify-center">
            <Cpu className="w-3.5 h-3.5 animate-pulse text-zinc-200" />
            <span>CORE: ON</span>
          </div>
          <div className="flex items-center gap-1 justify-center">
            <Target className="w-3.5 h-3.5 text-zinc-200" />
            <span>LOCK: ACTV</span>
          </div>
          <div className="flex items-center gap-1 justify-center">
            <Shield className="w-3.5 h-3.5 text-zinc-200" />
            <span>SECURE: ON</span>
          </div>
          <div className="flex items-center gap-1 justify-center">
            <Activity className="w-3.5 h-3.5 animate-bounce text-zinc-200" />
            <span>FPS: 60.0</span>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-zinc-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
            CAREER ENGINE
          </h2>
          <p className="text-xs font-mono font-bold text-zinc-200 tracking-widest animate-pulse uppercase">
            {hudStatus}
          </p>
          <p className="text-[10px] font-mono text-zinc-400 mt-1 uppercase">
            {message}
          </p>
        </div>

        {/* Silver Tech loading progress bar */}
        <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-700/80 relative">
          <div className="h-full bg-gradient-to-r from-zinc-200 via-white to-zinc-300 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-[engine_2.5s_linear_infinite]" />
        </div>
      </div>

      <style>{`
        @keyframes engine {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
