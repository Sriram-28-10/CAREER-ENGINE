"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Video, Mic, MicOff, Send, Award, CheckCircle, RefreshCw,
  AlertTriangle, Play, Sparkles, ChevronRight,
  BookOpen, Star, HelpCircle
} from "lucide-react";

interface InterviewPrepProps {
  selectedRoleId: string;
  roleName: string;
}

interface Question {
  id: number;
  question: string;
  type: string;
  ideal_keywords: string[];
  difficulty: "easy" | "medium" | "hard";
}

interface ScoreResult {
  score: number;
  feedback: string;
  strengths: string;
  improvements: string;
  powered_by?: string;
}

export default function InterviewPrep({ selectedRoleId, roleName }: InterviewPrepProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState("");
  
  // Audio / Speech Recognition
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Proctor Media Streams
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // States
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [interviewHistory, setInterviewHistory] = useState<{ question: string; answer: string; result: ScoreResult }[]>([]);
  const [interviewFinished, setInterviewFinished] = useState(false);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = "en-US";
        
        rec.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          setAnswerText((prev) => prev + (prev ? " " : "") + transcript);
        };

        rec.onerror = (err: any) => {
          console.error("Speech recognition error:", err);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  // Fetch Questions from Backend
  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetch(`http://localhost:8000/api/interview/questions?role_id=${selectedRoleId}&question_type=all`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
        setCurrentIdx(0);
        setAnswerText("");
        setScoreResult(null);
        setInterviewHistory([]);
        setInterviewFinished(false);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedRoleId]);

// Helper to reliably setup & play HTML5 Video streams
const setupVideoPlayback = (video: HTMLVideoElement | null, stream: MediaStream | null) => {
  if (!video) return;
  if (!stream) {
    video.srcObject = null;
    return;
  }
  try {
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("autoplay", "true");
    video.setAttribute("muted", "true");

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    const startPlay = () => {
      video.muted = true;
      const p = video.play();
      if (p !== undefined) {
        p.catch((e) => {
          console.warn("video.play() caught in InterviewPrep:", e);
        });
      }
    };

    video.onloadedmetadata = startPlay;
    video.onloadeddata = startPlay;
    video.oncanplay = startPlay;
    startPlay();
  } catch (e) {
    console.error("Error setting up video playback in InterviewPrep:", e);
  }
};

  // Dedicated effect to bind stream to video element
  useEffect(() => {
    if (cameraStream) {
      setupVideoPlayback(videoRef.current, cameraStream);
    }
  }, [cameraStream]);

  // Request Camera & Mic for Proctoring
  const startProctoring = async () => {
    try {
      let vStream: MediaStream | null = null;
      try {
        vStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        });
      } catch {
        vStream = await navigator.mediaDevices.getUserMedia({ video: true }).catch(() => null);
      }

      const aStream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
      
      const tracks = [...(vStream ? vStream.getTracks() : []), ...(aStream ? aStream.getTracks() : [])];
      if (tracks.length > 0) {
        const combined = new MediaStream(tracks);
        setCameraStream(combined);
        setCameraError(false);
        setTimeout(() => setupVideoPlayback(videoRef.current, combined), 50);
      } else {
        setCameraError(true);
      }
    } catch (err) {
      console.warn("Proctor camera/mic access denied:", err);
      setCameraError(true);
    }
  };

  useEffect(() => {
    startProctoring();
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle Speech Toggle
  const toggleListening = async () => {
    if (!recognitionRef.current) {
      // Try to re-initialize SpeechRecognition in case of late availability
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        const rec = new SpeechRec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";
        rec.onresult = (event: any) => {
          let full = "";
          for (let i = 0; i < event.results.length; i++) {
            full += event.results[i][0].transcript + " ";
          }
          setAnswerText(full.trim());
        };
        rec.onerror = (err: any) => {
          console.warn("Speech recognition error:", err);
          setIsListening(false);
        };
        rec.onend = () => setIsListening(false);
        recognitionRef.current = rec;
      } else {
        alert("Speech recognition is not supported in this browser. You can type your response in the box below.");
        return;
      }
    }

    try {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        // Request mic access first to ensure permission before starting recognition
        await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (err) {
      console.warn("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  // Submit Answer for Grading
  const submitAnswer = async () => {
    if (!answerText.trim()) return;

    const currentQ = questions[currentIdx];
    setSubmittingAnswer(true);
    setScoreResult(null);

    try {
      const res = await fetch("http://localhost:8000/api/interview/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: currentQ.id,
          question: currentQ.question,
          answer: answerText,
          role_id: selectedRoleId,
          ideal_keywords: currentQ.ideal_keywords || [],
        }),
      });

      if (res.ok) {
        const data: ScoreResult = await res.json();
        setScoreResult(data);
        
        // Save to local interview history
        setInterviewHistory((prev) => [
          ...prev,
          { question: currentQ.question, answer: answerText, result: data }
        ]);
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      // Fallback response if offline
      const mockResult: ScoreResult = {
        score: 6,
        feedback: "Offline grading simulation applied. Answer matches partial criteria.",
        strengths: "Addressed basic concepts.",
        improvements: "Connect to live server for complete evaluation.",
        powered_by: "offline-mock"
      };
      setScoreResult(mockResult);
      setInterviewHistory((prev) => [
        ...prev,
        { question: currentQ.question, answer: answerText, result: mockResult }
      ]);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleNext = () => {
    setAnswerText("");
    setScoreResult(null);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setInterviewFinished(true);
    }
  };

  const resetInterview = () => {
    setCurrentIdx(0);
    setAnswerText("");
    setScoreResult(null);
    setInterviewHistory([]);
    setInterviewFinished(false);
  };

  const currentQuestion = questions[currentIdx];
  const avgScore = interviewHistory.length > 0
    ? (interviewHistory.reduce((sum, h) => sum + h.result.score, 0) / interviewHistory.length).toFixed(1)
    : "0";

  return (
    <div className="glass-card p-7 border border-zinc-700/60 bg-zinc-950/85 rounded-3xl shadow-[0_0_35px_rgba(255,255,255,0.06)] max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-800/80 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-100 border border-zinc-700/80 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <Video className="w-5 h-5 animate-pulse text-zinc-200" />
          </div>
          <div>
            <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-zinc-300">
              AI Mock Interview Prep
            </h3>
            <p className="text-[11px] text-zinc-400 font-medium">
              Simulated face-to-face proctored environment for <span className="text-zinc-100 font-bold">{roleName}</span>.
            </p>
          </div>
        </div>

        {/* Live camera stream view (Proctoring display) */}
        <div className="flex items-center gap-3.5 bg-zinc-900/90 p-2.5 rounded-2xl border border-zinc-750 border-zinc-700/60 shadow-[0_0_15px_rgba(255,255,255,0.04)]">
          <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-zinc-600 bg-black shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover transform -scale-x-100"
            />
            <div className="absolute top-1 left-1.5 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${cameraStream ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" : "bg-red-500"}`} />
              <span className="text-[8px] text-white font-mono bg-black/70 px-1 rounded uppercase font-bold">Live</span>
            </div>
          </div>
          <div className="text-left font-mono pr-1">
            <p className="text-[9px] text-zinc-400 font-bold">PROCTOR STATUS</p>
            <p className={`text-xs font-black ${cameraStream ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "text-amber-400"}`}>
              {cameraStream ? "SECURED & ACTIVE" : "MICROPHONE ONLY"}
            </p>
          </div>
        </div>
      </div>

      {loadingQuestions ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3.5">
          <RefreshCw className="w-10 h-10 text-zinc-200 animate-spin" />
          <p className="text-xs text-zinc-300 font-bold">Generating AI interview questions for {roleName}...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
          <p className="text-sm font-bold text-zinc-200">No Interview Questions Loaded</p>
          <button
            onClick={fetchQuestions}
            className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-xs font-bold rounded-xl border border-zinc-700 transition-colors cursor-pointer shadow-sm"
          >
            Retry Loading Questions
          </button>
        </div>
      ) : !interviewFinished ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Interview Q&A Column */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* Question Card */}
            <div className="p-6 bg-gradient-to-r from-zinc-900/80 via-zinc-950/90 to-zinc-900/80 border border-zinc-750 border-zinc-700/60 rounded-2xl relative space-y-3.5 shadow-[0_0_20px_rgba(255,255,255,0.03)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black font-mono bg-zinc-850 bg-zinc-900 border border-zinc-700 text-zinc-200 px-3 py-1 rounded-full uppercase shadow-sm">
                  {currentQuestion.type} Question
                </span>
                <span className="text-xs font-mono font-bold text-zinc-400">
                  Question {currentIdx + 1} of {questions.length}
                </span>
              </div>
              <p className="text-sm font-bold text-zinc-100 leading-relaxed">
                {currentQuestion.question}
              </p>
              <div className="flex gap-2">
                <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                  currentQuestion.difficulty === "easy" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" :
                  currentQuestion.difficulty === "medium" ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" :
                  "bg-red-500/15 text-red-300 border border-red-500/30"
                }`}>
                  {currentQuestion.difficulty}
                </span>
              </div>
            </div>

            {/* Answer Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-300">Your Response:</label>
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`px-3.5 py-1.5 rounded-xl border text-[10px] font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                    isListening
                      ? "bg-red-500/20 border-red-500 text-red-300 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                      : "bg-zinc-900 border-zinc-700 hover:border-zinc-400 text-zinc-200 hover:text-white"
                  }`}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-zinc-300" />}
                  {isListening ? "Stop Speaking" : "Answer via Mic"}
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Record your response using the microphone or type your technical explanation here..."
                  rows={6}
                  disabled={submittingAnswer || scoreResult !== null}
                  className="w-full p-4 bg-zinc-950/90 border border-zinc-750 border-zinc-700/80 rounded-2xl text-xs text-zinc-100 focus:outline-none focus:border-zinc-300 transition-all resize-none leading-relaxed shadow-inner placeholder:text-zinc-600"
                />
                {isListening && (
                  <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5 text-xs text-red-400 font-bold">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    Listening to microphone...
                  </div>
                )}
              </div>
            </div>

            {/* Control Actions */}
            <div className="flex gap-3">
              {scoreResult === null ? (
                <button
                  onClick={submitAnswer}
                  disabled={!answerText.trim() || submittingAnswer}
                  className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    answerText.trim() && !submittingAnswer
                      ? "silver-button-primary text-zinc-950"
                      : "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
                  }`}
                >
                  {submittingAnswer ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                      Evaluating with LLM...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Answer for Assessment
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 hover:from-emerald-300 hover:to-emerald-400 text-zinc-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                >
                  <span>{currentIdx < questions.length - 1 ? "Proceed to Next Question" : "Complete Interview"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

          {/* Right Assessment Result Feedback Column */}
          <div className="space-y-4">
            {scoreResult ? (
              <div className="p-6 bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-700/80 rounded-2xl space-y-4 animate-in fade-in duration-300 shadow-[0_0_25px_rgba(255,255,255,0.05)]">
                <div className="text-center space-y-1 pb-3.5 border-b border-zinc-800">
                  <span className="text-[9px] font-mono text-zinc-400 tracking-widest uppercase font-bold block">LLM EVALUATION SCORE</span>
                  <div className="inline-flex items-baseline gap-1">
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-zinc-300 drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">{scoreResult.score}</span>
                    <span className="text-xs text-zinc-400 font-bold">/ 10</span>
                  </div>
                </div>

                <div className="space-y-3.5 text-[11px] leading-relaxed">
                  <div className="space-y-1">
                    <span className="font-bold text-zinc-200 block">💬 Assessment:</span>
                    <p className="text-zinc-400">{scoreResult.feedback}</p>
                  </div>
                  {scoreResult.strengths && (
                    <div className="space-y-1">
                      <span className="font-bold text-emerald-400 block">✨ Strengths:</span>
                      <p className="text-zinc-400">{scoreResult.strengths}</p>
                    </div>
                  )}
                  {scoreResult.improvements && (
                    <div className="space-y-1">
                      <span className="font-bold text-amber-400 block">🛠️ Room for Improvement:</span>
                      <p className="text-zinc-400">{scoreResult.improvements}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-5 bg-zinc-950/40 border border-zinc-800 rounded-2xl border-dashed py-12 text-center text-zinc-500 space-y-2">
                <Award className="w-8 h-8 mx-auto opacity-30 stroke-[1.2]" />
                <p className="text-xs font-bold text-zinc-400">Feedback Pending</p>
                <p className="text-[10px] leading-relaxed max-w-[180px] mx-auto text-zinc-500">
                  Submit your detailed text or voice response to get instant AI scoring.
                </p>
              </div>
            )}

            {/* Quick Metrics display */}
            <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-2 text-[10px] font-mono text-zinc-400">
              <div className="flex justify-between">
                <span>Completed Questions:</span>
                <span className="font-bold text-white">{interviewHistory.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Average Score:</span>
                <span className="font-bold text-zinc-200">{avgScore} / 10</span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* Summary scorecard screen */
        <div className="max-w-2xl mx-auto text-center space-y-6 py-6 animate-in fade-in duration-300">
          <div className="inline-flex p-4 rounded-3xl bg-zinc-800/80 border border-zinc-700 text-zinc-200 mb-2">
            <Sparkles className="w-12 h-12 text-zinc-200 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-zinc-100">AI Interview Assessment Completed!</h3>
            <p className="text-xs text-zinc-400">
              Review your overall scores and comprehensive performance metrics.
            </p>
          </div>

          {/* Average metrics card */}
          <div className="p-5 bg-zinc-950/90 border border-zinc-800 rounded-2xl max-w-sm mx-auto space-y-2.5 shadow-inner">
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">AVERAGE RATING</p>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-zinc-400">{avgScore} <span className="text-xs text-zinc-500">/ 10</span></div>
            <div className="text-xs font-semibold text-zinc-300">
              Mock preparation complete for <span className="text-white font-bold">{roleName}</span>
            </div>
          </div>

          {/* History Details */}
          <div className="space-y-3.5 text-left max-w-xl mx-auto pt-4">
            <p className="text-xs font-bold text-zinc-300">Detailed Q&A Evaluation Summary:</p>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {interviewHistory.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-start gap-3">
                    <span className="font-bold text-zinc-200">Q{idx+1}: {item.question}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                      Score: {item.result.score}/10
                    </span>
                  </div>
                  <p className="text-zinc-400 italic text-[11px]">Your Answer: "{item.answer}"</p>
                  <p className="text-zinc-300 text-[11px] leading-relaxed"><strong className="text-zinc-200">Feedback:</strong> {item.result.feedback}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={resetInterview}
              className="py-3 px-8 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retake Prep Session
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
