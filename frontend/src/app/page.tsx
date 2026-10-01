"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ThreeBackground from "@/components/ThreeBackground";
import AuthModal from "@/components/AuthModal";
import UploadSection from "@/components/UploadSection";
import ReadinessGauge from "@/components/ReadinessGauge";
import JobBlockersTable from "@/components/JobBlockersTable";
import MinimumPathWidget from "@/components/MinimumPathWidget";
import CounterfactualSimulator from "@/components/CounterfactualSimulator";
import ResourceSuggestions from "@/components/ResourceSuggestions";
import TransitionOverlay from "@/components/TransitionOverlay";
import AIChatbot from "@/components/AIChatbot";
import OvercomeBlockers from "@/components/OvercomeBlockers";
import MockTestQuiz from "@/components/MockTestQuiz";
import ResumeBuilder from "@/components/ResumeBuilder";
import InterviewPrep from "@/components/InterviewPrep";
import CompanyDashboard from "@/components/CompanyDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import IntroHero from "@/components/IntroHero";

import {
  Brain, RefreshCw, Sparkles, Rocket, FileText, CheckSquare,
  Presentation, Video, Menu, X, ShieldAlert, Cpu, SparkleIcon, Sun, Moon
} from "lucide-react";

const INITIAL_ROLES = [
  { role_id: "data_analyst_intern", role_name: "Data Analyst Intern", description: "Analyzes datasets, builds dashboards, and queries relational databases." },
  { role_id: "data_scientist", role_name: "Data Scientist", description: "Builds predictive models, applies machine learning, and extracts insights from complex data." },
  { role_id: "web_developer", role_name: "Web Developer", description: "Creates responsive, accessible websites using HTML, CSS, JavaScript, and modern tools." },
  { role_id: "full_stack_developer", role_name: "Full Stack Developer", description: "Architects end-to-end web applications combining modern frontend UIs with robust backend APIs." },
  { role_id: "data_engineer", role_name: "Data Engineer", description: "Builds scalable data pipelines, data warehouses, and big data streaming architecture." },
  { role_id: "frontend_dev_intern", role_name: "Frontend Developer Intern", description: "Develops responsive web UIs using React, Next.js, and TypeScript." },
  { role_id: "aiml_intern", role_name: "AI/ML Engineer Intern", description: "Trains machine learning models, works with PyTorch/TensorFlow, and builds pipelines." },
];

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState("data_analyst_intern");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [simulatedData, setSimulatedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedEvidence, setUploadedEvidence] = useState<any>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [readinessFeedback, setReadinessFeedback] = useState<any>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("scorpius_theme", nextTheme);
  };

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("scorpius_theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
    }
    if (!sessionStorage.getItem("scorpius_intro_seen")) {
      setShowIntro(true);
    }
  }, []);


  // Navigation & tabs state
  const [activeTab, setActiveTab] = useState<"dashboard" | "quiz" | "interview" | "builder">("dashboard");
  const [quizBonusScore, setQuizBonusScore] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Transition state
  const [activeTransition, setActiveTransition] = useState<string | null>(null);

  // Detect query redirection parameters (?auth=signin)
  useEffect(() => {
    const authType = searchParams.get("auth");
    if (authType === "signin") {
      setActiveTransition("SYNCING CAREER ENGINE SCORECARD...");
      const timer = setTimeout(() => {
        router.replace("/");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const { data: session } = useSession();

  // Automatically sync NextAuth Google/OAuth session into userProfile & localStorage
  useEffect(() => {
    if (session?.user) {
      const pendingType = localStorage.getItem("scorpius_pending_account_type") || "student";
      const oauthUser = {
        name: session.user.name || "Authenticated Candidate",
        email: session.user.email || "",
        provider: ((session.user as any).provider || "Google") as any,
        accountType: (session.user as any).accountType || pendingType,
        avatar: session.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email || "user"}`,
        roleTitle: "Verified OAuth Profile",
      };
      setUserProfile(oauthUser);
      localStorage.setItem("scorpius_candidate_user", JSON.stringify(oauthUser));
      localStorage.removeItem("scorpius_pending_account_type");
    }
  }, [session]);

  // Sync user state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("scorpius_candidate_user");
    if (storedUser) {
      setUserProfile(JSON.parse(storedUser));
    }
    // Hydrate AI-parsed resume evidence if previously saved
    const storedEvidence = localStorage.getItem("scorpius_resume_evidence");
    if (storedEvidence) {
      setUploadedEvidence(JSON.parse(storedEvidence));
    }
    // Hydrate resume text if previously saved
    const storedResumeText = localStorage.getItem("scorpius_resume_text");
    if (storedResumeText) {
      setResumeText(storedResumeText);
    }
  }, []);

  // Fetch target roles from backend on mount
  useEffect(() => {
    fetch("http://localhost:8000/api/roles")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRoles(data);
        }
      })
      .catch((err) => console.warn("Using preset roles fallback:", err));
  }, []);

  // Fetch analysis for selected role
  const fetchAnalysis = async (roleId: string, customEvidence?: any) => {
    setIsLoading(true);
    try {
      const storedText = localStorage.getItem("scorpius_resume_text") || resumeText || "";
      const payload = {
        role_id: roleId,
        custom_evidence: customEvidence || uploadedEvidence || null,
        resume_text: storedText || null
      };
      const res = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisData({
          overall_readiness_pct: data.analysis.overall_readiness_pct,
          breakdown: data.analysis.breakdown,
          confidence_scores: data.confidence_scores,
          all_skills: data.analysis.all_skills,
          job_blockers: data.analysis.job_blockers,
          minimum_path: data.minimum_path,
          llm_analysis: data.llm_analysis || null
        });
        if (data.readiness_feedback) {
          setReadinessFeedback(data.readiness_feedback);
        }
      }
    } catch (err) {
      console.warn("Backend API offline:", err);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchAnalysis(selectedRole);
  }, [selectedRole]);

  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole);
    setSimulatedData(null);
    setQuizBonusScore(0); // Reset quiz score bonus on role change
  };

  const handleResumeUploaded = (uploadResult: any) => {
    if (uploadResult.analysis) {
      // Persist AI-parsed evidence so it survives role switches
      if (uploadResult.evidence_used) {
        setUploadedEvidence(uploadResult.evidence_used);
        localStorage.setItem("scorpius_resume_evidence", JSON.stringify(uploadResult.evidence_used));
      }
      // Persist raw resume text so feedback regenerates on role switch
      if (uploadResult.resume_text) {
        setResumeText(uploadResult.resume_text);
        localStorage.setItem("scorpius_resume_text", uploadResult.resume_text);
      }
      // Set AI-driven qualitative readiness feedback
      if (uploadResult.readiness_feedback) {
        setReadinessFeedback(uploadResult.readiness_feedback);
      }
      setAnalysisData({
        overall_readiness_pct: uploadResult.analysis.overall_readiness_pct,
        breakdown: uploadResult.analysis.breakdown,
        confidence_scores: uploadResult.confidence_scores,
        all_skills: uploadResult.analysis.all_skills,
        job_blockers: uploadResult.analysis.job_blockers,
        minimum_path: uploadResult.minimum_path,
        llm_analysis: uploadResult.llm_analysis || null,
        ai_parsed: uploadResult.ai_parsed || false
      });
      setQuizBonusScore(0);
    }
  };


  // Sync builder-generated resume with backend scores
  const handleSyncResumeBuilder = (selectedSkills: string[], resumeText: string) => {
    const baseEvidence: Record<string, any> = {};
    selectedSkills.forEach((skill) => {
      baseEvidence[skill] = {
        resume_claim: 95.0,
        github_evidence: 80.0,
        certificate_score: 90.0,
        assessment_score: 85.0
      };
    });

    fetchAnalysis(selectedRole, baseEvidence);
    setActiveTab("dashboard");
    setActiveTransition("PARSING BUILT RESUME...");
  };

  const handleQuizCompletion = (scorePct: number) => {
    if (scorePct >= 80) {
      setQuizBonusScore(10); // +10% readiness reward booster
    } else if (scorePct >= 50) {
      setQuizBonusScore(5); // +5% readiness booster
    } else {
      setQuizBonusScore(0);
    }
  };

  const handleLogoutClear = () => {
    localStorage.removeItem("scorpius_candidate_user");
    setUserProfile(null);
  };

  const currentReadinessScore = Math.min(100.0, (analysisData?.overall_readiness_pct || 0.0) + quizBonusScore);
  const projectedReadinessScore = simulatedData ? simulatedData.projected_readiness_pct : null;
  const currentBreakdown = simulatedData ? simulatedData.simulated_breakdown : (analysisData?.breakdown || { Technical: 0, Practical: 0, Certification: 0 });
  const activeSkillsList = simulatedData ? simulatedData.simulated_all_skills : (analysisData?.all_skills || []);
  const activeMinPath = simulatedData ? simulatedData.simulated_minimum_path : (analysisData?.minimum_path || null);
  const confidenceScores = analysisData?.confidence_scores || {};
  const blockerSkills = (analysisData?.job_blockers || []);

  const activeRoleName = roles.find((r) => r.role_id === selectedRole)?.role_name || selectedRole;
  const userRoleType = userProfile?.accountType || "student"; // Default to student

  return (
    <div className={`relative min-h-screen transition-colors duration-300 ${theme === "light" ? "light-mode bg-slate-50 text-slate-900" : "bg-[#03060c] text-zinc-100"} overflow-x-hidden selection:bg-zinc-200 selection:text-zinc-950`}>

      {/* Intro Hero — shown only once per session */}
      {mounted && showIntro && (
        <IntroHero
          onEnter={() => {
            sessionStorage.setItem("scorpius_intro_seen", "1");
            setShowIntro(false);
          }}
        />
      )}


      {/* 3D Warp redirectional animation overlay */}
      {activeTransition && (
        <TransitionOverlay
          message={activeTransition}
          onComplete={() => setActiveTransition(null)}
        />
      )}

      {/* 3D WebGL Background Canvas */}
      <ThreeBackground />

      {/* Responsive Top Navigation Bar */}
      <nav className="sticky top-0 z-40 w-full border-b border-zinc-700/60 bg-[#03060c]/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab("dashboard")}>
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-white via-slate-100 to-zinc-300 text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] group-hover:scale-105 transition-all duration-300 border border-white/80">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-zinc-300 uppercase hidden sm:block drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                CAREER ENGINE
              </span>
            </div>

            {/* Links based on architecture role */}
            <div className="hidden md:flex items-center space-x-2 text-xs font-bold">
              {userRoleType === "student" && (
                <>
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      activeTab === "dashboard"
                        ? "bg-gradient-to-r from-zinc-800 via-zinc-850 to-zinc-800 text-white border border-zinc-400 shadow-[0_0_18px_rgba(255,255,255,0.2)] font-black"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab("quiz")}
                    className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      activeTab === "quiz"
                        ? "bg-gradient-to-r from-zinc-800 via-zinc-850 to-zinc-800 text-white border border-zinc-400 shadow-[0_0_18px_rgba(255,255,255,0.2)] font-black"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                    }`}
                  >
                    Mock Test
                  </button>
                  <button
                    onClick={() => setActiveTab("interview")}
                    className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      activeTab === "interview"
                        ? "bg-gradient-to-r from-zinc-800 via-zinc-850 to-zinc-800 text-white border border-zinc-400 shadow-[0_0_18px_rgba(255,255,255,0.2)] font-black"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                    }`}
                  >
                    Interview Prep
                  </button>
                  <button
                    onClick={() => setActiveTab("builder")}
                    className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      activeTab === "builder"
                        ? "bg-gradient-to-r from-zinc-800 via-zinc-850 to-zinc-800 text-white border border-zinc-400 shadow-[0_0_18px_rgba(255,255,255,0.2)] font-black"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                    }`}
                  >
                    Resume Creator
                  </button>
                </>
              )}
              {userRoleType === "company" && (
                <span className="text-[10px] text-emerald-300 uppercase tracking-widest font-black bg-emerald-500/15 px-3.5 py-1.5 rounded-full border border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  💼 Company Recruiter Portal
                </span>
              )}
              {userRoleType === "admin" && (
                <span className="text-[10px] text-amber-300 uppercase tracking-widest font-black bg-amber-500/15 px-3.5 py-1.5 rounded-full border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  🛡️ Admin Control Panel
                </span>
              )}
            </div>

            {/* Right section: Profile dropdown/login */}
            <div className="flex items-center gap-3">
              {/* Account badge */}
              {userProfile?.accountType && (
                <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-wider border hidden sm:block ${
                  userProfile.accountType === "student"
                    ? "bg-zinc-900 text-zinc-100 border-zinc-500 shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                    : userProfile.accountType === "company"
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                    : "bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                }`}>
                  {userProfile.accountType}
                </span>
              )}

              {/* 1-Click Day / Night Theme Toggle */}
              <button
                onClick={toggleTheme}
                title={`Switch to ${theme === "dark" ? "Day (Light)" : "Night (Dark)"} Mode`}
                className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700 hover:border-zinc-300 text-zinc-100 hover:text-white transition-all cursor-pointer shadow-[0_0_12px_rgba(255,255,255,0.1)] flex items-center justify-center hover:scale-105 active:scale-95"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-zinc-200" /> : <Moon className="w-4 h-4 text-zinc-800" />}
              </button>

              <AuthModal user={userProfile} onLogout={handleLogoutClear} />

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-900 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-4 bg-zinc-950 border-t border-zinc-800 space-y-1 text-xs font-bold">
            {userRoleType === "student" ? (
              <>
                <button
                  onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-zinc-300 hover:bg-zinc-900"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { setActiveTab("quiz"); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-zinc-300 hover:bg-zinc-900"
                >
                  Mock Test
                </button>
                <button
                  onClick={() => { setActiveTab("interview"); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-zinc-300 hover:bg-zinc-900"
                >
                  Interview Prep
                </button>
                <button
                  onClick={() => { setActiveTab("builder"); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-zinc-300 hover:bg-zinc-900"
                >
                  Resume Creator
                </button>
              </>
            ) : (
              <div className="px-3 py-2 text-zinc-500">
                Logged in as {userRoleType.toUpperCase()}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        
        {/* Header Title block with Shiny Specular Gloss */}
        <header className="glass-card flex items-center gap-5 p-7 rounded-3xl border border-zinc-700/80 shadow-[0_0_35px_rgba(255,255,255,0.08)]">
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-white via-slate-100 to-zinc-300 text-zinc-950 shadow-[0_0_25px_rgba(255,255,255,0.35)] shrink-0 border border-white">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-zinc-300 drop-shadow-[0_0_20px_rgba(255,255,255,0.35)]">
                Career Engine
              </h1>
              <span className="text-[10px] px-3 py-1 rounded-full bg-zinc-900/90 text-zinc-100 border border-zinc-600 font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.12)]">
                <Rocket className="w-3.5 h-3.5 text-zinc-200 animate-pulse" /> Career Engine AI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1.5 leading-relaxed font-medium">
              Experience dynamic skill mapping, job blocker discovery, and AI-proctored mock interview preparations powered by Career Engine AI.
            </p>
          </div>
        </header>

        {/* ─── RENDERING LAYER: Company Dashboard ─── */}
        {userRoleType === "company" && <CompanyDashboard />}

        {/* ─── RENDERING LAYER: Admin Dashboard ─── */}
        {userRoleType === "admin" && <AdminDashboard />}

        {/* ─── RENDERING LAYER: Student Dashboard ─── */}
        {userRoleType === "student" && (
          <div className="space-y-8">
            
            {/* Student View tabs */}
            {activeTab === "dashboard" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Upload & Target Role Section */}
                <UploadSection
                  roles={roles}
                  selectedRole={selectedRole}
                  onRoleChange={handleRoleChange}
                  onResumeUploaded={handleResumeUploaded}
                />

                {/* LLM Resume Analysis feedback display */}
                {analysisData?.llm_analysis && (
                  <div className="glass-card p-6 border border-emerald-500/20 bg-emerald-950/5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400 border-b border-emerald-500/10 pb-3">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                      <h3 className="text-sm font-black uppercase tracking-wider">AI Resume Deep Analysis</h3>
                    </div>
                    <div className="text-xs text-slate-350 leading-relaxed font-mono whitespace-pre-wrap">
                      {analysisData.llm_analysis}
                    </div>
                  </div>
                )}

                {/* Career Readiness Twin Dashboard (Gauge & Indicators) */}
                <ReadinessGauge
                  currentScore={currentReadinessScore}
                  projectedScore={projectedReadinessScore}
                  breakdown={currentBreakdown}
                  readinessFeedback={readinessFeedback}
                />

                {/* Overcome Blockers Box & Blockers Table Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  <div className="lg:col-span-7 flex flex-col">
                    <JobBlockersTable skills={activeSkillsList} />
                  </div>
                  <div className="lg:col-span-5 flex flex-col">
                    <OvercomeBlockers blockers={blockerSkills} />
                  </div>
                </div>

                {/* Minimum Path to Job Widget */}
                <MinimumPathWidget pathData={activeMinPath} />

                {/* Counterfactual Simulator */}
                <CounterfactualSimulator
                  selectedRole={selectedRole}
                  candidateSkills={confidenceScores}
                  onSimulationUpdate={(simData) => setSimulatedData(simData)}
                />

                {/* Smart Learning Resource Suggestion Box */}
                <ResourceSuggestions
                  selectedRole={selectedRole}
                  blockerSkills={blockerSkills}
                />
              </div>
            )}

            {activeTab === "quiz" && (
              <div className="animate-in fade-in duration-300">
                <MockTestQuiz
                  selectedRoleId={selectedRole}
                  roleName={activeRoleName}
                  onQuizComplete={handleQuizCompletion}
                />
              </div>
            )}

            {activeTab === "interview" && (
              <div className="animate-in fade-in duration-300">
                <InterviewPrep
                  selectedRoleId={selectedRole}
                  roleName={activeRoleName}
                />
              </div>
            )}

            {activeTab === "builder" && (
              <div className="animate-in fade-in duration-300">
                <ResumeBuilder onSyncResume={handleSyncResumeBuilder} />
              </div>
            )}

          </div>
        )}

        {/* Sample Resumes Bar */}
        <div className="glass-card p-4 border border-zinc-800 bg-zinc-950/70 rounded-xl text-xs text-zinc-400 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <span className="font-semibold text-zinc-300">📁 Sample Resumes Available (In <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-700">sample_resumes/</code>):</span>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-700/80 hover:border-zinc-500 transition-colors">📄 Data_Scientist_Resume.txt</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-700/80 hover:border-zinc-500 transition-colors">📄 Full_Stack_Developer_Resume.txt</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-700/80 hover:border-zinc-500 transition-colors">📄 Web_Developer_Resume.txt</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-700/80 hover:border-zinc-500 transition-colors">📄 Data_Engineer_Resume.txt</span>
          </div>
        </div>

        {/* Footer with Career Engine Branding */}
        <footer className="text-center text-xs text-zinc-500 border-t border-zinc-800/80 pt-8 pb-6 space-y-2">
          <p className="font-bold text-zinc-300 text-sm flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-zinc-300 animate-pulse" />
            Created and Designed by <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-zinc-400 font-extrabold uppercase">Career Engine</span>
          </p>
          <p className="text-[11px] text-zinc-500">
            Next.js 16 WebGL Frontend • Python FastAPI Backend Engine • AI Readiness Assessment
          </p>
        </footer>

      </div>

      {/* Floating Mini AI Assistant Chatbot — Hidden during assessment/quiz */}
      {activeTab !== "quiz" && (
        <AIChatbot
          selectedRole={selectedRole}
          readinessPct={currentReadinessScore}
        />
      )}

    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-mono">LOADING CAREER ENGINE SYSTEMS...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
