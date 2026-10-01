"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Sparkles, Loader2, ChevronDown } from "lucide-react";

interface Message {
  sender: "user" | "bot";
  text: string;
}

interface AIChatbotProps {
  selectedRole: string;
  readinessPct?: number;
}

const PRESET_PROMPTS = [
  "How to increase my readiness score?",
  "What are my top job blockers?",
  "Recommend top Coursera courses",
  "Who created this application?"
];

export default function AIChatbot({ selectedRole, readinessPct }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "👋 Hi! I'm your Career Engine AI Assistant. Ask me anything about improving your career readiness score, clearing job blockers, or learning paths!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:8000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_message: text,
          role_id: selectedRole,
          readiness_pct: readinessPct || 63.5,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
      } else {
        throw new Error("Chatbot API error");
      }
    } catch (err) {
      console.warn("Fallback chatbot reply:", err);
      // Smart Fallback
      let reply = `To reach 85%+ readiness for ${selectedRole.replace("_", " ")}, focus on closing your highest ROI blocker skill first! Check the Minimum Path widget above.`;
      if (text.toLowerCase().includes("career engine") || text.toLowerCase().includes("team") || text.toLowerCase().includes("who")) {
        reply = "🚀 Created & Designed with pride by **Career Engine**!";
      }
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating Toggle Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative p-4 rounded-2xl bg-gradient-to-r from-white via-slate-100 to-zinc-300 text-zinc-950 shadow-[0_0_30px_rgba(255,255,255,0.35)] hover:shadow-[0_0_45px_rgba(255,255,255,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer flex items-center gap-3 border border-white/90 group"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-bounce text-zinc-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-zinc-950 animate-pulse shadow-[0_0_8px_#10b981]" />
          </div>
          <span className="font-black text-xs pr-1 hidden sm:inline text-zinc-950 tracking-wide">
            Ask Career Engine AI
          </span>
        </button>
      )}

      {/* Floating Chat Box Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-zinc-950/95 backdrop-blur-2xl border border-zinc-700/80 rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.12)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Top Bar with Specular Glow */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between relative">
            <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-zinc-900 text-zinc-100 border border-zinc-700 shadow-[0_0_12px_rgba(255,255,255,0.1)]">
                <Bot className="w-5 h-5 text-zinc-200" />
              </div>
              <div>
                <h3 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-zinc-300 text-sm flex items-center gap-1.5">
                  Career Engine AI Assistant
                  <Sparkles className="w-3.5 h-3.5 text-zinc-200 animate-pulse" />
                </h3>
                <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  ● Online • Neural Matrix Active
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${
                  m.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    m.sender === "user"
                      ? "bg-gradient-to-tr from-white to-zinc-300 text-zinc-950 font-black shadow-sm"
                      : "bg-zinc-900 text-zinc-200 border border-zinc-700 shadow-sm"
                  }`}
                >
                  {m.sender === "user" ? <User className="w-4 h-4 text-zinc-950" /> : <Bot className="w-4 h-4 text-zinc-200" />}
                </div>

                <div
                  className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                    m.sender === "user"
                      ? "bg-gradient-to-r from-white via-slate-100 to-zinc-200 text-zinc-950 font-bold rounded-tr-none shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                      : "bg-zinc-900/90 text-zinc-200 border border-zinc-750 border-zinc-700/60 rounded-tl-none font-medium shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-zinc-400 text-xs italic font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-zinc-200" />
                <span>Career Engine AI is calculating...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Preset Suggestion Chips */}
          <div className="px-3 py-2 bg-zinc-950 border-t border-zinc-850 border-zinc-800/80 flex gap-1.5 overflow-x-auto no-scrollbar">
            {PRESET_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-400 text-zinc-300 hover:text-white border border-zinc-700/80 transition-all cursor-pointer shrink-0 shadow-sm"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Career Engine AI career questions..."
              className="flex-1 bg-zinc-900/90 border border-zinc-750 border-zinc-700/80 focus:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none transition-all placeholder:text-zinc-500 shadow-inner"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="silver-button-primary p-2.5 rounded-xl disabled:opacity-40 text-zinc-950 font-bold transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
