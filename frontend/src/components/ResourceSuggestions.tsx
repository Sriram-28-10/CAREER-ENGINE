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
    <div className="glass-card p-6 border border-slate-800 bg-slate-900/90 rounded-2xl shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Smart Learning Material & Resource Suggestion Box
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </h2>
            <p className="text-xs text-slate-400">
              Top Google Search Results, Coursera/DataCamp Courses & Top YouTube Playlists for Blocker Gaps
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
          <Search className="w-3.5 h-3.5" /> Top Google & Platform Results
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
            <div key={skillName} className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Target Gap: <strong className="text-emerald-400">{skillName}</strong>
                </h3>
                <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Recommended Learning Materials
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Top Learning Platform Courses */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Top Course Platforms
                  </h4>
                  <div className="space-y-2">
                    {item.platforms?.map((p: any, idx: number) => (
                      <a
                        key={idx}
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 block transition-all group"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                          <span className="truncate max-w-[180px]">{p.name}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {p.provider} • Rating: ⭐ {p.rating || 4.8}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>

                {/* 2. Official Documentation & Guides */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Docs & Interactive Guides
                  </h4>
                  <div className="space-y-2">
                    {item.docs?.map((d: any, idx: number) => (
                      <a
                        key={idx}
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 block transition-all group"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-200 group-hover:text-emerald-300">
                          <span className="truncate max-w-[180px]">{d.name}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Type: {d.type}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>

                {/* 3. Top YouTube Video Playlists */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> Top YouTube Video Tutorials
                  </h4>
                  <div className="space-y-2">
                    {item.youtube?.map((y: any, idx: number) => (
                      <a
                        key={idx}
                        href={y.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-red-500/40 block transition-all group"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-200 group-hover:text-red-300">
                          <span className="truncate max-w-[180px]">{y.title}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-red-400" />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
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
