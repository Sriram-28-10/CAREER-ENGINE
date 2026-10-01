"use client";

import React from "react";
import { Gauge, Cpu, Wrench, Award, TrendingUp, Sparkles, CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface ReadinessGaugeProps {
  currentScore: number;
  projectedScore?: number | null;
  breakdown: {
    Technical?: number;
    Practical?: number;
    Certification?: number;
  };
  readinessFeedback?: {
    overall_status?: string;
    overall_summary?: string;
    technical_feedback?: string;
    practical_feedback?: string;
    certification_feedback?: string;
  } | null;
}

// Map overall_status to a color theme
function getStatusTheme(status: string) {
  const s = status?.toLowerCase() || "";
  if (s.includes("pending")) {
    return {
      color: "text-zinc-300",
      border: "border-zinc-700/60",
      bg: "bg-zinc-800/60",
      icon: <Clock className="w-5 h-5 text-zinc-300" />,
      arc: "text-zinc-600",
    };
  }
  if (s.includes("industry ready") || s.includes("ready")) {
    return {
      color: "text-emerald-400",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      arc: "text-emerald-500",
    };
  }
  if (s.includes("developing")) {
    return {
      color: "text-amber-400",
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      arc: "text-amber-500",
    };
  }
  // Gaps Identified / default
  return {
    color: "text-zinc-200",
    border: "border-zinc-700/60",
    bg: "bg-zinc-800/60",
    icon: <AlertCircle className="w-5 h-5 text-zinc-300" />,
    arc: "text-zinc-300",
  };
}

export default function ReadinessGauge({
  currentScore,
  projectedScore,
  breakdown,
  readinessFeedback,
}: ReadinessGaugeProps) {
  const isPending = !readinessFeedback || !readinessFeedback.overall_status || readinessFeedback.overall_status.toLowerCase().includes("pending");

  const displayCurrent = isPending ? 0 : Math.round(currentScore || 0);
  const displayProjected = projectedScore ? Math.round(projectedScore) : null;
  const isBoosted = displayProjected !== null && displayProjected !== displayCurrent;

  const scoreForGauge = isPending ? 0 : (isBoosted ? displayProjected! : displayCurrent);

  // Gauge arc (SVG circle animation)
  const strokeDasharray = 283;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * (scoreForGauge / 100));

  // Feedback values
  const hasFeedback = readinessFeedback && readinessFeedback.overall_status && !isPending;
  const status = readinessFeedback?.overall_status || "Pending Upload";
  const theme = getStatusTheme(status);

  // Glow filter color based on status
  const glowShadow = status.toLowerCase().includes("ready")
    ? "drop-shadow(0 0 14px rgba(52, 211, 153, 0.65))"
    : status.toLowerCase().includes("developing")
    ? "drop-shadow(0 0 14px rgba(245, 158, 11, 0.65))"
    : "drop-shadow(0 0 12px rgba(255, 255, 255, 0.45))";

  return (
    <div className="glass-card p-6 border border-zinc-700/60 bg-zinc-950/85 rounded-3xl shadow-[0_0_35px_rgba(255,255,255,0.06)] flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-100 border border-zinc-700/80 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <Gauge className="w-5 h-5 text-zinc-200" />
          </div>
          <div>
            <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-zinc-300">
              Career Engine Readiness
            </h2>
            <p className="text-xs text-zinc-400 font-medium">AI-Verified Qualification Level</p>
          </div>
        </div>
        {isBoosted && (
          <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-300 border border-emerald-400/40 animate-pulse flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <TrendingUp className="w-4 h-4" /> Simulated Projection
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

        {/* Gauge Arc — with Radiant Drop-Shadow & Starlight Center Glow */}
        <div className="md:col-span-4 relative flex flex-col items-center justify-center p-5 bg-gradient-to-b from-zinc-900/80 via-zinc-950/90 to-zinc-900/80 border border-zinc-750 border-zinc-700/60 rounded-2xl gap-3 shadow-[inset_0_0_30px_rgba(255,255,255,0.03)] overflow-hidden group">
          {/* Subtle cosmic radial back-glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07),transparent_70%)] pointer-events-none" />

          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle */}
              <circle
                cx="50" cy="50" r="45"
                className="text-zinc-850 text-zinc-800/80 stroke-current"
                strokeWidth="9" fill="transparent"
              />
              {/* Progress Arc with Glowing Drop Shadow */}
              <circle
                cx="50" cy="50" r="45"
                className={`transition-all duration-700 ease-out stroke-current ${theme.arc}`}
                style={{ filter: glowShadow }}
                strokeWidth="9"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            {/* Status label inside circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
              <span className={`text-[11px] font-black uppercase tracking-wider leading-tight ${theme.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]`}>
                {status}
              </span>
              {isBoosted ? (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="text-sm font-bold text-zinc-500 line-through">{displayCurrent}%</span>
                  <span className="text-lg font-black text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]">{displayProjected}%</span>
                </div>
              ) : (
                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-zinc-200 mt-1 drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                  {displayCurrent}%
                </span>
              )}
            </div>
          </div>

          {/* Overall Summary */}
          {hasFeedback && readinessFeedback?.overall_summary ? (
            <p className="text-xs text-zinc-300 text-center leading-relaxed italic font-medium">
              "{readinessFeedback.overall_summary}"
            </p>
          ) : (
            <p className="text-xs text-zinc-400 text-center leading-relaxed italic">
              Upload your resume to receive contextual AI feedback on your career readiness.
            </p>
          )}
        </div>

        {/* Three domain feedback cards with Specular Edge Highlights */}
        <div className="md:col-span-8 grid grid-cols-1 gap-3.5">

          {/* Technical Feedback */}
          <div className="p-4 bg-gradient-to-r from-zinc-900/70 via-zinc-950/80 to-zinc-900/70 border border-zinc-700/60 hover:border-zinc-400/80 rounded-2xl flex items-start gap-3.5 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.03)] hover:shadow-[0_0_25px_rgba(255,255,255,0.08)]">
            <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-100 shrink-0 mt-0.5 border border-zinc-700/80 shadow-[0_0_12px_rgba(255,255,255,0.1)]">
              <Cpu className="w-4 h-4 text-zinc-200" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <p className="text-xs text-zinc-300 font-bold uppercase tracking-wider">Technical Competency</p>
                {!hasFeedback && (
                  <span className="text-xs font-black text-zinc-100 shrink-0 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-700 shadow-sm">{Math.round(breakdown.Technical || 0)}%</span>
                )}
              </div>
              {hasFeedback && readinessFeedback?.technical_feedback ? (
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  {readinessFeedback.technical_feedback}
                </p>
              ) : (
                <p className="text-xs text-zinc-500 leading-relaxed italic">
                  Upload your resume to get contextual feedback on your core engineering skills and logic.
                </p>
              )}
            </div>
          </div>

          {/* Practical Feedback */}
          <div className="p-4 bg-gradient-to-r from-zinc-900/70 via-zinc-950/80 to-zinc-900/70 border border-zinc-700/60 hover:border-emerald-500/50 rounded-2xl flex items-start gap-3.5 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.03)] hover:shadow-[0_0_25px_rgba(16,185,129,0.12)]">
            <div className="p-2.5 rounded-xl bg-emerald-950/40 text-emerald-300 shrink-0 mt-0.5 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <Wrench className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <p className="text-xs text-zinc-300 font-bold uppercase tracking-wider">Practical Experience</p>
                {!hasFeedback && (
                  <span className="text-xs font-black text-emerald-300 shrink-0 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-500/40 shadow-sm">{Math.round(breakdown.Practical || 0)}%</span>
                )}
              </div>
              {hasFeedback && readinessFeedback?.practical_feedback ? (
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  {readinessFeedback.practical_feedback}
                </p>
              ) : (
                <p className="text-xs text-zinc-500 leading-relaxed italic">
                  Your projects and hands-on experience will be evaluated upon resume upload.
                </p>
              )}
            </div>
          </div>

          {/* Certification Feedback */}
          <div className="p-4 bg-gradient-to-r from-zinc-900/70 via-zinc-950/80 to-zinc-900/70 border border-zinc-700/60 hover:border-amber-500/50 rounded-2xl flex items-start gap-3.5 transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.03)] hover:shadow-[0_0_25px_rgba(245,158,11,0.12)]">
            <div className="p-2.5 rounded-xl bg-amber-950/40 text-amber-300 shrink-0 mt-0.5 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Award className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <p className="text-xs text-zinc-300 font-bold uppercase tracking-wider">Certifications & Credentials</p>
                {!hasFeedback && (
                  <span className="text-xs font-black text-amber-300 shrink-0 bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-500/40 shadow-sm">{Math.round(breakdown.Certification || 0)}%</span>
                )}
              </div>
              {hasFeedback && readinessFeedback?.certification_feedback ? (
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  {readinessFeedback.certification_feedback}
                </p>
              ) : (
                <p className="text-xs text-zinc-500 leading-relaxed italic">
                  Certifications, course completions, and accreditations will be listed here.
                </p>
              )}
            </div>
          </div>

          {/* AI badge — with luminous specular pill */}
          {hasFeedback && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-zinc-900/90 via-zinc-850 to-zinc-900/90 border border-zinc-600/80 shadow-[0_0_20px_rgba(255,255,255,0.08)]">
              <Sparkles className="w-4 h-4 text-zinc-100 animate-pulse" />
              <span className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-zinc-300 uppercase tracking-wider">
                Powered by Gemini AI · Contextual Intelligence Matrix
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
