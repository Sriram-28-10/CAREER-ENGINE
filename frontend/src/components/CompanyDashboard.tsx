"use client";

import React, { useState } from "react";
import {
  Search, Users, TrendingUp, Briefcase, FileText, CheckCircle,
  Brain, Filter, Sparkles, Star, Target, ShieldAlert, RefreshCw
} from "lucide-react";

// Mock student twin candidate database for companies to browse
const MOCK_CANDIDATES = [
  {
    name: "Aravind Swamy",
    role: "Data Analyst Intern",
    readiness: 86,
    skills: ["SQL Querying", "Python & Pandas", "Power BI / Tableau", "Data Cleaning & EDA"],
    email: "aravind.swamy@gmail.com",
    blockers: 0
  },
  {
    name: "Meera Nair",
    role: "Web Developer",
    readiness: 91,
    skills: ["HTML5 & CSS3 Styling", "JavaScript ES6+", "React & Frontend Frameworks", "Git Version Control"],
    email: "meera.nair@webdev.io",
    blockers: 0
  },
  {
    name: "Rohan Das",
    role: "Data Scientist",
    readiness: 72,
    skills: ["Python & Machine Learning", "Statistical Modeling & Math", "SQL & Data Wrangling"],
    email: "rohan.das@data.co",
    blockers: 2
  },
  {
    name: "Shreya Ghoshal",
    role: "Full Stack Developer",
    readiness: 78,
    skills: ["React & Frontend Frameworks", "Node.js & Express / Python API", "REST API & GraphQL Integration"],
    email: "shreya.g@fullstack.dev",
    blockers: 1
  },
  {
    name: "Vikram Malhotra",
    role: "Data Engineer",
    readiness: 64,
    skills: ["SQL & Data Wrangling", "Docker & CI/CD Pipelines"],
    email: "vikram.m@bigdata.net",
    blockers: 3
  }
];

export default function CompanyDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
  const [jobDescription, setJobDescription] = useState("");
  const [matchingResults, setMatchingResults] = useState<any[] | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  // Filter candidates
  const filteredCandidates = MOCK_CANDIDATES.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = selectedRoleFilter === "all" || c.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Simple Job Description matching algorithm
  const handleJobMatch = () => {
    if (!jobDescription.trim()) return;
    setIsMatching(true);
    setTimeout(() => {
      const jdKeywords = jobDescription.toLowerCase().split(/\s+/);
      const matches = MOCK_CANDIDATES.map((c) => {
        let matchScore = 0;
        let matchedSkills: string[] = [];
        
        c.skills.forEach((skill) => {
          const words = skill.toLowerCase().split(/\s+/);
          const hasWord = words.some((w) => jdKeywords.includes(w) || jobDescription.toLowerCase().includes(w));
          if (hasWord) {
            matchScore += 25;
            matchedSkills.push(skill);
          }
        });

        // Cap match score at 100
        const totalScore = Math.min(100, Math.max(30, Math.round(matchScore + (c.readiness * 0.4))));
        return {
          name: c.name,
          role: c.role,
          readiness: c.readiness,
          matchScore: totalScore,
          matchedSkills
        };
      }).sort((a, b) => b.matchScore - a.matchScore);

      setMatchingResults(matches);
      setIsMatching(false);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Recruiter stats metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-zinc-800/80 text-zinc-200 border border-zinc-700/80">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">Active Talent Pool</p>
            <h4 className="text-2xl font-black text-zinc-100">{MOCK_CANDIDATES.length} Candidates</h4>
          </div>
        </div>

        <div className="glass-card p-5 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">Avg. Readiness Index</p>
            <h4 className="text-2xl font-black text-emerald-400">78.2% Avg Score</h4>
          </div>
        </div>

        <div className="glass-card p-5 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">Requirements Matched</p>
            <h4 className="text-2xl font-black text-amber-400">3 Open Positions</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Search Candidates Panel */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-card p-6 border border-zinc-800 bg-zinc-950/80 rounded-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Talent Search Center</h3>
                <p className="text-xs text-zinc-400">Search and screen candidate skill profiles registered in Career Engine.</p>
              </div>
              
              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-zinc-500" />
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="Data Analyst Intern">Data Analyst</option>
                  <option value="Web Developer">Web Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Full Stack Developer">Full Stack</option>
                  <option value="Data Engineer">Data Engineer</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search candidates by name or technical skill (e.g. React, SQL, Python)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-100 focus:outline-none transition-all"
              />
              <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-zinc-500" />
            </div>

            {/* Candidates List */}
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {filteredCandidates.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  No candidates match the filter parameters.
                </div>
              ) : (
                filteredCandidates.map((c, i) => (
                  <div key={i} className="p-4 bg-zinc-950/90 border border-zinc-800 rounded-xl space-y-3.5 hover:border-zinc-600 transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-white">{c.name}</h4>
                        <p className="text-[10px] text-zinc-300 font-bold tracking-wide uppercase mt-0.5">{c.role}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono text-zinc-500 block uppercase">READINESS SCORE</span>
                        <span className={`text-base font-black ${c.readiness >= 85 ? "text-emerald-400" : c.readiness >= 70 ? "text-zinc-200" : "text-amber-400"}`}>
                          {c.readiness}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {c.skills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-zinc-900 text-zinc-300 font-mono text-[9px] rounded font-semibold border border-zinc-800">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center border-t border-zinc-900 pt-3 text-[10px] text-zinc-500">
                      <span>Contact: <strong className="text-zinc-400 font-medium">{c.email}</strong></span>
                      <span className={`flex items-center gap-1 font-bold ${c.blockers === 0 ? "text-emerald-400" : "text-red-400"}`}>
                        <Target className="w-3.5 h-3.5" />
                        {c.blockers === 0 ? "Perfect Match" : `${c.blockers} Skill Blockers`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Job Match Analyzer Panel */}
        <div className="space-y-6">
          <div className="glass-card p-5 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-zinc-200 animate-pulse" />
              <h3 className="text-sm font-bold text-white">Job Match Analyzer</h3>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Paste a custom Job Description below. AI-driven matching parses candidate parameters to calculate the eligibility score.
            </p>

            <textarea
              rows={6}
              placeholder="Paste job description requirements... (e.g. We are looking for a Web Developer with experience in React, JavaScript ES6, HTML5, CSS3, and Git...)"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-zinc-500 transition-all resize-none leading-relaxed"
            />

            <button
              onClick={handleJobMatch}
              disabled={isMatching || !jobDescription.trim()}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                jobDescription.trim() && !isMatching
                  ? "bg-gradient-to-r from-zinc-100 via-slate-200 to-zinc-300 hover:from-white hover:to-zinc-100 text-zinc-950 shadow-lg shadow-white/10"
                  : "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
              }`}
            >
              {isMatching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                  Matching Candidates...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  Run Matching Analysis
                </>
              )}
            </button>
          </div>

          {/* Matching Results */}
          {matchingResults && (
            <div className="glass-card p-5 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-4 animate-in fade-in duration-200">
              <h4 className="text-xs font-bold text-zinc-300 tracking-wider uppercase">MATCH REPORT</h4>
              <div className="space-y-3">
                {matchingResults.map((res, i) => (
                  <div key={i} className="p-3 bg-zinc-950 rounded-xl space-y-2 text-xs border border-zinc-800">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-zinc-200">{res.name}</span>
                      <span className={`font-black ${res.matchScore >= 80 ? "text-emerald-400" : res.matchScore >= 60 ? "text-zinc-200" : "text-amber-400"}`}>
                        {res.matchScore}% Match
                      </span>
                    </div>
                    {res.matchedSkills.length > 0 && (
                      <p className="text-[10px] text-zinc-400 leading-normal">
                        Matched skills: <span className="text-emerald-400 font-bold">{res.matchedSkills.join(", ")}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
