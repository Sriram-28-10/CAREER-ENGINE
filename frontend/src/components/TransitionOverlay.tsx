"use client";

import React, { useEffect, useRef, useState } from "react";
import { Shield, Cpu, Target, Activity } from "lucide-react";

interface TransitionOverlayProps {
  message?: string;
  onComplete: () => void;
}

export default function TransitionOverlay({
  message = "SYNCHRONIZING TWIN METRICS...",
  onComplete,
}: TransitionOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = useState(true);
  const [hudStatus, setHudStatus] = useState("BOOTING MECHA SYSTEMS...");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let frame = 0;
    const radarLines: number[] = [];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Tech HUD particle sparks
    const sparks = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      size: Math.random() * 2 + 1,
      life: Math.random() * 50 + 50,
    }));

    const drawMechaScorpion = (c: CanvasRenderingContext2D, cx: number, cy: number, scale: number) => {
      c.save();
      c.translate(cx, cy);
      c.scale(scale, scale);

      // Glowing red mecha style configurations
      c.strokeStyle = "rgba(239, 68, 68, 0.85)";
      c.shadowColor = "rgba(239, 68, 68, 0.9)";
      c.shadowBlur = 15;
      c.lineWidth = 2.5;

      // 1. Draw Tail Segments (Curving Upwards)
      c.beginPath();
      // Base link
      c.moveTo(0, 40);
      c.lineTo(-10, 60);
      c.lineTo(10, 60);
      c.closePath();
      c.stroke();

      // Tail spine linkages
      const segments = [
        { x: 0, y: 75, r: 8 },
        { x: 12, y: 92, r: 7 },
        { x: 28, y: 104, r: 6 },
        { x: 48, y: 110, r: 5 },
        { x: 70, y: 108, r: 4 },
        { x: 88, y: 95, r: 4 },
        { x: 96, y: 74, r: 3 },
      ];

      segments.forEach((seg, i) => {
        c.beginPath();
        c.arc(seg.x, seg.y, seg.r, 0, Math.PI * 2);
        c.stroke();
        if (i > 0) {
          c.beginPath();
          c.moveTo(segments[i-1].x, segments[i-1].y);
          c.lineTo(seg.x, seg.y);
          c.stroke();
        }
      });

      // 2. Stinger (Mechanical sharp pincer at tail tip)
      const tip = segments[segments.length - 1];
      c.beginPath();
      c.moveTo(tip.x, tip.y);
      c.quadraticCurveTo(tip.x - 5, tip.y - 30, tip.x - 28, tip.y - 35);
      c.lineTo(tip.x - 18, tip.y - 12);
      c.closePath();
      c.fillStyle = "rgba(239, 68, 68, 0.95)";
      c.fill();
      c.stroke();

      // Stinger glow target circle
      c.beginPath();
      c.arc(tip.x - 28, tip.y - 35, 4, 0, Math.PI * 2);
      c.fillStyle = "#fff";
      c.fill();

      // 3. Mecha Carapace (Angular segmented body shield)
      c.beginPath();
      c.moveTo(0, -35); // Head tip
      c.lineTo(25, -15);
      c.lineTo(20, 20);
      c.lineTo(0, 40);
      c.lineTo(-20, 20);
      c.lineTo(-25, -15);
      c.closePath();
      c.stroke();

      // Carapace inner circuitry lines
      c.beginPath();
      c.moveTo(0, -35);
      c.lineTo(0, 40);
      c.moveTo(-25, -15);
      c.lineTo(25, -15);
      c.moveTo(-20, 20);
      c.lineTo(20, 20);
      c.strokeStyle = "rgba(239, 68, 68, 0.4)";
      c.lineWidth = 1.2;
      c.stroke();

      // 4. Claws (Pincers / Pedipalps)
      c.lineWidth = 2.5;
      c.strokeStyle = "rgba(239, 68, 68, 0.85)";
      
      // Left Claw arm
      c.beginPath();
      c.moveTo(-15, -28);
      c.lineTo(-45, -45);
      c.lineTo(-65, -25);
      c.stroke();

      // Left Pincer (claws)
      c.beginPath();
      c.arc(-70, -25, 12, 1.2 * Math.PI, 0.2 * Math.PI, true);
      c.stroke();
      c.beginPath();
      c.arc(-64, -22, 8, 1.1 * Math.PI, 0.4 * Math.PI, true);
      c.stroke();

      // Right Claw arm
      c.beginPath();
      c.moveTo(15, -28);
      c.lineTo(45, -45);
      c.lineTo(65, -25);
      c.stroke();

      // Right Pincer (claws)
      c.beginPath();
      c.arc(70, -25, 12, 1.8 * Math.PI, 0.8 * Math.PI);
      c.stroke();
      c.beginPath();
      c.arc(64, -22, 8, 1.9 * Math.PI, 0.6 * Math.PI);
      c.stroke();

      // 5. Angular Mecha Legs (3 on left, 3 on right)
      const legAngles = [-10, 5, 20];
      legAngles.forEach((angle, idx) => {
        // Left legs
        c.beginPath();
        c.moveTo(-18, angle);
        c.lineTo(-48, angle - 5 - (idx * 5));
        c.lineTo(-60, angle + 15 - (idx * 3));
        c.stroke();

        // Right legs
        c.beginPath();
        c.moveTo(18, angle);
        c.lineTo(48, angle - 5 - (idx * 5));
        c.lineTo(60, angle + 15 - (idx * 3));
        c.stroke();
      });

      c.restore();
    };

    const render = () => {
      frame++;
      
      // Base dark tech background
      ctx.fillStyle = "#090505";
      ctx.fillRect(0, 0, width, height);

      // Draw cybernetic radar grid background
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.strokeStyle = "rgba(239, 68, 68, 0.05)";
      ctx.lineWidth = 1;

      // Concentric circles
      for (let r = 50; r < width; r += 80) {
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
      ctx.stroke();

      // Radar scanning sweep sweep line
      const sweepAngle = (frame * 0.02) % (Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(sweepAngle) * 350, centerY + Math.sin(sweepAngle) * 350);
      ctx.strokeStyle = "rgba(239, 68, 68, 0.15)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw HUD targets
      ctx.strokeStyle = "rgba(239, 68, 68, 0.3)";
      ctx.strokeRect(centerX - 180, centerY - 180, 360, 360);
      ctx.strokeRect(centerX - 190, centerY - 190, 380, 380);

      // Rotating corner bracket design
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(frame * 0.005);
      ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
      ctx.lineWidth = 1.5;
      const bracketSize = 210;
      // Draw corner lines
      ctx.strokeRect(-bracketSize, -bracketSize, 40, 40);
      ctx.strokeRect(bracketSize - 40, -bracketSize, 40, 40);
      ctx.strokeRect(-bracketSize, bracketSize - 40, 40, 40);
      ctx.strokeRect(bracketSize - 40, bracketSize - 40, 40, 40);
      ctx.restore();

      // Draw the main Red Mecha Tech Scorpion
      // Zoom in mecha scorpion scale factor
      const scale = Math.min(1.8, (frame * 0.05) + 0.1);
      drawMechaScorpion(ctx, centerX, centerY - 40, scale);

      // Render system sparkles/sparks
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
        ctx.fillStyle = "rgba(239, 68, 68, 0.6)";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Sequence progress messages
    const timers = [
      setTimeout(() => setHudStatus("ACQUIRING NEURAL TARGET LOCK..."), 600),
      setTimeout(() => setHudStatus("OVERCLOCKING COGNITIVE TWIN ENGINE..."), 1300),
      setTimeout(() => setHudStatus("SCORPIUS SYSTEMS ACTIVE. SYNC COMPLETE!"), 2000),
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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-end bg-[#070303] pb-12 transition-opacity duration-500 ease-out ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* HUD Radar & Mecha Scorpion Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Mecha Tech Dashboard Console Bar */}
      <div className="relative z-10 w-full max-w-xl px-6 py-5 bg-black/75 border border-red-500/30 backdrop-blur-md rounded-2xl shadow-2xl space-y-4 text-center">
        
        {/* Core Stats Indicator Row */}
        <div className="grid grid-cols-4 gap-2 text-[10px] text-red-500 font-mono tracking-wider border-b border-red-950 pb-2.5">
          <div className="flex items-center gap-1 justify-center">
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
            <span>CORE: ON</span>
          </div>
          <div className="flex items-center gap-1 justify-center">
            <Target className="w-3.5 h-3.5" />
            <span>LOCK: ACTV</span>
          </div>
          <div className="flex items-center gap-1 justify-center">
            <Shield className="w-3.5 h-3.5" />
            <span>SECURE: ON</span>
          </div>
          <div className="flex items-center gap-1 justify-center">
            <Activity className="w-3.5 h-3.5 animate-bounce" />
            <span>FPS: 60.0</span>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-[0.3em] text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]">
            TEAM SCORPIUS
          </h2>
          <p className="text-xs font-mono font-bold text-red-400/90 tracking-widest animate-pulse uppercase">
            {hudStatus}
          </p>
          <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase">
            {message}
          </p>
        </div>

        {/* Red Tech loading progress bar */}
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-red-900/40 relative">
          <div className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 rounded-full animate-[scorp_2.5s_linear_infinite]" />
        </div>
      </div>

      <style>{`
        @keyframes scorp {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
