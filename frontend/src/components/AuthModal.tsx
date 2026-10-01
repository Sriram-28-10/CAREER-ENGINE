"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  provider: "Google" | "LinkedIn" | "GitHub";
  avatar: string;
  roleTitle: string;
}

interface AuthModalProps {
  user: UserProfile | null;
  onLogout: () => void;
}

export default function AuthModal({ user, onLogout }: AuthModalProps) {
  const router = useRouter();
  const { data: session } = useSession();

  // NextAuth real OAuth profile takes precedence
  const activeUser = session?.user ? {
    name: session.user.name || "Authenticated Candidate",
    email: session.user.email || "",
    provider: ((session.user as any).provider || "OAuth") as any,
    avatar: session.user.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=User",
    roleTitle: "Verified OAuth Profile",
  } : user;

  const handleSignOut = async () => {
    if (session) {
      await signOut({ callbackUrl: "/login?auth=signout" });
    } else {
      onLogout();
      router.push("/login?auth=signout");
    }
  };

  const handleSignInRedirect = () => {
    router.push("/login");
  };

  return (
    <div>
      {activeUser ? (
        <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-700/80 px-3.5 py-1.5 rounded-xl shadow-lg shadow-white/5 animate-in fade-in duration-200">
          <img
            src={activeUser.avatar}
            alt={activeUser.name}
            className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-500"
          />
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-zinc-100 flex items-center gap-1">
              {activeUser.name}
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </p>
            <p className="text-[10px] text-zinc-400 font-medium">
              Via {activeUser.provider}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            title="Log Out / Sign Out"
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors ml-1 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleSignInRedirect}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-zinc-100 via-slate-200 to-zinc-300 hover:from-white hover:to-zinc-200 text-zinc-950 shadow-lg shadow-white/10 flex items-center gap-2 transition-all cursor-pointer border border-white/40"
        >
          <LogIn className="w-4 h-4 text-zinc-950" />
          Connect Profile / Log In
        </button>
      )}
    </div>
  );
}
