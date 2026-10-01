"use client";

import React from "react";
import { Clock, Zap, ArrowRight, CheckCircle, Target } from "lucide-react";

interface PathStep {
  step_number: number;
  skill_name: string;
  category: string;
  current_level: number;
  required_level: number;
  learning_effort_hours: number;
  readiness_gain: number;
  roi: number;
  action: string;
}

interface MinimumPathData {
  target_readiness_pct: number;
  initial_readiness_pct: number;
  projected_readiness_pct: number;
  is_target_reached: boolean;
  total_hours_needed: number;
  steps_count: number;
  learning_path: PathStep[];
}

interface MinimumPathWidgetProps {
  pathData: MinimumPathData | null;
}

export default function MinimumPathWidget({ pathData }: MinimumPathWidgetProps) {
  if (!pathData || !pathData.learning_path || pathData.learning_path.length === 0) {
    return (
      <div className="glass-card p-6 border border-zinc-800 bg-zinc-950/80 rounded-2xl shadow-2xl shadow-black/50">
        <div className="flex items-center gap-3 text-emerald-400">
          <CheckCircle className="w-6 h-6" />
          <div>
            <h3 className="font-bold text-zinc-100">85%+ Job Readiness Benchmark Achieved!</h3>
            <p className="text-xs text-zinc-400">No additional minimum learning path steps required for this role.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-7 border border-zinc-700/60 bg-zinc-950/85 rounded-3xl shadow-[0_0_35px_rgba(255,255,255,0.06)] space-y-5">
      
      {/* Header & Total Hours Card */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-zinc-800/80 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-100 border border-zinc-700/80 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <Zap className="w-5 h-5 text-zinc-200" />
          </div>
          <div>
            <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-zinc-300">
              Fastest Path to 85%+ Job Readiness
            </h2>
            <p className="text-xs text-zinc-400 font-medium">Sorted by ROI (Readiness Gain % / Learning Effort Hours)</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900/90 px-4 py-2.5 rounded-2xl border border-zinc-700/80 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-2 text-zinc-200 font-bold text-xs">
            <Clock className="w-4 h-4 text-zinc-300" />
            <span>Total Effort: <strong className="text-white">{pathData.total_hours_needed} hrs</strong></span>
          </div>
          <div className="text-zinc-400 text-xs flex items-center gap-1.5 border-l border-zinc-750 pl-3">
            <span>Target:</span>
            <span className="font-black text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/40 shadow-sm">{pathData.target_readiness_pct}%</span>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {pathData.learning_path.map((step) => (
          <div
            key={step.step_number}
            className="p-4 bg-gradient-to-r from-zinc-900/70 via-zinc-950/80 to-zinc-900/70 border border-zinc-750 border-zinc-700/60 hover:border-zinc-400/80 rounded-2xl transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_15px_rgba(255,255,255,0.03)] hover:shadow-[0_0_25px_rgba(255,255,255,0.08)]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-white to-zinc-300 text-zinc-950 font-black flex items-center justify-center text-sm shadow-[0_0_15px_rgba(255,255,255,0.3)] shrink-0 border border-white">
                {step.step_number}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-zinc-100 text-sm">{step.skill_name}</h3>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-lg bg-zinc-900 text-zinc-300 font-bold border border-zinc-700 shadow-sm">
                    {step.category}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 font-medium">{step.action}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs flex-wrap">
              <div className="bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-700 shadow-sm">
                <span className="text-zinc-400">Effort: </span>
                <strong className="text-zinc-100">{step.learning_effort_hours} hrs</strong>
              </div>
              <div className="bg-emerald-950/50 border border-emerald-500/40 px-3 py-1.5 rounded-xl shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                <span className="text-zinc-300 font-medium">Gain: </span>
                <strong className="text-emerald-300 font-black">+{step.readiness_gain}%</strong>
              </div>
              <div className="bg-zinc-900 border border-zinc-700/80 px-3 py-1.5 rounded-xl shadow-sm">
                <span className="text-zinc-400">ROI: </span>
                <strong className="text-zinc-100 font-bold">{step.roi} %/hr</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
