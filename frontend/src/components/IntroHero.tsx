"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Brain, Sparkles, ArrowRight, ArrowLeft, Bot, TrendingUp, FileSearch,
  Mic, ShieldCheck, Play, Pause, ChevronRight, CheckCircle2, Zap
} from "lucide-react";

interface IntroHeroProps {
  onEnter: () => void;
}

const STORY_STEPS = [
  {
    icon: <FileSearch className="w-10 h-10 text-zinc-200" />,
    badge: "01 · THE PROBLEM",
    badgeColor: "bg-zinc-800/80 text-zinc-200 border-zinc-600/50",
    glowColor: "from-zinc-500/15 via-slate-600/10 to-transparent",
    title: "You Have a Resume. But Do You Know Your True Standing?",
    subtitle: "Most candidates guess their readiness or rely on generic job defaults.",
    details: "Your resume contains valuable experience, but matching it against real engineering thresholds manually is nearly impossible.",
    highlight: "Career Engine AI changes that in seconds.",
  },
  {
    icon: <Bot className="w-10 h-10 text-emerald-400" />,
    badge: "02 · THE AI SCANNER",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    glowColor: "from-emerald-500/20 via-emerald-600/10 to-transparent",
    title: "Our AI Engine Reads & Parses Every Line",
    subtitle: "Deep dynamic evaluation using Google Gemini AI.",
    details: "Projects, technical competencies, GitHub claims, and certs are contextually extracted and scored against live job roles.",
    highlight: "No generic role defaults. 100% personalized analysis.",
  },
  {
    icon: <TrendingUp className="w-10 h-10 text-zinc-200" />,
    badge: "03 · THE CAREER ROADMAP",
    badgeColor: "bg-zinc-800/80 text-zinc-200 border-zinc-600/50",
    glowColor: "from-zinc-500/15 via-slate-600/10 to-transparent",
    title: "Your Personal Career Engine & Job Blockers Emerge",
    subtitle: "Identify exact skill gaps before recruiters do.",
    details: "Discover your Minimum Path to Job, simulate skill boosts, and unlock high-ROI learning recommendations tailored to your role.",
    highlight: "Clear, actionable feedback instead of confusing numbers.",
  },
  {
    icon: <Mic className="w-10 h-10 text-amber-400" />,
    badge: "04 · AI PROCTORING & PREP",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    glowColor: "from-amber-500/20 via-amber-600/10 to-transparent",
    title: "Practice Real Interviews with AI Speech Scoring",
    subtitle: "Live camera/mic proctoring with eye-tracking analysis.",
    details: "Test your knowledge under real exam conditions with automated proctoring and instant AI transcript evaluations.",
    highlight: "Build interview confidence with instant AI feedback.",
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-zinc-200" />,
    badge: "05 · THE DESTINATION",
    badgeColor: "bg-zinc-800/80 text-zinc-200 border-zinc-600/50",
    glowColor: "from-zinc-500/15 via-slate-600/10 to-transparent",
    title: "Walk In Confident. Land Your Dream Role.",
    subtitle: "From unknowledgeable beginner to industry-ready candidate.",
    details: "Whether you are a fresh graduate, candidate switcher, or experienced developer, Career Engine guides you every step.",
    highlight: "Ready to launch? Your Career Engine is waiting.",
  },
];

export default function IntroHero({ onEnter }: IntroHeroProps) {
  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // 3D Tilt Card State
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-advance slides if playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < STORY_STEPS.length - 1 ? prev + 1 : 0));
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // 3D Mouse Parallax Tilt Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      rx: -(y / rect.height) * 12,
      ry: (x / rect.width) * 12,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  const handleNext = () => {
    setIsPlaying(false);
    setActiveStep((prev) => (prev < STORY_STEPS.length - 1 ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setActiveStep((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleFinish = () => {
    setFadeOut(true);
    setTimeout(() => onEnter(), 500);
  };

  if (!mounted) return null;

  const current = STORY_STEPS[activeStep];

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#03060c] flex flex-col justify-between p-4 sm:p-6 overflow-hidden select-none transition-all duration-500 ${
        fadeOut ? "opacity-0 scale-95" : "opacity-100"
      }`}
    >
      {/* Dynamic 3D Ambient Lighting Canvas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-zinc-500/15 via-slate-600/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-zinc-400/15 via-slate-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* TOP BAR: Logo Header & Skip */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-zinc-100 via-slate-200 to-zinc-400 text-zinc-950 shadow-lg shadow-white/10">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-zinc-400 tracking-wider uppercase flex items-center gap-2">
              CAREER ENGINE
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold">
                v3.0 AI
              </span>
            </h1>
            <p className="text-[10px] text-zinc-400 flex items-center gap-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300 animate-pulse" />
              Interactive AI Career Guidance
            </p>
          </div>
        </div>

        {/* Skip button */}
        <button
          onClick={handleFinish}
          className="text-xs font-bold text-zinc-400 hover:text-zinc-100 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
        >
          Skip Intro <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* MAIN 3D SLIDE CAROUSEL DECK */}
      <main className="relative z-10 w-full max-w-4xl mx-auto my-auto py-2 flex flex-col items-center">
        
        {/* 3D Perspective Wrapper */}
        <div
          className="w-full"
          style={{ perspective: "1200px" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div
            ref={cardRef}
            className="relative w-full p-6 sm:p-8 rounded-3xl bg-zinc-950/85 border border-zinc-700/80 backdrop-blur-xl shadow-[0_0_50px_rgba(255,255,255,0.08)] transition-all duration-300 ease-out flex flex-col gap-6"
            style={{
              transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(10px)`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Specular top highlight line */}
            <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none rounded-full" />

            {/* Ambient inner glow gradient */}
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${current.glowColor} pointer-events-none opacity-90`} />

            {/* Slide Header: Step Badge & Auto-Play Toggle */}
            <div className="relative z-10 flex items-center justify-between">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border shadow-sm ${current.badgeColor}`}>
                {current.badge}
              </span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-[10px] font-black text-zinc-300 hover:text-white flex items-center gap-1.5 bg-zinc-900/90 px-3 py-1.5 rounded-full border border-zinc-700 hover:border-zinc-500 transition-all cursor-pointer shadow-[0_0_12px_rgba(255,255,255,0.05)]"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3 h-3 text-zinc-200" /> Auto Playing
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-emerald-400" /> Paused
                  </>
                )}
              </button>
            </div>

            {/* Slide Content Layout */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Icon Box with 3D Float */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-900/80 border border-zinc-700/80 shadow-[inset_0_0_20px_rgba(255,255,255,0.04)]">
                <div className="p-5 rounded-2xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-600/80 shadow-[0_0_25px_rgba(255,255,255,0.15)] animate-bounce" style={{ animationDuration: "3.5s" }}>
                  {current.icon}
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black text-zinc-300 uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 text-zinc-200 animate-pulse" /> Step {activeStep + 1} of {STORY_STEPS.length}
                </div>
              </div>

              {/* Text Description Box */}
              <div className="md:col-span-8 text-left space-y-3.5">
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-zinc-300 leading-tight tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.25)]">
                  {current.title}
                </h2>
                <p className="text-xs sm:text-sm font-bold text-zinc-200">
                  {current.subtitle}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  {current.details}
                </p>

                {/* Highlight banner */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-emerald-950/40 border border-emerald-500/30 flex items-center gap-2.5 text-xs font-bold text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{current.highlight}</span>
                </div>
              </div>

            </div>

            {/* Step Navigation Dots Bar */}
            <div className="relative z-10 flex items-center justify-center gap-2.5 pt-2 border-t border-zinc-800/80">
              {STORY_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setIsPlaying(false); setActiveStep(i); }}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === activeStep
                      ? "w-10 bg-gradient-to-r from-white to-zinc-300 shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                      : "w-2.5 bg-zinc-800 hover:bg-zinc-600"
                  }`}
                  title={`Go to step ${i + 1}`}
                />
              ))}
            </div>

          </div>
        </div>

      </main>

      {/* BOTTOM CONTROL BAR: Fits all screen resolutions cleanly */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-between gap-4 pt-2">
        {/* Prev Button */}
        <button
          onClick={handlePrev}
          disabled={activeStep === 0}
          className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 border transition-all cursor-pointer ${
            activeStep === 0
              ? "opacity-30 border-zinc-800 text-zinc-600 cursor-not-allowed"
              : "bg-zinc-900/90 border-zinc-700 hover:border-zinc-400 text-zinc-300 hover:text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        {/* Launch / Next Button */}
        <div className="flex items-center gap-3">
          {activeStep < STORY_STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-xl text-xs font-black bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 hover:text-white border border-zinc-600 hover:border-zinc-400 shadow-[0_0_15px_rgba(255,255,255,0.08)] flex items-center gap-2 transition-all cursor-pointer"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : null}

          {/* Primary Action CTA */}
          <button
            onClick={handleFinish}
            className="silver-button-primary px-7 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-zinc-950 flex items-center gap-2.5 hover:scale-105 transition-transform"
          >
            <Brain className="w-4 h-4" /> Start My Career Journey
          </button>
        </div>
      </footer>

    </div>
  );
}
