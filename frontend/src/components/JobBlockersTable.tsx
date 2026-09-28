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
    <div className="glass-card p-6 border border-slate-800 bg-slate-900/90 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Job Blockers & Requirement Matrix</h2>
            <p className="text-xs text-slate-400">Candidate Level vs Target Role Thresholds</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          blockerCount > 0
            ? "bg-red-500/10 text-red-400 border border-red-500/30"
            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
        }`}>
          {blockerCount > 0 ? `🔴 ${blockerCount} Job Blocker(s)` : "🟢 Fully Ready!"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
              <th className="py-3 px-4">Skill Name</th>
              <th className="py-3 px-4">Domain Category</th>
              <th className="py-3 px-4">Candidate Level</th>
              <th className="py-3 px-4">Required Level</th>
              <th className="py-3 px-4">Gap</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {skills.map((skill, idx) => (
              <tr
                key={idx}
                className={`hover:bg-slate-800/40 transition-colors ${
                  skill.is_blocker ? "bg-red-950/10" : ""
                }`}
              >
                <td className="py-3 px-4 font-semibold text-slate-200 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${skill.is_blocker ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
                  {skill.skill_name}
                </td>
                <td className="py-3 px-4 text-slate-400 text-xs">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                    {skill.category}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${skill.is_blocker ? "bg-red-400" : "bg-emerald-400"}`}
                        style={{ width: `${Math.min(100, skill.candidate_level)}%` }}
                      />
                    </div>
                    <span>{Math.round(skill.candidate_level)}%</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-300 font-semibold">
                  {Math.round(skill.required_level)}%
                </td>
                <td className="py-3 px-4 font-medium">
                  {skill.gap > 0 ? (
                    <span className="text-red-400 font-bold">-{Math.round(skill.gap)}%</span>
                  ) : (
                    <span className="text-emerald-400 font-medium">0%</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {skill.is_blocker ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
                      <AlertCircle className="w-3.5 h-3.5" /> 🔴 Blocker
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
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
