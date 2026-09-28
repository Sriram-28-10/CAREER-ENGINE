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
      <div className="glass-card p-6 border border-slate-800 bg-slate-900/90 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 text-emerald-400">
          <CheckCircle className="w-6 h-6" />
          <div>
            <h3 className="font-bold text-slate-100">85%+ Job Readiness Benchmark Achieved!</h3>
            <p className="text-xs text-slate-400">No additional minimum learning path steps required for this role.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 border border-slate-800 bg-slate-900/90 rounded-2xl shadow-xl space-y-4">
      
      {/* Header & Total Hours Card */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Fastest Path to 85%+ Job Readiness</h2>
            <p className="text-xs text-slate-400">Sorted by ROI (Readiness Gain % / Learning Effort Hours)</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Clock className="w-4 h-4" />
            <span>Total Effort: {pathData.total_hours_needed} hrs</span>
          </div>
          <div className="text-slate-400 text-xs flex items-center gap-1">
            <span>Target:</span>
            <span className="font-bold text-emerald-400">{pathData.target_readiness_pct}%</span>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {pathData.learning_path.map((step) => (
          <div
            key={step.step_number}
            className="p-4 bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/30">
                {step.step_number}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-100 text-sm">{step.skill_name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    {step.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{step.action}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Effort: </span>
                <strong className="text-slate-200">{step.learning_effort_hours} hrs</strong>
              </div>
              <div className="bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-lg">
                <span className="text-slate-400">Gain: </span>
                <strong className="text-emerald-400">+{step.readiness_gain}%</strong>
              </div>
              <div className="bg-amber-950/40 border border-amber-800/50 px-3 py-1.5 rounded-lg">
                <span className="text-slate-400">ROI: </span>
                <strong className="text-amber-400">{step.roi} %/hr</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
