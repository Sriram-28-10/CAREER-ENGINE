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
    icon: <FileSearch className="w-10 h-10 text-indigo-400" />,
    badge: "01 · THE PROBLEM",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    glowColor: "from-indigo-500/20 via-indigo-600/10 to-transparent",
    title: "You Have a Resume. But Do You Know Your True Standing?",
    subtitle: "Most candidates guess their readiness or rely on generic job defaults.",
    details: "Your resume contains valuable experience, but matching it against real engineering thresholds manually is nearly impossible.",
    highlight: "SCORPIUS AI changes that in seconds.",
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
    icon: <TrendingUp className="w-10 h-10 text-purple-400" />,
    badge: "03 · THE TWIN ROADMAP",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    glowColor: "from-purple-500/20 via-purple-600/10 to-transparent",
    title: "Your Personal Career Twin & Job Blockers Emerge",
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
    subtitle: "Live camera/mic proctoring with tab-switch detection.",
    details: "Test your knowledge under real exam conditions with automated anti-cheat monitoring and instant AI transcript evaluations.",
    highlight: "Build interview confidence with instant AI feedback.",
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-cyan-400" />,
    badge: "05 · THE DESTINATION",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    glowColor: "from-cyan-500/20 via-cyan-600/10 to-transparent",
    title: "Walk In Confident. Land Your Dream Role.",
    subtitle: "From unknowledgeable beginner to industry-ready candidate.",
    details: "Whether you are a fresh graduate, candidate switcher, or experienced developer, your Career Twin guides you every step.",
    highlight: "Ready to launch? Your AI Twin is waiting.",
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
      className={`fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-4 sm:p-6 overflow-hidden select-none transition-all duration-500 ${
        fadeOut ? "opacity-0 scale-95" : "opacity-100"
      }`}
    >
      {/* Dynamic 3D Ambient Lighting Canvas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-indigo-600/20 via-emerald-600/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* TOP BAR: Logo Header & Skip */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/25">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-wider uppercase flex items-center gap-2">
              SCORPIUS TWIN
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-bold">
                v3.0 AI
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              Interactive AI Career Guidance
            </p>
          </div>
        </div>

        {/* Skip button */}
        <button
          onClick={handleFinish}
          className="text-xs font-bold text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center gap-1"
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
            className="relative w-full p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-out flex flex-col gap-6"
            style={{
              transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(10px)`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Ambient inner glow gradient */}
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${current.glowColor} pointer-events-none opacity-80`} />

            {/* Slide Header: Step Badge & Auto-Play Toggle */}
            <div className="relative z-10 flex items-center justify-between">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${current.badgeColor}`}>
                {current.badge}
              </span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-200 flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-full border border-slate-800 transition-all cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3 h-3 text-indigo-400" /> Auto Playing
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
              <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/60 border border-slate-800 shadow-inner">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl animate-bounce" style={{ animationDuration: "3s" }}>
                  {current.icon}
                </div>
                <div className="mt-4 flex items-center gap-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <Zap className="w-3 h-3 text-amber-400" /> Step {activeStep + 1} of {STORY_STEPS.length}
                </div>
              </div>

              {/* Text Description Box */}
              <div className="md:col-span-8 text-left space-y-3">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
                  {current.title}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-indigo-300">
                  {current.subtitle}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {current.details}
                </p>

                {/* Highlight banner */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{current.highlight}</span>
                </div>
              </div>

            </div>

            {/* Step Navigation Dots Bar */}
            <div className="relative z-10 flex items-center justify-center gap-2 pt-2 border-t border-slate-800/80">
              {STORY_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setIsPlaying(false); setActiveStep(i); }}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    i === activeStep
                      ? "w-8 bg-indigo-500 shadow-lg shadow-indigo-500/50"
                      : "w-2 bg-slate-800 hover:bg-slate-700"
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
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
            activeStep === 0
              ? "opacity-30 border-slate-800 text-slate-600 cursor-not-allowed"
              : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        {/* Launch / Next Button */}
        <div className="flex items-center gap-3">
          {activeStep < STORY_STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : null}

          {/* Primary Action CTA */}
          <button
            onClick={handleFinish}
            className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/30 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer border border-indigo-400/30 animate-pulse"
          >
            <Brain className="w-4 h-4" /> Start My Career Journey
          </button>
        </div>
      </footer>

    </div>
  );
}
