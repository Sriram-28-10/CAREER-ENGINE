"use client";

import React, { useState, useEffect } from "react";
import {
  Shield, Cpu, Activity, RefreshCw, Server, Users, Award,
  CheckCircle, AlertTriangle, Plus, Trash, HelpCircle, Save
} from "lucide-react";

export default function AdminDashboard() {
  const [ollamaStatus, setOllamaStatus] = useState<any>({ loading: true, available: false, model: "" });
  const [systemStats, setSystemStats] = useState({
    totalStudents: 142,
    totalCompanies: 18,
    avgScore: 74.5,
    totalAssessments: 480
  });

  // Mock Question Database Editor for demo purposes
  const [customQuestions, setCustomQuestions] = useState<any[]>([
    { id: 1, role: "data_analyst_intern", question: "What is your experience with Tableau?", type: "technical" },
    { id: 2, role: "web_developer", question: "Describe how state flows in React applications.", type: "technical" }
  ]);

  const [newQuestion, setNewQuestion] = useState({ role: "data_analyst_intern", question: "", type: "technical" });

  const fetchOllamaHealth = async () => {
    setOllamaStatus({ loading: true, available: false, model: "" });
    try {
      const res = await fetch("http://localhost:8000/api/ollama/health");
      if (res.ok) {
        const data = await res.json();
        setOllamaStatus({
          loading: false,
          available: data.available || false,
          model: data.model || "None"
        });
      } else {
        setOllamaStatus({ loading: false, available: false, model: "Unavailable" });
      }
    } catch {
      setOllamaStatus({ loading: false, available: false, model: "Offline" });
    }
  };

  useEffect(() => {
    fetchOllamaHealth();
  }, []);

  const addQuestion = () => {
    if (!newQuestion.question.trim()) return;
    setCustomQuestions((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        ...newQuestion
      }
    ]);
    setNewQuestion({ role: "data_analyst_intern", question: "", type: "technical" });
  };

  const removeQuestion = (id: number) => {
    setCustomQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">System Students</p>
            <h4 className="text-xl font-black text-slate-100">{systemStats.totalStudents}</h4>
          </div>
        </div>

        <div className="glass-card p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">System Companies</p>
            <h4 className="text-xl font-black text-slate-100">{systemStats.totalCompanies}</h4>
          </div>
        </div>

        <div className="glass-card p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">System Avg Score</p>
            <h4 className="text-xl font-black text-slate-100">{systemStats.avgScore}%</h4>
          </div>
        </div>

        <div className="glass-card p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Total Assessments</p>
            <h4 className="text-xl font-black text-slate-100">{systemStats.totalAssessments}</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Monitor Server Health Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">LLM Server Health</h3>
              </div>
              <button
                onClick={fetchOllamaHealth}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
                title="Refresh Status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${ollamaStatus.loading ? "animate-spin text-indigo-400" : ""}`} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Status indicator */}
              <div className="flex items-center justify-between p-3.5 bg-slate-95% border border-slate-800 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Ollama Client Status</span>
                {ollamaStatus.loading ? (
                  <span className="text-xs text-indigo-400 font-bold flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking
                  </span>
                ) : ollamaStatus.available ? (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> ONLINE
                  </span>
                ) : (
                  <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> OFFLINE
                  </span>
                )}
              </div>

              {/* Model indicator */}
              <div className="flex items-center justify-between p-3.5 bg-slate-95% border border-slate-800 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Active LLM Model</span>
                <span className="text-xs text-slate-200 font-mono font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {ollamaStatus.loading ? "---" : ollamaStatus.model || "None"}
                </span>
              </div>

              <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 text-indigo-300 rounded-xl text-[10px] leading-relaxed">
                <p className="font-bold flex items-center gap-1 mb-1">
                  <Cpu className="w-3.5 h-3.5" /> Ollama Integration Notes:
                </p>
                Ollama local LLM service facilitates mock interview grading and conversational chatbot replies. Make sure you run Ollama locally on port 11434 with a downloaded model like Llama3.2.
              </div>
            </div>
          </div>
        </div>

        {/* Right Q&A Manager Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 border border-slate-800 bg-slate-900/60 rounded-2xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Interview Questions Manager</h3>
              <p className="text-xs text-slate-400">View and append custom mock interview questions to the active database.</p>
            </div>

            {/* Add Custom Question Form */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4 text-xs">
              <span className="font-bold text-slate-300 block">Add New Custom Question</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500">Target Role</label>
                  <select
                    value={newQuestion.role}
                    onChange={(e) => setNewQuestion((prev) => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 px-3 py-2.5 rounded-lg text-slate-250 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="data_analyst_intern">Data Analyst</option>
                    <option value="web_developer">Web Developer</option>
                    <option value="data_scientist">Data Scientist</option>
                    <option value="full_stack_developer">Full Stack</option>
                    <option value="data_engineer">Data Engineer</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Category</label>
                  <select
                    value={newQuestion.type}
                    onChange={(e) => setNewQuestion((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 px-3 py-2.5 rounded-lg text-slate-250 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="technical">Technical</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="hr">HR</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500">Question Content</label>
                <input
                  type="text"
                  placeholder="Type mock question text..."
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion((prev) => ({ ...prev, question: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={addQuestion}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>

            {/* Questions Table */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              <span className="font-bold text-xs text-slate-400">Questions List</span>
              {customQuestions.map((q) => (
                <div key={q.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1.5">
                    <p className="font-bold text-slate-200">{q.question}</p>
                    <div className="flex gap-2">
                      <span className="text-[8px] font-mono bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-400 uppercase">
                        {q.role.replace("_", " ")}
                      </span>
                      <span className="text-[8px] font-mono bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-indigo-300 uppercase">
                        {q.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="p-1 rounded hover:bg-slate-900 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
