"use client";

import React, { useState } from "react";
import { FileText, Printer, CheckCircle, RefreshCw, Sparkles } from "lucide-react";

interface ResumeBuilderProps {
  onSyncResume: (parsedSkills: string[], resumeText: string) => void;
}

/** Format ISO date string (YYYY-MM-DD) → "28 Aug 2003" */
function formatDob(isoDate: string): string {
  if (!isoDate) return "Not specified";
  const d = new Date(isoDate + "T00:00:00");
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Parse a comma- or semicolon-separated string into a trimmed string array. */
function parseList(raw: string): string[] {
  return raw
    .split(/[;,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Skill category groupings */
const SKILL_CATEGORIES: Record<string, string[]> = {
  Programming: ["Python & Pandas", "JavaScript ES6+", "TypeScript", "SQL Querying"],
  "Data Tools": ["Power BI / Tableau", "Data Cleaning & EDA", "Statistical Analysis", "Apache Spark / PySpark"],
  Cloud: ["AWS Cloud", "GCP BigQuery", "Azure Fundamentals", "Snowflake / Redshift"],
  Frontend: ["HTML5 & CSS3", "React & Next.js", "Responsive Design", "DOM & Web APIs"],
  DevOps: ["Git Version Control", "Docker & Containers", "CI/CD Pipelines", "GitHub Actions"],
};

export default function ResumeBuilder({ onSyncResume }: ResumeBuilderProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [education, setEducation] = useState("");
  const [certificates, setCertificates] = useState("");
  const [projects, setProjects] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [isGenerated, setIsGenerated] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Flat deduplicated list derived from category map
  const skillOptions = Array.from(new Set(Object.values(SKILL_CATEGORIES).flat()));

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !education || !projects) {
      alert("Please fill in Name, Education, and Projects to generate the resume.");
      return;
    }
    setIsGenerated(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSync = () => {
    if (!isGenerated) {
      alert("Please generate the resume first before syncing.");
      return;
    }
    setSyncing(true);
    
    // Construct text blob representing the resume for parsing
    const resumeTextBlob = `
      Name: ${name}
      Email: ${email} | Phone: ${phone}
      Age: ${age} | DOB: ${dob}
      Education: ${education}
      Certificates: ${certificates}
      Projects: ${projects}
      Skills: ${selectedSkills.join(", ")}
    `;

    setTimeout(() => {
      onSyncResume(selectedSkills, resumeTextBlob);
      setSyncing(false);
      alert("Resume synced successfully! Your Career Engine scorecard has updated dynamically.");
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-start">
      {/* 1. Resume Entry Form */}
      <div className="glass-card p-7 border border-zinc-700/60 bg-zinc-950/85 rounded-3xl shadow-[0_0_35px_rgba(255,255,255,0.06)] space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <FileText className="w-5 h-5 text-zinc-200" />
          </div>
          <div>
            <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-zinc-300">
              AI Resume Builder
            </h3>
            <p className="text-[11px] text-zinc-400 font-medium">Fill in details to auto-assemble a clean tech resume.</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          {/* Row 1: Name & Age */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-bold">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full p-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-zinc-100 outline-none focus:border-zinc-300 transition-all shadow-inner placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-bold">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="22"
                className="w-full p-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-zinc-100 outline-none focus:border-zinc-300 transition-all shadow-inner placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-bold">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full p-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-zinc-100 outline-none focus:border-zinc-300 transition-all shadow-inner placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-bold">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-zinc-100 outline-none focus:border-zinc-300 transition-all shadow-inner placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Row 3: DOB & Education */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-bold">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full p-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-zinc-100 outline-none focus:border-zinc-300 transition-all shadow-inner"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-bold">Education / Degree</label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="B.Tech Computer Science"
                className="w-full p-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-zinc-100 outline-none focus:border-zinc-300 transition-all shadow-inner placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Certificates */}
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-bold">Certificates (Comma Separated)</label>
            <input
              type="text"
              value={certificates}
              onChange={(e) => setCertificates(e.target.value)}
              placeholder="AWS Cloud Practitioner, Certified Data Associate"
              className="w-full p-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-zinc-100 outline-none focus:border-zinc-300 transition-all shadow-inner placeholder:text-zinc-600"
            />
          </div>

          {/* Projects */}
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-bold">Project Highlights</label>
            <textarea
              value={projects}
              onChange={(e) => setProjects(e.target.value)}
              placeholder="E-commerce backend REST API with NodeJS & MongoDB; React Dashboard for stock tracking."
              rows={3}
              className="w-full p-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-zinc-100 outline-none focus:border-zinc-300 transition-all resize-none shadow-inner placeholder:text-zinc-600"
            />
          </div>

          {/* Skill Checklist */}
          <div className="space-y-2">
            <label className="text-zinc-300 font-bold block">Select Core Skills</label>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-700/80 shadow-inner">
              {skillOptions.map((skill, idx) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-zinc-800 border-zinc-300 text-white shadow-[0_0_12px_rgba(255,255,255,0.15)] ring-1 ring-white/30"
                        : "bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="silver-button-primary w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-zinc-950 animate-pulse" />
            Generate Resume Template
          </button>
        </form>
      </div>

      {/* 2. Visual Document Preview */}
      <div className="glass-card p-7 border border-zinc-700/60 bg-zinc-950/85 rounded-3xl shadow-[0_0_35px_rgba(255,255,255,0.06)] min-h-[500px] flex flex-col justify-between">
        {!isGenerated ? (
          <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 space-y-3 py-16">
            <FileText className="w-14 h-14 stroke-[1.2] opacity-40 text-zinc-300 animate-pulse" />
            <p className="text-sm font-bold text-zinc-200">No Resume Generated</p>
            <p className="text-xs text-center max-w-xs text-zinc-400 font-medium">Fill in your personal details and click generate to view the interactive preview sheet.</p>
          </div>
        ) : (
          <div className="flex flex-col justify-between h-full space-y-6">
            {/* Printable Resume Sheet */}
            <div id="printable-resume-card" className="p-7 bg-white text-zinc-900 rounded-2xl space-y-5 shadow-2xl border border-zinc-300">
              {/* Header */}
              <div className="border-b-2 border-zinc-900 pb-3.5 flex justify-between items-end">
                <div className="space-y-0.5">
                  <h2 className="text-2xl font-black tracking-tight text-zinc-950">{name || "Your Name"}</h2>
                  {/* Standardised contact row */}
                  <p className="text-[10px] text-zinc-700">
                    <span className="font-bold">Email:</span>{" "}
                    <a href={`mailto:${email}`} className="underline text-zinc-950 font-medium">{email || "Not specified"}</a>
                    {" | "}
                    <span className="font-bold">Phone:</span> {phone || "Not specified"}
                  </p>
                  {/* Standardised personal info row */}
                  <p className="text-[10px] text-zinc-600">
                    <span className="font-bold">Age:</span> {age || "--"}{" | "}
                    <span className="font-bold">Date of Birth:</span> {formatDob(dob)}
                  </p>
                </div>
                <span className="text-[9px] font-black font-mono border-2 border-zinc-900 px-2.5 py-0.5 rounded text-zinc-950">
                  CAREER ENGINE ASSEMBLED
                </span>
              </div>

              {/* Education */}
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-0.5">Education</h4>
                <p className="text-xs font-semibold text-zinc-800">{education || "Not specified"}</p>
              </div>

              {/* Certificates — clean bullet list */}
              {certificates && (
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-0.5">Certifications</h4>
                  <ul className="space-y-0.5 list-disc list-inside">
                    {parseList(certificates).map((cert, i) => (
                      <li key={i} className="text-xs text-zinc-750 text-zinc-800 leading-snug">{cert}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Projects — achievement-focused bullet statements */}
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-0.5">Project Highlights</h4>
                {projects ? (
                  <ul className="space-y-1 list-disc list-inside">
                    {parseList(projects).map((proj, i) => (
                      <li key={i} className="text-xs text-zinc-800 leading-snug">
                        {/^(built|designed|developed|implemented|engineered|architected|automated|deployed|created)/i.test(proj.trim())
                          ? proj.trim()
                          : `Developed ${proj.trim()}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-zinc-400 italic">No projects specified.</p>
                )}
              </div>

              {/* Skills — grouped by category */}
              {selectedSkills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-0.5">Core Technical Skills</h4>
                  {Object.entries(SKILL_CATEGORIES).map(([category, categorySkills]) => {
                    const matched = categorySkills.filter((s) => selectedSkills.includes(s));
                    if (matched.length === 0) return null;
                    return (
                      <div key={category} className="flex gap-2 items-start">
                        <span className="text-[9px] font-black text-zinc-600 uppercase w-20 shrink-0 pt-0.5">{category}</span>
                        <div className="flex flex-wrap gap-1">
                          {matched.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-zinc-100 text-zinc-900 font-mono text-[9px] rounded font-bold border border-zinc-300">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions Panel */}
            <div className="flex gap-3.5 border-t border-zinc-800/80 pt-4">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 rounded-xl border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Print / Download PDF
              </button>

              <button
                onClick={handleSync}
                disabled={syncing}
                className="silver-button-primary flex-1 py-3 rounded-xl text-zinc-950 text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {syncing ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-zinc-950" />
                )}
                Sync with Career Engine
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
