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
      color: "text-indigo-400",
      border: "border-indigo-500/30",
      bg: "bg-indigo-500/10",
      icon: <Clock className="w-5 h-5 text-indigo-400" />,
      arc: "text-slate-700",
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
    color: "text-indigo-400",
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/10",
    icon: <AlertCircle className="w-5 h-5 text-indigo-400" />,
    arc: "text-indigo-500",
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

  return (
    <div className="glass-card p-6 border border-slate-800 bg-slate-900/90 rounded-2xl shadow-xl flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Career Readiness Twin</h2>
            <p className="text-xs text-slate-400">AI-Verified Qualification Level</p>
          </div>
        </div>
        {isBoosted && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Simulated Projection
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

        {/* Gauge Arc — now shows status label instead of raw % */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950/60 border border-slate-800 rounded-xl gap-3">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle */}
              <circle
                cx="50" cy="50" r="45"
                className="text-slate-800 stroke-current"
                strokeWidth="10" fill="transparent"
              />
              {/* Progress Arc */}
              <circle
                cx="50" cy="50" r="45"
                className={`transition-all duration-700 ease-out stroke-current ${theme.arc}`}
                strokeWidth="10"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            {/* Status label inside circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
              <span className={`text-xs font-black uppercase tracking-wider leading-tight ${theme.color}`}>
                {status}
              </span>
              {isBoosted ? (
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-sm font-bold text-slate-500 line-through">{displayCurrent}%</span>
                  <span className="text-base font-extrabold text-emerald-400">{displayProjected}%</span>
                </div>
              ) : (
                <span className="text-base font-extrabold text-slate-300 mt-1">{displayCurrent}%</span>
              )}
            </div>
          </div>

          {/* Overall Summary */}
          {hasFeedback && readinessFeedback?.overall_summary ? (
            <p className="text-xs text-slate-400 text-center leading-relaxed italic">
              {readinessFeedback.overall_summary}
            </p>
          ) : (
            <p className="text-xs text-slate-500 text-center leading-relaxed italic">
              Upload your resume to receive contextual AI feedback on your career readiness.
            </p>
          )}
        </div>

        {/* Three domain feedback cards */}
        <div className="md:col-span-8 grid grid-cols-1 gap-3">

          {/* Technical Feedback */}
          <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1 gap-2">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Technical Competency</p>
                {!hasFeedback && (
                  <span className="text-xs font-bold text-blue-400 shrink-0">{Math.round(breakdown.Technical || 0)}%</span>
                )}
              </div>
              {hasFeedback && readinessFeedback?.technical_feedback ? (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {readinessFeedback.technical_feedback}
                </p>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  Upload your resume to get contextual feedback on your core engineering skills and logic.
                </p>
              )}
            </div>
          </div>

          {/* Practical Feedback */}
          <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
              <Wrench className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1 gap-2">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Practical Experience</p>
                {!hasFeedback && (
                  <span className="text-xs font-bold text-emerald-400 shrink-0">{Math.round(breakdown.Practical || 0)}%</span>
                )}
              </div>
              {hasFeedback && readinessFeedback?.practical_feedback ? (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {readinessFeedback.practical_feedback}
                </p>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  Your projects and hands-on experience will be evaluated upon resume upload.
                </p>
              )}
            </div>
          </div>

          {/* Certification Feedback */}
          <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0 mt-0.5">
              <Award className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1 gap-2">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Certifications & Credentials</p>
                {!hasFeedback && (
                  <span className="text-xs font-bold text-purple-400 shrink-0">{Math.round(breakdown.Certification || 0)}%</span>
                )}
              </div>
              {hasFeedback && readinessFeedback?.certification_feedback ? (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {readinessFeedback.certification_feedback}
                </p>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  Certifications, course completions, and accreditations will be listed here.
                </p>
              )}
            </div>
          </div>

          {/* AI badge — only when Gemini feedback is active */}
          {hasFeedback && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                Powered by Gemini AI · Contextual Resume Analysis
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
