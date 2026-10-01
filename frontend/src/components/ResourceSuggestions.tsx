"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, ExternalLink, Video, Award, Search, Sparkles, CheckCircle } from "lucide-react";

interface ResourceItem {
  name?: string;
  title?: string;
  url: string;
  provider?: string;
  rating?: number;
  type?: string;
  channel?: string;
  duration?: string;
}

interface ResourceSuggestionsProps {
  selectedRole: string;
  blockerSkills: Array<{ skill_name: string }>;
}

export default function ResourceSuggestions({
  selectedRole,
  blockerSkills,
}: ResourceSuggestionsProps) {
  const [resources, setResources] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    fetch("http://localhost:8000/api/resources")
      .then((res) => res.json())
      .then((data) => {
        setResources(data);
      })
      .catch((err) => console.warn("Resources API error:", err));
  }, [selectedRole]);

  const targetSkillNames = blockerSkills.length > 0
    ? blockerSkills.map((b) => b.skill_name)
    : ["SQL Querying", "Power BI / Tableau", "Python & Machine Learning", "React & Frontend Frameworks"];

  return (
    <div className="glass-card p-7 border border-zinc-700/60 bg-zinc-950/85 rounded-3xl shadow-[0_0_35px_rgba(255,255,255,0.06)] space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800/80 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-100 border border-zinc-700/80 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <BookOpen className="w-5 h-5 text-zinc-200" />
          </div>
          <div>
            <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-zinc-300 flex items-center gap-2">
              Smart Learning Material & Resource Suggestion Box
              <Sparkles className="w-4 h-4 text-zinc-200 animate-pulse" />
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              Top Google Search Results, Coursera/DataCamp Courses & Top YouTube Playlists for Blocker Gaps
            </p>
          </div>
        </div>

        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-zinc-900/90 text-zinc-200 border border-zinc-700/80 flex items-center gap-1.5 w-fit shadow-sm">
          <Search className="w-3.5 h-3.5 text-zinc-300" /> Top Google & Platform Results
        </span>
      </div>

      {/* Suggested Resources List grouped by skill */}
      <div className="space-y-6">
        {targetSkillNames.map((skillName) => {
          const item = resources[skillName] || {
            platforms: [
              { name: `Coursera: ${skillName} Specialization`, url: `https://www.google.com/search?q=${encodeURIComponent(skillName + " coursera course")}`, provider: "Coursera", rating: 4.8 },
              { name: `Udemy: Master ${skillName}`, url: `https://www.google.com/search?q=${encodeURIComponent(skillName + " udemy course")}`, provider: "Udemy", rating: 4.7 }
            ],
            docs: [
              { name: `${skillName} Official Guide & Documentation`, url: `https://www.google.com/search?q=${encodeURIComponent(skillName + " official documentation")}`, type: "Official Docs" }
            ],
            youtube: [
              { title: `${skillName} Full Tutorial - Beginner to Advanced`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skillName + " full course freeCodeCamp")}`, channel: "freeCodeCamp.org", duration: "4:00:00" }
            ]
          };

          return (
            <div key={skillName} className="bg-gradient-to-r from-zinc-900/70 via-zinc-950/80 to-zinc-900/70 border border-zinc-750 border-zinc-700/60 rounded-2xl p-5 space-y-4 shadow-[0_0_15px_rgba(255,255,255,0.03)]">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                <h3 className="font-black text-zinc-100 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                  Target Gap: <strong className="text-emerald-300">{skillName}</strong>
                </h3>
                <span className="text-[11px] text-zinc-300 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-700 font-bold shadow-sm">
                  Recommended Learning Materials
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Top Learning Platform Courses */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-zinc-300" /> Top Course Platforms
                  </h4>
                  <div className="space-y-2">
                    {item.platforms?.map((p: any, idx: number) => (
                      <a
                        key={idx}
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-750 border-zinc-700/60 hover:border-zinc-400 block transition-all group shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-zinc-200 group-hover:text-white">
                          <span className="truncate max-w-[180px]">{p.name}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200" />
                        </div>
                        <p className="text-[10px] text-zinc-400 font-medium mt-1">
                          {p.provider} • Rating: ⭐ {p.rating || 4.8}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>

                {/* 2. Official Documentation & Guides */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Docs & Interactive Guides
                  </h4>
                  <div className="space-y-2">
                    {item.docs?.map((d: any, idx: number) => (
                      <a
                        key={idx}
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-750 border-zinc-700/60 hover:border-emerald-500/50 block transition-all group shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.12)]"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-zinc-200 group-hover:text-emerald-300">
                          <span className="truncate max-w-[180px]">{d.name}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400" />
                        </div>
                        <p className="text-[10px] text-zinc-400 font-medium mt-1">
                          Type: {d.type}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>

                {/* 3. Top YouTube Video Playlists */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> Top YouTube Video Tutorials
                  </h4>
                  <div className="space-y-2">
                    {item.youtube?.map((y: any, idx: number) => (
                      <a
                        key={idx}
                        href={y.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-750 border-zinc-700/60 hover:border-red-500/50 block transition-all group shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.12)]"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-zinc-200 group-hover:text-red-300">
                          <span className="truncate max-w-[180px]">{y.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-400" />
                        </div>
                        <p className="text-[10px] text-zinc-400 font-medium mt-1">
                          📺 {y.channel} • {y.duration}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
