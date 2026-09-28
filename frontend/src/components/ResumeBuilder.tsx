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
      alert("Resume synced successfully! Your Career Twin scorecard has updated dynamically.");
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-start">
      {/* 1. Resume Entry Form */}
      <div className="glass-card p-6 border border-slate-800 bg-slate-900/60 rounded-2xl shadow-xl space-y-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-base font-bold text-white">AI Resume Builder</h3>
            <p className="text-[11px] text-slate-400">Fill in details to auto-assemble a clean tech resume.</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          {/* Row 1: Name & Age */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="22"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Row 3: DOB & Education */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Education / Degree</label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="B.Tech Computer Science"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Certificates */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Certificates (Comma Separated)</label>
            <input
              type="text"
              value={certificates}
              onChange={(e) => setCertificates(e.target.value)}
              placeholder="AWS Cloud Practitioner, Certified Data Associate"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Projects */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Project Highlights</label>
            <textarea
              value={projects}
              onChange={(e) => setProjects(e.target.value)}
              placeholder="E-commerce backend REST API with NodeJS & MongoDB; React Dashboard for stock tracking."
              rows={3}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Skill Checklist */}
          <div className="space-y-2">
            <label className="text-slate-400 font-medium block">Select Core Skills</label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-950 rounded-lg border border-slate-800">
              {skillOptions.map((skill, idx) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    className={`px-2.5 py-1.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-500/20 border-indigo-500/80 text-indigo-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
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
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            Generate Resume Template
          </button>
        </form>
      </div>

      {/* 2. Visual Document Preview */}
      <div className="glass-card p-6 border border-slate-800 bg-slate-900/60 rounded-2xl shadow-xl min-h-[500px] flex flex-col justify-between">
        {!isGenerated ? (
          <div className="flex flex-col items-center justify-center flex-1 text-slate-500 space-y-2">
            <FileText className="w-12 h-12 stroke-[1.2] opacity-40" />
            <p className="text-sm font-semibold">No Resume Generated</p>
            <p className="text-xs text-center max-w-xs">Fill in your personal details and click generate to view the interactive preview sheet.</p>
          </div>
        ) : (
          <div className="flex flex-col justify-between h-full space-y-6">
            {/* Printable Resume Sheet */}
            <div id="printable-resume-card" className="p-6 bg-white text-slate-900 rounded-xl space-y-5 shadow-2xl border border-slate-200">
              {/* Header */}
              <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-end">
                <div className="space-y-0.5">
                  <h2 className="text-2xl font-black tracking-tight">{name || "Your Name"}</h2>
                  {/* Standardised contact row */}
                  <p className="text-[10px] text-slate-600">
                    <span className="font-semibold">Email:</span>{" "}
                    <a href={`mailto:${email}`} className="underline text-indigo-700">{email || "Not specified"}</a>
                    {" | "}
                    <span className="font-semibold">Phone:</span> {phone || "Not specified"}
                  </p>
                  {/* Standardised personal info row */}
                  <p className="text-[10px] text-slate-500">
                    <span className="font-semibold">Age:</span> {age || "--"}{" | "}
                    <span className="font-semibold">Date of Birth:</span> {formatDob(dob)}
                  </p>
                </div>
                <span className="text-[9px] font-bold font-mono border border-slate-800 px-2 py-0.5 rounded">
                  TEAM SCORPIUS ASSEMBLED
                </span>
              </div>

              {/* Education */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">Education</h4>
                <p className="text-xs font-semibold text-slate-800">{education || "Not specified"}</p>
              </div>

              {/* Certificates — clean bullet list */}
              {certificates && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">Certifications</h4>
                  <ul className="space-y-0.5 list-disc list-inside">
                    {parseList(certificates).map((cert, i) => (
                      <li key={i} className="text-xs text-slate-700 leading-snug">{cert}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Projects — achievement-focused bullet statements */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">Project Highlights</h4>
                {projects ? (
                  <ul className="space-y-1 list-disc list-inside">
                    {parseList(projects).map((proj, i) => (
                      <li key={i} className="text-xs text-slate-700 leading-snug">
                        {/* Ensure each bullet reads as an action statement */}
                        {/^(built|designed|developed|implemented|engineered|architected|automated|deployed|created)/i.test(proj.trim())
                          ? proj.trim()
                          : `Developed ${proj.trim()}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">No projects specified.</p>
                )}
              </div>

              {/* Skills — grouped by category */}
              {selectedSkills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">Core Technical Skills</h4>
                  {Object.entries(SKILL_CATEGORIES).map(([category, categorySkills]) => {
                    const matched = categorySkills.filter((s) => selectedSkills.includes(s));
                    if (matched.length === 0) return null;
                    return (
                      <div key={category} className="flex gap-2 items-start">
                        <span className="text-[9px] font-bold text-slate-500 uppercase w-20 shrink-0 pt-0.5">{category}</span>
                        <div className="flex flex-wrap gap-1">
                          {matched.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-800 font-mono text-[9px] rounded font-semibold border border-slate-200">
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
            <div className="flex gap-3 border-t border-slate-800 pt-4">
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print / Download PDF
              </button>

              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/25 transition-all"
              >
                {syncing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Sync with Career Twin
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
