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

  // Request Camera & Mic for Proctoring
  const startProctoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCameraStream(stream);
      setCameraError(false);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
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
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your response.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
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
    <div className="glass-card p-6 border border-slate-800 bg-slate-900/60 rounded-2xl shadow-xl max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Video className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Mock Interview Prep</h3>
            <p className="text-[11px] text-slate-400">
              Simulated face-to-face proctored environment for <span className="text-indigo-300 font-semibold">{roleName}</span>.
            </p>
          </div>
        </div>

        {/* Live camera stream view (Proctoring display) */}
        <div className="flex items-center gap-3">
          <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-slate-700 bg-black shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover transform -scale-x-100"
            />
            <div className="absolute top-1 left-1.5 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${cameraStream ? "bg-emerald-400 animate-pulse" : "bg-red-500"}`} />
              <span className="text-[8px] text-white font-mono bg-black/60 px-1 rounded uppercase">Live</span>
            </div>
          </div>
          <div className="text-left font-mono">
            <p className="text-[10px] text-slate-500">PROCTOR STATUS</p>
            <p className={`text-xs font-bold ${cameraStream ? "text-emerald-400" : "text-amber-400"}`}>
              {cameraStream ? "SECURED & ACTIVE" : "MICROPHONE ONLY"}
            </p>
          </div>
        </div>
      </div>

      {loadingQuestions ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400">Generating interview questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No Interview Questions Loaded</p>
          <button
            onClick={fetchQuestions}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
          >
            Retry Loading Questions
          </button>
        </div>
      ) : !interviewFinished ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Interview Q&A Column */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* Question Card */}
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl relative space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full uppercase">
                  {currentQuestion.type} Question
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Question {currentIdx + 1} of {questions.length}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-100 leading-relaxed">
                {currentQuestion.question}
              </p>
              <div className="flex gap-2">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  currentQuestion.difficulty === "easy" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                  currentQuestion.difficulty === "medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                  "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  {currentQuestion.difficulty}
                </span>
              </div>
            </div>

            {/* Answer Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400">Your Response:</label>
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isListening
                      ? "bg-red-500/20 border-red-500 text-red-300 animate-pulse"
                      : "bg-slate-950 border-slate-700 hover:border-slate-600 text-slate-300"
                  }`}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
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
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all resize-none leading-relaxed"
                />
                {isListening && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-red-400 font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
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
                  className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    answerText.trim() && !submittingAnswer
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-slate-850 text-slate-600 border border-slate-800/85 cursor-not-allowed"
                  }`}
                >
                  {submittingAnswer ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
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
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
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
              <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4 animate-in fade-in duration-300">
                <div className="text-center space-y-1 pb-3 border-b border-slate-800">
                  <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase block">LLM EVALUATION SCORE</span>
                  <div className="inline-flex items-baseline gap-1">
                    <span className="text-4xl font-black text-indigo-400">{scoreResult.score}</span>
                    <span className="text-xs text-slate-500">/ 10</span>
                  </div>
                </div>

                <div className="space-y-3.5 text-[11px] leading-relaxed">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-300 block">💬 Assessment:</span>
                    <p className="text-slate-400">{scoreResult.feedback}</p>
                  </div>
                  {scoreResult.strengths && (
                    <div className="space-y-1">
                      <span className="font-bold text-emerald-400 block">✨ Strengths:</span>
                      <p className="text-slate-400">{scoreResult.strengths}</p>
                    </div>
                  )}
                  {scoreResult.improvements && (
                    <div className="space-y-1">
                      <span className="font-bold text-amber-400 block">🛠️ Room for Improvement:</span>
                      <p className="text-slate-400">{scoreResult.improvements}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-5 bg-slate-950/20 border border-slate-800 rounded-2xl border-dashed py-12 text-center text-slate-500 space-y-2">
                <Award className="w-8 h-8 mx-auto opacity-30 stroke-[1.2]" />
                <p className="text-xs font-bold">Feedback Pending</p>
                <p className="text-[10px] leading-relaxed max-w-[180px] mx-auto">
                  Submit your detailed text or voice response to get instant AI scoring.
                </p>
              </div>
            )}

            {/* Quick Metrics display */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-[10px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Completed Questions:</span>
                <span className="font-bold text-white">{interviewHistory.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Average Score:</span>
                <span className="font-bold text-indigo-400">{avgScore} / 10</span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* Summary scorecard screen */
        <div className="max-w-2xl mx-auto text-center space-y-6 py-6 animate-in fade-in duration-300">
          <div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-2">
            <Sparkles className="w-12 h-12 text-indigo-400 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-100">AI Interview Assessment Completed!</h3>
            <p className="text-xs text-slate-400">
              Review your overall scores and comprehensive performance metrics.
            </p>
          </div>

          {/* Average metrics card */}
          <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl max-w-sm mx-auto space-y-2.5 shadow-inner">
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">AVERAGE RATING</p>
            <div className="text-4xl font-black text-indigo-400">{avgScore} <span className="text-xs text-slate-500">/ 10</span></div>
            <div className="text-xs font-semibold text-slate-350">
              Mock preparation complete for <span className="text-white font-bold">{roleName}</span>
            </div>
          </div>

          {/* History Details */}
          <div className="space-y-3.5 text-left max-w-xl mx-auto pt-4">
            <p className="text-xs font-bold text-slate-300">Detailed Q&A Evaluation Summary:</p>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {interviewHistory.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-start gap-3">
                    <span className="font-bold text-slate-200">Q{idx+1}: {item.question}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/10">
                      Score: {item.result.score}/10
                    </span>
                  </div>
                  <p className="text-slate-400 italic text-[11px]">Your Answer: "{item.answer}"</p>
                  <p className="text-slate-300 text-[11px] leading-relaxed"><strong className="text-indigo-400">Feedback:</strong> {item.result.feedback}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={resetInterview}
              className="py-3 px-8 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-855 text-slate-300 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
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
