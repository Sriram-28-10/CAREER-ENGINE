"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import ThreeBackground from "@/components/ThreeBackground";
import TransitionOverlay from "@/components/TransitionOverlay";
import {
  Mail, Github, Linkedin, ShieldCheck, Sparkles, Brain,
  AlertCircle, GraduationCap, Briefcase, User, CheckCircle2,
  ArrowRight, ArrowLeft,
} from "lucide-react";

type AccountType = "student" | "company" | "admin";

const ACCOUNT_TYPES: { type: AccountType; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  {
    type: "student",
    label: "Student",
    desc: "College students & fresh graduates seeking internships and entry-level roles.",
    icon: <GraduationCap className="w-7 h-7" />,
    color: "silver",
  },
  {
    type: "company",
    label: "Company",
    desc: "Recruiters & hiring managers evaluating candidate readiness scores.",
    icon: <Briefcase className="w-7 h-7" />,
    color: "emerald",
  },
  {
    type: "admin",
    label: "Admin",
    desc: "System administrators managing configuration, Ollama health, and Q&A.",
    icon: <ShieldCheck className="w-7 h-7" />,
    color: "amber",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<string | null>(null);
  const [showRealOAuth, setShowRealOAuth] = useState(false);
  const [transitioning, setTransitioning] = useState<string | null>(null);

  // If user is already authenticated via real NextAuth, redirect immediately
  React.useEffect(() => {
    if (status === "authenticated") {
      setTransitioning("SYNCHRONIZING SECURE SESSION...");
    }
  }, [status]);

  const handleSimulatedLogin = (provider: "Google" | "LinkedIn" | "GitHub") => {
    setIsAuthenticating(provider);
    setTimeout(() => {
      const mockUser = {
        name:
          provider === "Google" ? "Alex Morgan (Google)" :
          provider === "LinkedIn" ? "Jordan Lee (LinkedIn)" :
          "Taylor Reed (GitHub)",
        email:
          provider === "Google" ? "alex.morgan@gmail.com" :
          provider === "LinkedIn" ? "jordan.lee@linkedin.com" :
          "taylor.reed@github.com",
        provider,
        accountType: selectedAccountType,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
        roleTitle:
          provider === "Google" ? "Candidate Member" :
          provider === "LinkedIn" ? "Verified LinkedIn Professional" :
          "GitHub Verified Developer",
      };
      localStorage.setItem("scorpius_candidate_user", JSON.stringify(mockUser));
      setIsAuthenticating(null);
      setTransitioning(`SYNCING ${provider.toUpperCase()} PROFILE...`);
    }, 800);
  };

  const handleRealOAuthLogin = async (providerId: string) => {
    setIsAuthenticating(providerId);
    try {
      // Store selected account type before redirect
      if (selectedAccountType) {
        localStorage.setItem("scorpius_pending_account_type", selectedAccountType);
      }
      await signIn(providerId, { callbackUrl: "/?auth=signin" });
    } catch (err) {
      console.error("Real OAuth error:", err);
    } finally {
      setIsAuthenticating(null);
    }
  };

  if (transitioning) {
    return (
      <TransitionOverlay
        message={transitioning}
        onComplete={() => router.push("/?auth=signin")}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#03060c] text-zinc-100 flex items-center justify-center p-4 overflow-hidden select-none">
      {/* 3D constellation animation background */}
      <ThreeBackground />

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-lg p-8 bg-zinc-950/85 border border-zinc-800/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-black/80 space-y-6">

        {/* Brand/Team Logo Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-zinc-100 via-slate-200 to-zinc-400 text-zinc-950 shadow-xl shadow-white/10">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white flex items-center justify-center gap-1.5">
              Career Engine
            </h2>
            <p className="text-xs text-zinc-400 font-bold tracking-wider uppercase flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300 animate-pulse" />
              Engineered by Career Engine AI
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className={`w-8 h-1 rounded-full transition-all ${step >= 1 ? "bg-zinc-200 shadow-sm shadow-white/50" : "bg-zinc-800"}`} />
          <div className={`w-8 h-1 rounded-full transition-all ${step >= 2 ? "bg-zinc-200 shadow-sm shadow-white/50" : "bg-zinc-800"}`} />
        </div>

        {/* ─── STEP 1: Account Type Selection ─── */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <p className="text-center text-xs text-zinc-400 font-semibold uppercase tracking-widest">
              Select Account Type
            </p>

            <div className="grid grid-cols-3 gap-3">
              {ACCOUNT_TYPES.map((acct) => {
                const isSelected = selectedAccountType === acct.type;
                return (
                  <button
                    key={acct.type}
                    onClick={() => setSelectedAccountType(acct.type)}
                    className={`relative p-4 rounded-xl border-2 text-center space-y-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? "border-zinc-300 bg-zinc-900/90 shadow-lg shadow-white/5"
                        : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-600 hover:bg-zinc-900/50"
                    }`}
                  >
                    {isSelected && (
                      <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-zinc-200" />
                    )}
                    <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected ? "bg-zinc-800 text-zinc-100" : "bg-zinc-900 text-zinc-400"
                    }`}>
                      {acct.icon}
                    </div>
                    <p className={`text-xs font-bold ${isSelected ? "text-zinc-100" : "text-zinc-300"}`}>
                      {acct.label}
                    </p>
                    <p className="text-[9px] text-zinc-500 leading-snug">{acct.desc}</p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => { if (selectedAccountType) setStep(2); }}
              disabled={!selectedAccountType}
              className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedAccountType
                  ? "bg-gradient-to-r from-zinc-100 via-slate-200 to-zinc-300 hover:from-white hover:to-zinc-200 text-zinc-950 shadow-lg shadow-white/10"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ─── STEP 2: OAuth Sign-In ─── */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Back button */}
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to account type
            </button>

            {/* Selected account badge */}
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700 text-zinc-200 text-xs font-bold shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300" />
                {ACCOUNT_TYPES.find(a => a.type === selectedAccountType)?.label} Account
              </span>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
              <button
                onClick={() => setShowRealOAuth(false)}
                className={`py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  !showRealOAuth
                    ? "bg-zinc-800 text-zinc-100 shadow"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Simulated Login
              </button>
              <button
                onClick={() => setShowRealOAuth(true)}
                className={`py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  showRealOAuth
                    ? "bg-zinc-800 text-zinc-100 shadow"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Real OAuth Login
              </button>
            </div>

            {/* Mode Info Messages */}
            {showRealOAuth ? (
              <div className="p-3.5 bg-zinc-900/90 border border-zinc-700/80 text-zinc-300 rounded-xl text-xs flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-zinc-300" />
                <p>
                  Connects directly to Gmail (Google), GitHub, or LinkedIn API portals using environment secrets configured in <strong>.env.local</strong>.
                </p>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Simulates OAuth connection flows instantly without entering passwords or registering credentials.
                </p>
              </div>
            )}

            {/* Sign In Options */}
            <div className="space-y-3">
              {/* Google */}
              <button
                onClick={() => showRealOAuth ? handleRealOAuthLogin("google") : handleSimulatedLogin("Google")}
                disabled={!!isAuthenticating}
                className="w-full p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/90 hover:bg-zinc-900 hover:border-zinc-500 text-zinc-200 font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer text-xs shadow-sm"
              >
                <Mail className="w-4 h-4 text-red-400" />
                <span>
                  {isAuthenticating === "google" || isAuthenticating === "Google"
                    ? "Connecting Google Portals..."
                    : "Continue with Gmail (Google)"}
                </span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => showRealOAuth ? handleRealOAuthLogin("linkedin") : handleSimulatedLogin("LinkedIn")}
                disabled={!!isAuthenticating}
                className="w-full p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/90 hover:bg-zinc-900 hover:border-zinc-500 text-zinc-200 font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer text-xs shadow-sm"
              >
                <Linkedin className="w-4 h-4 text-blue-400" />
                <span>
                  {isAuthenticating === "linkedin" || isAuthenticating === "LinkedIn"
                    ? "Connecting LinkedIn Portals..."
                    : "Continue with LinkedIn Profile"}
                </span>
              </button>

              {/* GitHub */}
              <button
                onClick={() => showRealOAuth ? handleRealOAuthLogin("github") : handleSimulatedLogin("GitHub")}
                disabled={!!isAuthenticating}
                className="w-full p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/90 hover:bg-zinc-900 hover:border-zinc-500 text-zinc-200 font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer text-xs shadow-sm"
              >
                <Github className="w-4 h-4 text-zinc-300" />
                <span>
                  {isAuthenticating === "github" || isAuthenticating === "GitHub"
                    ? "Connecting GitHub Developer Profile..."
                    : "Continue with GitHub Profile"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Brand info */}
        <div className="text-center text-[10px] text-zinc-500 flex items-center justify-center gap-1 border-t border-zinc-800/80 pt-4">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Career Engine Dashboard • Powered by <strong>Career Engine</strong></span>
        </div>

      </div>
    </div>
  );
}
