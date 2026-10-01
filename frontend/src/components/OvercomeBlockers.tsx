"use client";

import React from "react";
import { HelpCircle, ChevronRight, CheckCircle, ExternalLink, Lightbulb } from "lucide-react";

interface SkillBlocker {
  skill_name: string;
  required_level: number;
  candidate_level: number;
}

interface OvercomeBlockersProps {
  blockers: SkillBlocker[];
}

export default function OvercomeBlockers({ blockers }: OvercomeBlockersProps) {
  // Custom actionable guidelines per blocker skill
  const getActionPlan = (skill: string): { steps: string[]; resourceName: string; resourceUrl: string } => {
    const plans: Record<string, { steps: string[]; resourceName: string; resourceUrl: string }> = {
      "SQL Querying": {
        steps: [
          "Master SELECT statements, JOINS, aggregate functions, and GROUP BY clauses.",
          "Practice daily on SQL interactive platforms like LeetCode or HackerRank.",
          "Build a database design schema project for a library or e-commerce store."
        ],
        resourceName: "freeCodeCamp: SQL Beginner to Advanced Course",
        resourceUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY"
      },
      "Power BI / Tableau": {
        steps: [
          "Learn DAX queries, data modeling, and connecting different data sources.",
          "Build a interactive dashboard analyzing sales or COVID-19 open datasets.",
          "Publish your visual dashboard report to Microsoft Power BI Service or Tableau Public."
        ],
        resourceName: "Microsoft Power BI Official Training Guide",
        resourceUrl: "https://learn.microsoft.com/en-us/power-bi/"
      },
      "Python & Machine Learning": {
        steps: [
          "Master Scikit-Learn libraries, supervised regression, and classifier models.",
          "Understand evaluation metrics: Precision, Recall, F1-Score, and ROC-AUC curve.",
          "Download a Kaggle dataset, run EDA, train a random forest model, and publish the notebook."
        ],
        resourceName: "Coursera: Andrew Ng Machine Learning Specialization",
        resourceUrl: "https://www.coursera.org/specializations/machine-learning-introduction"
      },
      "Deep Learning & PyTorch/TF": {
        steps: [
          "Learn neural networks, weights, activation functions, and backpropagation.",
          "Build a convolutional neural network (CNN) image classification model using PyTorch.",
          "Experiment with pre-trained models (Transfer Learning) on Hugging Face."
        ],
        resourceName: "PyTorch Official Tutorials & Examples",
        resourceUrl: "https://pytorch.org/tutorials/"
      },
      "React & Frontend Frameworks": {
        steps: [
          "Master React hooks (useState, useEffect, useContext, useMemo).",
          "Learn Next.js 14 App Router, routing states, and Server Actions.",
          "Build a fully responsive task tracker or web landing page using Tailwind CSS."
        ],
        resourceName: "Next.js Official Learn Curriculum",
        resourceUrl: "https://nextjs.org/learn"
      },
      "Node.js & Express / Python API": {
        steps: [
          "Create local API routes with request handling and response serialization.",
          "Connect servers to PostgreSQL or MongoDB databases with models.",
          "Implement token-based user authentication (JWT) and middleware security."
        ],
        resourceName: "FastAPI Official Documentation & Tutorial",
        resourceUrl: "https://fastapi.tiangolo.com/"
      },
      "Docker & CI/CD Pipelines": {
        steps: [
          "Write Dockerfiles to containerize your Next.js or FastAPI applications.",
          "Build multi-container apps using Docker Compose.",
          "Set up GitHub Actions to run tests automatically on code pushes."
        ],
        resourceName: "GitHub Actions CI/CD Complete Walkthrough",
        resourceUrl: "https://github.com/features/actions"
      }
    };

    return plans[skill] || {
      steps: [
        "Review official documentation and core concept libraries.",
        "Build a simple sandbox/proof-of-concept project demonstrating this skill.",
        "Add evidence of this skill (certificates, repo links) to your uploaded resume."
      ],
      resourceName: "Search Top Dev Resources on Google",
      resourceUrl: "https://www.google.com"
    };
  };

  return (
    <div className="glass-card p-6 border border-zinc-700/60 bg-zinc-950/85 rounded-3xl space-y-6 shadow-[0_0_35px_rgba(255,255,255,0.06)] h-full flex flex-col justify-between">
      <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
        <div className="p-2.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <Lightbulb className="w-5 h-5 text-red-400 animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-zinc-300">
            Overcome Blockers
          </h3>
          <p className="text-xs text-zinc-400 font-medium">Actionable roadmaps to resolve your job readiness skill gaps.</p>
        </div>
      </div>

      {blockers.length === 0 ? (
        <div className="p-5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-center space-y-2.5 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
          <p className="text-sm font-bold text-zinc-100">No Job Blockers Detected!</p>
          <p className="text-xs text-zinc-400 font-medium">Your skill confidence meets or exceeds all target thresholds for this role.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blockers.map((blocker, idx) => {
            const plan = getActionPlan(blocker.skill_name);
            return (
              <div
                key={idx}
                className="p-4.5 rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/20 via-zinc-900/70 to-red-950/20 hover:border-red-500/50 transition-all space-y-3.5 shadow-[0_0_15px_rgba(239,68,68,0.08)] hover:shadow-[0_0_25px_rgba(239,68,68,0.18)]"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-red-300 flex items-center gap-2">
                    🔴 {blocker.skill_name}
                  </span>
                  <div className="text-[10px] font-black font-mono bg-red-500/15 text-red-300 px-3 py-1 rounded-full border border-red-500/30 shadow-sm">
                    Confidence: {(blocker.candidate_level ?? 0).toFixed(0)}% / Target: {(blocker.required_level ?? 0).toFixed(0)}%
                  </div>
                </div>

                {/* Steps List */}
                <ul className="space-y-2 text-xs text-zinc-300 pl-2">
                  {plan.steps.map((step, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span className="font-medium">{step}</span>
                    </li>
                  ))}
                </ul>

                {/* Recommended Study Material Link */}
                <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3 text-[11px]">
                  <span className="text-zinc-400 font-bold">Recommended Resource:</span>
                  <a
                    href={plan.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-100 hover:text-white font-bold flex items-center gap-1.5 hover:underline cursor-pointer bg-zinc-900/90 px-3 py-1 rounded-lg border border-zinc-700/80 hover:border-zinc-400 shadow-sm transition-all"
                  >
                    <span>{plan.resourceName}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-300" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
