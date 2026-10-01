"use client";

import React, { useState, useEffect } from "react";
import { Sliders, Sparkles, Plus, RotateCcw, Check } from "lucide-react";

interface CounterfactualSimulatorProps {
  selectedRole: string;
  candidateSkills: Record<string, number>;
  onSimulationUpdate: (simulatedData: any) => void;
}

const ROLE_PRESETS: Record<string, Array<{ skill_name: string; label: string; boostLevel: number }>> = {
  data_scientist: [
    { skill_name: "Python & Machine Learning", label: "Train ML Models (+20h)", boostLevel: 90.0 },
    { skill_name: "Deep Learning & PyTorch/TF", label: "Master PyTorch Neural Nets (+25h)", boostLevel: 85.0 },
    { skill_name: "Statistical Modeling & Math", label: "Advanced Statistics (+18h)", boostLevel: 85.0 },
    { skill_name: "SQL & Data Wrangling", label: "Big Data Transformations (+12h)", boostLevel: 85.0 },
    { skill_name: "Model Evaluation & MLOps", label: "Setup MLOps & Docker (+15h)", boostLevel: 80.0 },
    { skill_name: "Data Science Professional Cert", label: "Earn DS Professional Cert (+24h)", boostLevel: 85.0 },
  ],
  web_developer: [
    { skill_name: "HTML5 & CSS3 Styling", label: "Master Modern CSS & Grid (+8h)", boostLevel: 90.0 },
    { skill_name: "JavaScript ES6+", label: "Master JS Async & ES6 (+14h)", boostLevel: 88.0 },
    { skill_name: "Responsive & Mobile Design", label: "Mobile-First Design (+10h)", boostLevel: 85.0 },
    { skill_name: "DOM Manipulation & Web APIs", label: "Web APIs & Fetch (+10h)", boostLevel: 85.0 },
    { skill_name: "Git Version Control", label: "Git & GitHub Workflow (+8h)", boostLevel: 85.0 },
    { skill_name: "Web Development Specialist Cert", label: "Earn Web Dev Cert (+16h)", boostLevel: 80.0 },
  ],
  full_stack_developer: [
    { skill_name: "React & Frontend Frameworks", label: "Build React/Next.js App (+16h)", boostLevel: 90.0 },
    { skill_name: "Node.js & Express / Python API", label: "Develop Express REST API (+18h)", boostLevel: 88.0 },
    { skill_name: "Database Architecture (SQL/NoSQL)", label: "PostgreSQL & MongoDB (+15h)", boostLevel: 85.0 },
    { skill_name: "REST API & GraphQL Integration", label: "GraphQL & WebSockets (+12h)", boostLevel: 85.0 },
    { skill_name: "Docker & CI/CD Pipelines", label: "CI/CD & Docker Deployment (+14h)", boostLevel: 80.0 },
    { skill_name: "Full Stack Engineering Cert", label: "Earn Full Stack Cert (+20h)", boostLevel: 85.0 },
  ],
  data_engineer: [
    { skill_name: "Python & PySpark", label: "Build PySpark Pipeline (+20h)", boostLevel: 90.0 },
    { skill_name: "SQL & Data Warehousing", label: "Snowflake / Redshift DWH (+15h)", boostLevel: 90.0 },
    { skill_name: "ETL Pipeline Orchestration (Airflow)", label: "Airflow DAG Orchestration (+18h)", boostLevel: 85.0 },
    { skill_name: "Kafka & Streaming Architecture", label: "Kafka Event Streaming (+22h)", boostLevel: 80.0 },
    { skill_name: "Cloud Infrastructure (AWS/GCP)", label: "AWS S3 & BigQuery (+16h)", boostLevel: 80.0 },
    { skill_name: "Certified Data Engineer", label: "Earn Cloud DE Cert (+20h)", boostLevel: 80.0 },
  ],
  data_analyst_intern: [
    { skill_name: "SQL Querying", label: "Master SQL Querying (+12h)", boostLevel: 85.0 },
    { skill_name: "Power BI / Tableau", label: "Build Power BI Dashboard (+15h)", boostLevel: 80.0 },
    { skill_name: "Certified Data Associate", label: "Earn Data Cert (+20h)", boostLevel: 85.0 },
    { skill_name: "Python & Pandas", label: "Pandas Data Cleaning (+15h)", boostLevel: 85.0 },
    { skill_name: "Statistical Analysis", label: "Applied Statistics (+14h)", boostLevel: 75.0 },
    { skill_name: "Data Cleaning & EDA", label: "Exploratory EDA (+10h)", boostLevel: 85.0 },
  ],
};

export default function CounterfactualSimulator({
  selectedRole,
  candidateSkills,
  onSimulationUpdate,
}: CounterfactualSimulatorProps) {
  const [activeToggles, setActiveToggles] = useState<Record<string, boolean>>({});
  const [isCalculating, setIsCalculating] = useState(false);

  const presets = ROLE_PRESETS[selectedRole] || ROLE_PRESETS.data_analyst_intern;

  const handleToggle = (skillName: string) => {
    setActiveToggles((prev) => ({
      ...prev,
      [skillName]: !prev[skillName],
    }));
  };

  const handleReset = () => {
    setActiveToggles({});
    onSimulationUpdate(null);
  };

  useEffect(() => {
    const selectedSkillsToBoost: Record<string, number> = {};
    presets.forEach((item) => {
      if (activeToggles[item.skill_name]) {
        selectedSkillsToBoost[item.skill_name] = item.boostLevel;
      }
    });

    if (Object.keys(selectedSkillsToBoost).length === 0) {
      onSimulationUpdate(null);
      return;
    }

    setIsCalculating(true);

    fetch("http://localhost:8000/api/counterfactual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role_id: selectedRole,
        candidate_skills: candidateSkills,
        hypothetical_boosts: selectedSkillsToBoost,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        onSimulationUpdate(data);
      })
      .catch((err) => {
        console.error("Counterfactual API error:", err);
      })
      .finally(() => setIsCalculating(false));
  }, [activeToggles, selectedRole, candidateSkills]);

  const activeCount = Object.values(activeToggles).filter(Boolean).length;

  return (
    <div className="glass-card p-7 border border-zinc-700/60 bg-zinc-950/85 rounded-3xl shadow-[0_0_35px_rgba(255,255,255,0.06)] space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-100 border border-zinc-700/80 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <Sliders className="w-5 h-5 text-zinc-200" />
          </div>
          <div>
            <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-zinc-300 flex items-center gap-2">
              Counterfactual "What-If" Simulator
              <Sparkles className="w-4 h-4 text-zinc-200 animate-pulse" />
            </h2>
            <p className="text-xs text-zinc-400 font-medium">Select hypothetical skill additions to project real-time score updates</p>
          </div>
        </div>

        {activeCount > 0 && (
          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-400 text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Toggles
          </button>
        )}
      </div>

      {/* Interactive Toggle Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {presets.map((item) => {
          const isActive = !!activeToggles[item.skill_name];
          return (
            <button
              key={item.skill_name}
              onClick={() => handleToggle(item.skill_name)}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-300 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-zinc-850 via-zinc-800 to-zinc-850 border-zinc-300 text-white shadow-[0_0_20px_rgba(255,255,255,0.18)] ring-1 ring-white/40 scale-[1.02]"
                  : "bg-zinc-900/60 border-zinc-750 border-zinc-700/60 hover:border-zinc-500 text-zinc-300 hover:text-white shadow-sm"
              }`}
            >
              <div className="space-y-1">
                <p className="text-xs font-bold">{item.label}</p>
                <p className="text-[11px] text-zinc-400 font-medium">Target Level: <span className="text-zinc-200 font-bold">{item.boostLevel}%</span></p>
              </div>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  isActive ? "bg-gradient-to-tr from-white to-zinc-300 text-zinc-950 font-black shadow-[0_0_10px_rgba(255,255,255,0.4)]" : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {isActive ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4" />}
              </div>
            </button>
          );
        })}
      </div>

      {isCalculating && (
        <p className="text-xs text-zinc-300 animate-pulse font-bold text-center">
          ⚡ Recalculating Career Engine projections & ROI path...
        </p>
      )}

    </div>
  );
}
