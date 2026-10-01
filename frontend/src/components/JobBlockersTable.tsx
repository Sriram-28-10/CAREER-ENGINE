"use client";

import React from "react";
import { AlertCircle, CheckCircle2, ShieldAlert, Layers } from "lucide-react";

interface SkillItem {
  skill_name: string;
  candidate_level: number;
  required_level: number;
  category: string;
  gap: number;
  status: string;
  is_blocker: boolean;
}

interface JobBlockersTableProps {
  skills: SkillItem[];
}

export default function JobBlockersTable({ skills }: JobBlockersTableProps) {
  const blockerCount = skills.filter((s) => s.is_blocker).length;

  return (
    <div className="glass-card p-6 border border-zinc-700/60 bg-zinc-950/85 rounded-3xl shadow-[0_0_35px_rgba(255,255,255,0.06)] h-full flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-zinc-300">
              Job Blockers & Requirement Matrix
            </h2>
            <p className="text-xs text-zinc-400 font-medium">Candidate Level vs Target Role Thresholds</p>
          </div>
        </div>
        <span className={`px-3.5 py-1.5 rounded-full text-xs font-black shadow-sm ${
          blockerCount > 0
            ? "bg-red-500/15 text-red-300 border border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.25)]"
            : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
        }`}>
          {blockerCount > 0 ? `🔴 ${blockerCount} Job Blocker(s)` : "🟢 Fully Ready!"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-xs font-bold text-zinc-300 uppercase tracking-wider bg-zinc-900/80">
              <th className="py-3.5 px-4 rounded-l-xl">Skill Name</th>
              <th className="py-3.5 px-4">Domain Category</th>
              <th className="py-3.5 px-4">Candidate Level</th>
              <th className="py-3.5 px-4">Required Level</th>
              <th className="py-3.5 px-4">Gap</th>
              <th className="py-3.5 px-4 text-center rounded-r-xl">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-sm">
            {skills.map((skill, idx) => (
              <tr
                key={idx}
                className={`hover:bg-zinc-900/70 transition-colors ${
                  skill.is_blocker ? "bg-red-950/15" : ""
                }`}
              >
                <td className="py-3.5 px-4 font-bold text-zinc-100 flex items-center gap-2.5 whitespace-nowrap min-w-[200px]">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${skill.is_blocker ? "bg-red-400 animate-pulse shadow-[0_0_8px_#ef4444]" : "bg-emerald-400 shadow-[0_0_8px_#10b981]"}`} />
                  <span className="truncate">{skill.skill_name}</span>
                </td>
                <td className="py-3 px-4 text-zinc-400 text-xs font-medium">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700/80 text-zinc-300 font-semibold shadow-sm">
                    {skill.category}
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-zinc-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-24 bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-700/80 shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all ${
                          skill.is_blocker
                            ? "bg-gradient-to-r from-red-500 to-rose-400 shadow-[0_0_10px_#ef4444]"
                            : "bg-gradient-to-r from-emerald-500 to-emerald-300 shadow-[0_0_10px_#10b981]"
                        }`}
                        style={{ width: `${Math.min(100, skill.candidate_level)}%` }}
                      />
                    </div>
                    <span>{Math.round(skill.candidate_level)}%</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-zinc-200 font-bold">
                  {Math.round(skill.required_level)}%
                </td>
                <td className="py-3 px-4 font-bold">
                  {skill.gap > 0 ? (
                    <span className="text-red-400 font-black">-{Math.round(skill.gap)}%</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">0%</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {skill.is_blocker ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-500/15 text-red-300 border border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                      <AlertCircle className="w-3.5 h-3.5" /> 🔴 Blocker
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 🟢 Ready
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
