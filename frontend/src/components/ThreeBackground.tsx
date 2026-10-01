"use client";

import React, { useEffect, useRef } from "react";

interface StarParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  isBright: boolean;
  color: string;
  hue: number;
}

interface ShootingStar {
  x: number;
  y: number;
  len: number;
  speed: number;
  angle: number;
  alpha: number;
  active: boolean;
  color: string;
}

export default function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Radiant Silver, Diamond & Starlight palette
    const starColors = [
      { rgb: "255, 255, 255", hue: 0 },    // Pure Diamond White
      { rgb: "241, 245, 249", hue: 210 },  // Platinum Silver
      { rgb: "224, 242, 254", hue: 200 },  // Ice Cyan Starlight
      { rgb: "238, 242, 255", hue: 230 },  // Celestial Sapphire
      { rgb: "254, 243, 199", hue: 45 },   // Warm Golden Starlight
      { rgb: "248, 250, 252", hue: 0 },    // Crystalline Frost
    ];

    const particleCount = Math.min(130, Math.floor(width / 12));
    const particles: StarParticle[] = Array.from({ length: particleCount }, (_, idx) => {
      const isBright = idx % 4 === 0;
      const col = starColors[Math.floor(Math.random() * starColors.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 2.2 + 0.6,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: isBright ? Math.random() * 2.6 + 1.4 : Math.random() * 1.6 + 0.7,
        baseAlpha: Math.random() * 0.45 + 0.35,
        twinkleSpeed: Math.random() * 0.05 + 0.02,
        twinklePhase: Math.random() * Math.PI * 2,
        isBright,
        color: `rgba(${col.rgb},`,
        hue: col.hue,
      };
    });

    const shootingStars: ShootingStar[] = [];
    const createShootingStar = () => {
      if (Math.random() < 0.025 && shootingStars.length < 4) {
        shootingStars.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.6),
          len: Math.random() * 110 + 60,
          speed: Math.random() * 10 + 7,
          angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.35,
          alpha: 1,
          active: true,
          color: Math.random() > 0.4 ? "255, 255, 255" : "186, 230, 253",
        });
      }
    };

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let time = 0;

    const render = () => {
      time += 1;
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // ── 1. Deep Twinkle Obsidian Space backdrop ──
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.35,
        100,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.9
      );
      bgGrad.addColorStop(0, "rgba(8, 14, 26, 0.7)");
      bgGrad.addColorStop(0.4, "rgba(4, 7, 15, 0.85)");
      bgGrad.addColorStop(1, "rgba(2, 3, 7, 0.96)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // ── 2. Glowing Cosmic Nebulae (Silver, Cyan & Sapphire Dust) ──
      const nebula1X = width * 0.25 + Math.sin(time * 0.005) * 60;
      const nebula1Y = height * 0.35 + Math.cos(time * 0.005) * 40;
      const nebGrad1 = ctx.createRadialGradient(nebula1X, nebula1Y, 10, nebula1X, nebula1Y, 380);
      nebGrad1.addColorStop(0, "rgba(56, 189, 248, 0.07)"); // Electric Ice Cyan
      nebGrad1.addColorStop(0.5, "rgba(147, 197, 253, 0.03)");
      nebGrad1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = nebGrad1;
      ctx.fillRect(0, 0, width, height);

      const nebula2X = width * 0.75 + Math.cos(time * 0.004) * 80;
      const nebula2Y = height * 0.65 + Math.sin(time * 0.004) * 50;
      const nebGrad2 = ctx.createRadialGradient(nebula2X, nebula2Y, 10, nebula2X, nebula2Y, 440);
      nebGrad2.addColorStop(0, "rgba(224, 231, 255, 0.08)"); // Silver Starlight
      nebGrad2.addColorStop(0.5, "rgba(165, 180, 252, 0.03)");
      nebGrad2.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = nebGrad2;
      ctx.fillRect(0, 0, width, height);

      // Interactive mouse ambient silver aura
      const mouseGlow = ctx.createRadialGradient(mouseX, mouseY, 5, mouseX, mouseY, 220);
      mouseGlow.addColorStop(0, "rgba(255, 255, 255, 0.06)");
      mouseGlow.addColorStop(0.5, "rgba(186, 230, 253, 0.02)");
      mouseGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = mouseGlow;
      ctx.fillRect(0, 0, width, height);

      // ── 3. Shooting Star Comets with Glowing Spark Trails ──
      createShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        if (!s.active) continue;

        const tailX = s.x - Math.cos(s.angle) * s.len;
        const tailY = s.y - Math.sin(s.angle) * s.len;

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, `rgba(${s.color}, 0)`);
        grad.addColorStop(0.7, `rgba(${s.color}, ${s.alpha * 0.6})`);
        grad.addColorStop(1, `rgba(${s.color}, ${s.alpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.shadowBlur = 16;
        ctx.shadowColor = `rgba(${s.color}, 0.9)`;
        ctx.stroke();

        // Comet head bright spark
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ffffff";
        ctx.fill();

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= 0.018;

        if (s.alpha <= 0 || s.x > width + 120 || s.y > height + 120) {
          shootingStars.splice(i, 1);
        }
      }

      // ── 4. Render 3D Silver Twinkling Star Matrix ──
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx * p1.z;
        p1.y += p1.vy * p1.z;

        if (p1.x < 0) p1.x = width;
        if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        if (p1.y > height) p1.y = 0;

        // Interactive mouse parallax
        const dxMouse = mouseX - p1.x;
        const dyMouse = mouseY - p1.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 160) {
          const factor = (1 - distMouse / 160) * 0.9;
          p1.x -= (dxMouse / distMouse) * factor;
          p1.y -= (dyMouse / distMouse) * factor;
        }

        // Twinkle luminance
        const twinkle = Math.sin(time * p1.twinkleSpeed + p1.twinklePhase);
        const currentAlpha = Math.max(0.15, Math.min(1, p1.baseAlpha + twinkle * 0.55));
        const currentRadius = p1.radius * p1.z * (1 + twinkle * 0.28);

        // Outer starlight halo
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, Math.max(1, currentRadius * 1.8), 0, Math.PI * 2);
        ctx.fillStyle = `${p1.color} ${(currentAlpha * 0.35).toFixed(2)})`;
        ctx.shadowBlur = p1.isBright ? 18 : 8;
        ctx.shadowColor = "rgba(255, 255, 255, 0.95)";
        ctx.fill();

        // Inner bright core
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, Math.max(0.6, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha.toFixed(2)})`;
        ctx.fill();

        // ── 8-Point Diamond Diffraction Flare on bright stars ──
        if (p1.isBright && currentAlpha > 0.5) {
          const flareLen = currentRadius * 4.2;
          const flareAlpha = ((currentAlpha - 0.45) * 0.85).toFixed(2);

          ctx.beginPath();
          // Primary 4-point spikes
          ctx.moveTo(p1.x - flareLen, p1.y);
          ctx.lineTo(p1.x + flareLen, p1.y);
          ctx.moveTo(p1.x, p1.y - flareLen);
          ctx.lineTo(p1.x, p1.y + flareLen);
          // Secondary diagonal spikes
          const diagLen = flareLen * 0.55;
          ctx.moveTo(p1.x - diagLen, p1.y - diagLen);
          ctx.lineTo(p1.x + diagLen, p1.y + diagLen);
          ctx.moveTo(p1.x - diagLen, p1.y + diagLen);
          ctx.lineTo(p1.x + diagLen, p1.y - diagLen);

          ctx.strokeStyle = `rgba(255, 255, 255, ${flareAlpha})`;
          ctx.lineWidth = 1;
          ctx.shadowBlur = 12;
          ctx.shadowColor = "#ffffff";
          ctx.stroke();
        }

        // Connect nearby nodes with delicate Silver constellation filaments
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const strokeAlpha = ((1 - dist / 115) * 0.3 * Math.min(currentAlpha, p2.baseAlpha + 0.3)).toFixed(2);
            ctx.strokeStyle = `rgba(224, 231, 255, ${strokeAlpha})`;
            ctx.lineWidth = 0.75 * p1.z;
            ctx.shadowBlur = 0;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-90"
    />
  );
}
