"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  BookOpen, CheckCircle2, AlertTriangle, ArrowRight, Award,
  RotateCcw, Camera, Mic, XCircle, Shield, Clock, Eye,
  MicOff, CameraOff, Bot, User, WifiOff, Zap, Activity,
} from "lucide-react";

interface MockTestQuizProps {
  selectedRoleId: string;
  roleName: string;
  onQuizComplete: (scorePct: number) => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface ProctorMessage {
  id: number;
  from: "proctor" | "system";
  text: string;
  type: "info" | "warn" | "error" | "success";
  ts: string;
}

// ─────────────────────────────────────────────────────────────────
// Quiz Database
// ─────────────────────────────────────────────────────────────────
const QUIZ_DATABASE: Record<string, Question[]> = {
  data_analyst_intern: [
    { id: 1, question: "Which SQL clause filters group results after aggregation?", options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], correct: 1, explanation: "HAVING filters aggregated groups, whereas WHERE filters individual rows before grouping." },
    { id: 2, question: "What is the primary purpose of a JOIN in SQL?", options: ["Delete rows", "Structure tables", "Combine rows from tables based on a related column", "Sort queries"], correct: 2, explanation: "JOINs link data across relational tables using foreign key relationships." },
    { id: 3, question: "Which chart is best for showing trends over time?", options: ["Pie Chart", "Line Chart", "Scatter Plot", "Bar Chart"], correct: 1, explanation: "Line charts connect data points sequentially, ideal for continuous time-series trends." },
    { id: 4, question: "Which formula looks up a value in the leftmost column of a table range?", options: ["INDEX", "MATCH", "HLOOKUP", "VLOOKUP"], correct: 3, explanation: "VLOOKUP searches down the vertical column of a table array to extract data." },
    { id: 5, question: "What is EDA primarily used for?", options: ["Deploy ML models", "Clean server logs", "Analyze datasets to summarize characteristics using visual methods", "Write DB index constraints"], correct: 2, explanation: "EDA helps analysts discover patterns, spot anomalies, and check assumptions." },
  ],
  data_scientist: [
    { id: 1, question: "Primary difference between Supervised and Unsupervised learning?", options: ["Supervised needs no algorithms", "Supervised uses labeled data; Unsupervised uses unlabeled data", "Unsupervised is only for image classification", "Supervised runs on GPUs only"], correct: 1, explanation: "Supervised learns input→label mappings; Unsupervised clusters unlabeled patterns." },
    { id: 2, question: "Which technique prevents overfitting in ML models?", options: ["Increase model capacity", "Remove validation sets", "L1 / L2 Regularization", "Decrease training data"], correct: 2, explanation: "Regularization adds loss penalties to constrain weight growth and avoid overfitting." },
    { id: 3, question: "Which metric is most critical when False Negatives are dangerous (e.g., cancer diagnosis)?", options: ["Accuracy", "Precision", "Recall (Sensitivity)", "Specificity"], correct: 2, explanation: "Recall = TP / (TP + FN); maximising it minimises dangerous missed positives." },
    { id: 4, question: "What does the p-value indicate in hypothesis testing?", options: ["Model accuracy probability", "Probability of results as extreme as observed, given null hypothesis is true", "Number of network parameters", "Feature prediction weight"], correct: 1, explanation: "p < 0.05 rejects the null hypothesis, indicating the observed result is unlikely under randomness." },
    { id: 5, question: "Primary role of an activation function like ReLU in neural networks?", options: ["Compute batch normalisation", "Convert data to integers", "Introduce non-linearity into the network", "Speed up gradient updates"], correct: 2, explanation: "Non-linear activations allow networks to learn complex, non-linear decision boundaries." },
  ],
  web_developer: [
    { id: 1, question: "Which CSS layout engine handles one-dimensional layouts?", options: ["CSS Grid", "Flexbox", "Floats", "Block Display"], correct: 1, explanation: "Flexbox aligns items in a single axis (row or column), while Grid manages two dimensions." },
    { id: 2, question: "Difference between '==' and '===' in JavaScript?", options: ["No difference", "'==' checks value only; '===' checks value and type", "'===' is for objects only", "'==' checks syntax limits"], correct: 1, explanation: "=== performs strict identity comparison without type coercion." },
    { id: 3, question: "Which HTML5 tag embeds inline canvas drawings?", options: ["<svg>", "<canvas>", "<paint>", "<img>"], correct: 1, explanation: "<canvas> provides a pixel bitmap surface scripts can draw to dynamically." },
    { id: 4, question: "What does 'git push' do?", options: ["Pull from remotes", "Commit locally", "Upload local commits to a remote repository", "Initialise git directory"], correct: 2, explanation: "'git push' uploads local branch commits to an upstream remote repository like GitHub." },
    { id: 5, question: "What does DOM stand for?", options: ["Document Object Model", "Data Output Manager", "Developer Operations Manual", "Distribution Object Mapper"], correct: 0, explanation: "The DOM represents web page elements as a hierarchical tree JavaScript can manipulate." },
  ],
  full_stack_developer: [
    { id: 1, question: "Which style uses GET, POST, PUT, DELETE to manage state?", options: ["GraphQL", "gRPC", "REST API", "WebSockets"], correct: 2, explanation: "RESTful APIs map CRUD operations to standard, cacheable HTTP verbs." },
    { id: 2, question: "Primary benefit of containerising with Docker?", options: ["Eliminates DB storage", "Ensures consistent environments across dev, test, and prod", "Translates JS to binaries", "Auto-writes CSS"], correct: 1, explanation: "Docker containers bundle code and runtime dependencies, preventing environment drift." },
    { id: 3, question: "What is a SQL index primarily used for?", options: ["Encrypt data", "Enforce unique constraints", "Speed up query retrieval at the cost of slower writes", "Backup relational logs"], correct: 2, explanation: "Indexes build fast-lookup trees, speeding SELECT queries with slight write overhead." },
    { id: 4, question: "In React, what does the dependency array in useEffect control?", options: ["Template rendering speed", "When the effect re-runs based on variable updates", "CSS stylesheet imports", "DB query limits"], correct: 1, explanation: "React re-runs the effect only when values in the dependency array change." },
    { id: 5, question: "What does CORS stand for and why is it important?", options: ["Cross-Origin Resource Sharing; prevents XSS", "Cross-Origin Resource Sharing; allows browsers to load resources from other origins", "Command Operation Resource Selector; manages ports", "Central Object Routing Server; connects SQL"], correct: 1, explanation: "CORS is a browser security mechanism controlling cross-origin HTTP requests via response headers." },
  ],
};

const DEFAULT_FALLBACK_QUIZ: Question[] = [
  { id: 1, question: "Primary role of Git in engineering projects?", options: ["Run unit tests", "Manage version control and code collaboration", "Compile TypeScript", "Deploy containers"], correct: 1, explanation: "Git tracks history, enables collaboration, and resolves merge conflicts." },
  { id: 2, question: "Which HTTP status code represents successful resource creation?", options: ["200 OK", "201 Created", "400 Bad Request", "500 Server Error"], correct: 1, explanation: "HTTP 201 confirms successful resource initialisation on the server." },
  { id: 3, question: "What is Docker Compose used for?", options: ["Design React forms", "Configure and run multi-container Docker applications", "Optimise deep learning models", "Index SQL tables"], correct: 1, explanation: "Docker Compose uses YAML to run multi-container applications with a single command." },
  { id: 4, question: "What is CI/CD?", options: ["Compile Instances / Design Controls", "Continuous Integration / Continuous Deployment", "Code Inspection / Database Control", "Core Implementation / Cache Diagnostics"], correct: 1, explanation: "CI/CD automates building, testing, and deploying updates into production continuously." },
  { id: 5, question: "Primary function of an API?", options: ["Write code comments", "Allow different software applications to communicate", "Compile styles", "Compile query plans"], correct: 1, explanation: "APIs define clean communication channels between separate software systems." },
];

// ─────────────────────────────────────────────────────────────────
// AI Proctor message generator
// ─────────────────────────────────────────────────────────────────
let msgCounter = 0;
function proctorMsg(text: string, type: ProctorMessage["type"] = "info"): ProctorMessage {
  const now = new Date();
  return {
    id: ++msgCounter,
    from: "proctor",
    text,
    type,
    ts: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

const OPENING_MESSAGES: ProctorMessage[] = [
  proctorMsg("🛡️ AI Proctor v2.4 initialised. Identity verification complete.", "success"),
  proctorMsg("📷 Live camera stream confirmed. Face detected in frame.", "success"),
  proctorMsg("🎙️ Microphone audio stream active. Ambient levels nominal.", "success"),
  proctorMsg("⚠️ Tab switching is monitored. 3 violations trigger auto-submission.", "warn"),
  proctorMsg("✅ All systems go. Good luck — the test begins now.", "info"),
];

// ─────────────────────────────────────────────────────────────────
export default function MockTestQuiz({ selectedRoleId, roleName, onQuizComplete }: MockTestQuizProps) {
  const questions = QUIZ_DATABASE[selectedRoleId] || DEFAULT_FALLBACK_QUIZ;

  // ─── Permission & Stream State ───
  const [permissionPhase, setPermissionPhase] = useState<"idle" | "requesting" | "granted" | "denied">("idle");
  const [cameraGranted, setCameraGranted] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [micError, setMicError] = useState("");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [testStarted, setTestStarted] = useState(false);

  // ─── Quiz State ───
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // ─── Proctor Chat State ───
  const [proctorLog, setProctorLog] = useState<ProctorMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ─── Anti-Cheat ───
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [flashBorder, setFlashBorder] = useState(false);

  // ─── Timer ───
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Mic Level (Web Audio API) ───
  const [micLevel, setMicLevel] = useState(0); // 0–100
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micAnimRef = useRef<number | null>(null);

  // ─── Refs ───
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);

  // ─────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────
  const addProctorMsg = useCallback((msg: ProctorMessage) => {
    setProctorLog((prev) => [...prev.slice(-49), msg]);
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const now = () =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  // ─────────────────────────────────────────────────────────────────
  // Camera Request
  // ─────────────────────────────────────────────────────────────────
  const requestCamera = async () => {
    setCameraError("");
    setPermissionPhase("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 320, height: 240 } });
      setCameraStream(stream);
      setCameraGranted(true);
      setPermissionPhase("granted");
      if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;
    } catch {
      setCameraError("Camera access denied. Allow camera in browser settings and try again.");
      setPermissionPhase("denied");
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Mic Request + Audio Analyser
  // ─────────────────────────────────────────────────────────────────
  const requestMic = async () => {
    setMicError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream);
      setMicGranted(true);

      // Build Web Audio analyser
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
    } catch {
      setMicError("Microphone access denied. Allow mic in browser settings.");
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Mic level animation loop
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!testStarted || !analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    const tick = () => {
      analyserRef.current!.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      setMicLevel(Math.min(100, Math.round(avg * 2)));
      micAnimRef.current = requestAnimationFrame(tick);
    };
    micAnimRef.current = requestAnimationFrame(tick);
    return () => { if (micAnimRef.current) cancelAnimationFrame(micAnimRef.current); };
  }, [testStarted]);

  // ─────────────────────────────────────────────────────────────────
  // Attach camera to PIP when test starts
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (testStarted && cameraStream && pipVideoRef.current) {
      pipVideoRef.current.srcObject = cameraStream;
    }
  }, [testStarted, cameraStream]);

  // ─────────────────────────────────────────────────────────────────
  // Opening proctor messages + timer
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!testStarted) return;
    let delay = 0;
    OPENING_MESSAGES.forEach((msg) => {
      delay += 700;
      setTimeout(() => addProctorMsg(msg), delay);
    });
    timerRef.current = setInterval(() => setElapsedSeconds((p) => p + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [testStarted, addProctorMsg]);

  // ─────────────────────────────────────────────────────────────────
  // Auto-scroll proctor chat
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [proctorLog]);

  // ─────────────────────────────────────────────────────────────────
  // Auto-submit helper
  // ─────────────────────────────────────────────────────────────────
  const autoSubmitQuiz = useCallback(() => {
    let correctCount = 0;
    answers.forEach((ans, idx) => {
      if (idx < questions.length && ans === questions[idx].correct) correctCount++;
    });
    setQuizFinished(true);
    onQuizComplete((correctCount / questions.length) * 100);
    cameraStream?.getTracks().forEach((t) => t.stop());
    micStream?.getTracks().forEach((t) => t.stop());
    if (micAnimRef.current) cancelAnimationFrame(micAnimRef.current);
  }, [answers, questions, onQuizComplete, cameraStream, micStream]);

  // ─────────────────────────────────────────────────────────────────
  // Tab-switch detection
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!testStarted || quizFinished) return;
    const handleVisChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const n = prev + 1;
          setShowTabWarning(true);
          setFlashBorder(true);
          setTimeout(() => setShowTabWarning(false), 5000);
          setTimeout(() => setFlashBorder(false), 800);
          addProctorMsg({
            id: ++msgCounter,
            from: "proctor",
            text: `🚨 TAB SWITCH DETECTED (${n}/3)! Return to the test immediately. ${n >= 2 ? "Next violation triggers AUTO-SUBMIT." : ""}`,
            type: "error",
            ts: now(),
          });
          return n;
        });
      } else {
        addProctorMsg({ id: ++msgCounter, from: "proctor", text: "✅ Focus restored. Continue your test.", type: "info", ts: now() });
      }
    };
    document.addEventListener("visibilitychange", handleVisChange);
    return () => document.removeEventListener("visibilitychange", handleVisChange);
  }, [testStarted, quizFinished, addProctorMsg]);

  useEffect(() => {
    if (tabSwitchCount >= 3 && testStarted && !quizFinished) {
      addProctorMsg({ id: ++msgCounter, from: "proctor", text: "❌ 3 violations reached. AUTO-SUBMITTING test now.", type: "error", ts: now() });
      setTimeout(autoSubmitQuiz, 1500);
    }
  }, [tabSwitchCount, testStarted, quizFinished, autoSubmitQuiz, addProctorMsg]);

  // ─────────────────────────────────────────────────────────────────
  // Periodic proctor health-check messages
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!testStarted || quizFinished) return;
    const healthChecks = [
      { delay: 15000, msg: "🔍 Periodic check: Camera feed nominal. Face in frame.", type: "success" as const },
      { delay: 30000, msg: "🎙️ Audio levels stable. Ambient noise within acceptable threshold.", type: "info" as const },
      { delay: 45000, msg: "⏱️ Reminder: Do not switch tabs or open other applications.", type: "warn" as const },
      { delay: 70000, msg: "📊 Mid-test scan complete. Identity verified. Continue.", type: "success" as const },
      { delay: 100000, msg: "🔒 Proctoring integrity confirmed. No violations detected.", type: "success" as const },
    ];
    const timers = healthChecks.map(({ delay, msg, type }) =>
      setTimeout(() => addProctorMsg({ id: ++msgCounter, from: "proctor", text: msg, type, ts: now() }), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [testStarted, quizFinished, addProctorMsg]);

  // ─────────────────────────────────────────────────────────────────
  // Proctor message on question advance
  // ─────────────────────────────────────────────────────────────────
  const questionProctorComments = [
    "📝 Analysing response pattern. Proceed to next question.",
    "🧠 Neural engagement detected. Good focus level.",
    "⚡ Answer registered. Processing identity confidence score.",
    "✅ Response logged. Maintain current cognitive state.",
    "🎯 Final question incoming. Maintain composure.",
  ];

  // ─────────────────────────────────────────────────────────────────
  // Cleanup on unmount
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach((t) => t.stop());
      micStream?.getTracks().forEach((t) => t.stop());
      if (micAnimRef.current) cancelAnimationFrame(micAnimRef.current);
      audioCtxRef.current?.close();
    };
  }, [cameraStream, micStream]);

  // ─────────────────────────────────────────────────────────────────
  // Quiz Logic
  // ─────────────────────────────────────────────────────────────────
  const handleOptionSelect = (idx: number) => { if (!showExplanation) setSelectedOpt(idx); };

  const handleNext = () => {
    if (selectedOpt === null) return;
    if (!showExplanation) {
      setShowExplanation(true);
    } else {
      const newAnswers = [...answers, selectedOpt];
      setAnswers(newAnswers);
      setShowExplanation(false);
      setSelectedOpt(null);
      if (currentIdx < questions.length - 1) {
        const nextIdx = currentIdx + 1;
        setCurrentIdx(nextIdx);
        addProctorMsg({ id: ++msgCounter, from: "proctor", text: questionProctorComments[currentIdx] || "📋 Response recorded.", type: "info", ts: now() });
      } else {
        let correctCount = 0;
        newAnswers.forEach((ans, idx) => { if (idx < questions.length && ans === questions[idx].correct) correctCount++; });
        const pct = (correctCount / questions.length) * 100;
        addProctorMsg({ id: ++msgCounter, from: "proctor", text: `🏁 Test complete. Score: ${pct.toFixed(0)}%. Proctoring session ended.`, type: "success", ts: now() });
        setQuizFinished(true);
        onQuizComplete(pct);
        cameraStream?.getTracks().forEach((t) => t.stop());
        micStream?.getTracks().forEach((t) => t.stop());
        if (micAnimRef.current) cancelAnimationFrame(micAnimRef.current);
      }
    }
  };

  const resetQuiz = () => {
    setCurrentIdx(0); setSelectedOpt(null); setAnswers([]); setShowExplanation(false);
    setQuizFinished(false); setTestStarted(false); setTabSwitchCount(0);
    setElapsedSeconds(0); setCameraGranted(false); setMicGranted(false);
    setCameraStream(null); setMicStream(null); setCameraError(""); setMicError("");
    setProctorLog([]); setMicLevel(0); setPermissionPhase("idle");
  };

  const computeScore = () => answers.filter((a, i) => i < questions.length && a === questions[i].correct).length;

  const getScoreGrade = (pct: number) => {
    if (pct >= 85) return { grade: "A — Excellent", color: "text-emerald-400" };
    if (pct >= 60) return { grade: "B — Good", color: "text-indigo-400" };
    if (pct >= 40) return { grade: "C — Average", color: "text-amber-400" };
    return { grade: "D — Needs Improvement", color: "text-red-400" };
  };

  // Mic level bars (7 bars)
  const MIC_BARS = 7;
  const MicBars = () => (
    <div className="flex items-end gap-0.5 h-5">
      {Array.from({ length: MIC_BARS }, (_, i) => {
        const threshold = ((i + 1) / MIC_BARS) * 100;
        const active = micLevel >= threshold;
        return (
          <div
            key={i}
            className={`w-1 rounded-sm transition-all duration-75 ${active ? "bg-emerald-400" : "bg-slate-700"}`}
            style={{ height: `${30 + i * 10}%` }}
          />
        );
      })}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────
  // RENDER: Permission Setup Screen
  // ─────────────────────────────────────────────────────────────────
  if (!testStarted) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">

        {/* ── Camera Access Notification Banner ── */}
        {permissionPhase === "requesting" && (
          <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-semibold animate-pulse">
            <Camera className="w-4 h-4 shrink-0" />
            <span>Your browser is asking for camera access — please click <strong>"Allow"</strong> in the popup to continue.</span>
          </div>
        )}
        {permissionPhase === "denied" && (
          <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-red-300 text-xs font-semibold">
            <CameraOff className="w-4 h-4 shrink-0" />
            <span>Camera access was blocked. Open browser settings → Site permissions → Camera → Allow this site.</span>
          </div>
        )}
        {permissionPhase === "granted" && cameraGranted && (
          <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Camera access granted. Live feed is active and ready for proctoring.</span>
          </div>
        )}

        {/* ── Setup Card ── */}
        <div className="glass-card p-6 border border-slate-800 bg-slate-900/60 rounded-2xl shadow-xl space-y-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Proctor Setup</h3>
              <p className="text-[11px] text-slate-400">Enable camera & microphone to begin the live proctored test.</p>
            </div>
          </div>

          {/* Role pill */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center justify-between">
            <span><span className="text-slate-500">Target Role: </span><span className="text-indigo-300 font-bold">{roleName}</span></span>
            <span><span className="text-slate-500">Questions: </span><span className="font-bold text-slate-200">{questions.length}</span></span>
          </div>

          {/* Permission Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Camera */}
            <div className={`p-4 rounded-xl border space-y-3 transition-all ${cameraGranted ? "border-emerald-500/40 bg-emerald-950/10" : "border-slate-800 bg-slate-950/40"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className={`w-5 h-5 ${cameraGranted ? "text-emerald-400" : "text-slate-400"}`} />
                  <span className="text-xs font-bold text-slate-200">Camera</span>
                </div>
                {cameraGranted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-slate-600" />}
              </div>
              {cameraGranted ? (
                <div className="rounded-lg overflow-hidden border border-emerald-500/20 relative">
                  <video ref={videoPreviewRef} autoPlay muted playsInline className="w-full h-28 object-cover bg-black" />
                  <div className="absolute top-1 left-1 flex items-center gap-1 px-1.5 py-0.5 bg-black/60 rounded text-[9px] text-emerald-400 font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </div>
                </div>
              ) : (
                <button
                  onClick={requestCamera}
                  className="w-full py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold transition-all cursor-pointer border border-indigo-500/30 flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" /> Enable Camera
                </button>
              )}
              {cameraError && <p className="text-[10px] text-red-400 leading-tight">{cameraError}</p>}
            </div>

            {/* Mic */}
            <div className={`p-4 rounded-xl border space-y-3 transition-all ${micGranted ? "border-emerald-500/40 bg-emerald-950/10" : "border-slate-800 bg-slate-950/40"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className={`w-5 h-5 ${micGranted ? "text-emerald-400" : "text-slate-400"}`} />
                  <span className="text-xs font-bold text-slate-200">Microphone</span>
                </div>
                {micGranted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-slate-600" />}
              </div>
              {micGranted ? (
                <div className="p-3 bg-emerald-950/20 rounded-lg border border-emerald-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-300 font-semibold">Audio stream active</span>
                  </div>
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                </div>
              ) : (
                <button
                  onClick={requestMic}
                  className="w-full py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold transition-all cursor-pointer border border-indigo-500/30 flex items-center justify-center gap-1.5"
                >
                  <Mic className="w-3.5 h-3.5" /> Enable Microphone
                </button>
              )}
              {micError && <p className="text-[10px] text-red-400 leading-tight">{micError}</p>}
            </div>
          </div>

          {/* Proctoring Rules */}
          <div className="p-3.5 bg-amber-950/20 border border-amber-500/20 rounded-xl text-[11px] space-y-1.5">
            <p className="font-bold text-amber-300 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Live Proctoring Rules</p>
            <ul className="space-y-1 pl-5 list-disc text-amber-300/80">
              <li>Camera and microphone must stay <strong>active</strong> throughout the test.</li>
              <li>Tab switching or minimising the browser is flagged as a <strong>violation</strong>.</li>
              <li>After <strong>3 violations</strong>, the test auto-submits with your current answers.</li>
              <li>The AI Proctor monitors audio, video, and focus in real time.</li>
            </ul>
          </div>

          {/* Start Button */}
          <button
            onClick={() => setTestStarted(true)}
            disabled={!cameraGranted || !micGranted}
            className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              cameraGranted && micGranted
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 cursor-pointer"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Shield className="w-4 h-4" />
            {cameraGranted && micGranted ? "Launch Proctored Test" : "Enable Camera & Mic to Start"}
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // RENDER: Main Quiz + Live Proctor Panel
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative max-w-5xl mx-auto">

      {/* ── Tab-Switch Alert Banner ── */}
      {showTabWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 py-3 px-4 bg-red-600 text-white text-sm font-bold text-center flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300 shadow-2xl">
          <AlertTriangle className="w-5 h-5" />
          ⚠️ TAB SWITCH VIOLATION DETECTED — {tabSwitchCount}/3 — {tabSwitchCount >= 2 ? "NEXT VIOLATION AUTO-SUBMITS!" : "Return immediately!"}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ══════════════════════════════════
            LEFT COLUMN: Quiz Panel (2/3 width)
        ══════════════════════════════════ */}
        <div className={`lg:col-span-2 glass-card p-5 border bg-slate-900/60 rounded-2xl shadow-xl space-y-5 relative transition-all duration-300 ${
          flashBorder ? "border-red-500 shadow-red-500/30" : "border-slate-800"
        }`}>

          {/* ── Proctor HUD Bar ── */}
          <div className="flex items-center justify-between text-[10px] font-mono border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
                tabSwitchCount > 0 ? "border-red-500/40 bg-red-500/10 text-red-400" : "border-slate-700 text-slate-500"
              }`}>
                <Eye className="w-3 h-3" />
                <span>Violations: {tabSwitchCount}/3</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>PROCTOR LIVE</span>
              </div>
              {/* Mic level bars */}
              <div className="flex items-center gap-1.5">
                <MicBars />
              </div>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
          </div>

          {/* ── Quiz Header ── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-white">Mock Eligibility Test</h3>
                <p className="text-[10px] text-slate-400">Role: <span className="text-indigo-300 font-semibold">{roleName}</span></p>
              </div>
            </div>
            {!quizFinished && (
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">
                Q {currentIdx + 1}/{questions.length}
              </span>
            )}
          </div>

          {/* ── Progress Bar ── */}
          {!quizFinished && (
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
              />
            </div>
          )}

          {/* ── Question / Result ── */}
          {!quizFinished ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
                <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                  {questions[currentIdx].question}
                </p>
              </div>

              <div className="space-y-2">
                {questions[currentIdx].options.map((opt, oIdx) => {
                  const isSelected = selectedOpt === oIdx;
                  const isCorrect = questions[currentIdx].correct === oIdx;
                  let cls = "border-slate-800 bg-slate-950/40 hover:bg-slate-900 hover:border-slate-700";
                  if (isSelected && !showExplanation) cls = "border-indigo-500 bg-indigo-500/10 text-indigo-200";
                  if (showExplanation) {
                    if (isCorrect) cls = "border-emerald-500 bg-emerald-500/10 text-emerald-300";
                    else if (isSelected) cls = "border-red-500 bg-red-500/10 text-red-300";
                    else cls = "border-slate-800/40 bg-slate-950/10 text-slate-600 opacity-50";
                  }
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleOptionSelect(oIdx)}
                      disabled={showExplanation}
                      className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${cls}`}
                    >
                      <span>{opt}</span>
                      {showExplanation && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {showExplanation && isSelected && !isCorrect && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div className="p-3.5 bg-indigo-950/20 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs leading-relaxed animate-in fade-in duration-200">
                  <span className="font-bold block mb-1">📘 Explanation:</span>
                  {questions[currentIdx].explanation}
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={selectedOpt === null}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  selectedOpt === null
                    ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 cursor-pointer"
                }`}
              >
                <span>{showExplanation ? "Next Question" : "Confirm Answer"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* ── Results Screen ── */
            <div className="text-center space-y-5 py-4 animate-in fade-in duration-300">
              <div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/30">
                <Award className="w-12 h-12 text-indigo-400 animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-100">
                  {tabSwitchCount >= 3 ? "Test Auto-Submitted!" : "Test Complete!"}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {tabSwitchCount >= 3 ? "Auto-submitted after 3 tab-switch violations." : "Mock assessment complete."}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px] max-w-xs mx-auto">
                {[
                  { label: "Duration", value: formatTime(elapsedSeconds), color: "text-slate-200" },
                  { label: "Violations", value: `${tabSwitchCount}`, color: tabSwitchCount > 0 ? "text-red-400" : "text-emerald-400" },
                  { label: "Answered", value: `${answers.length}/${questions.length}`, color: "text-slate-200" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg text-center">
                    <p className="text-slate-500">{label}</p>
                    <p className={`font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl max-w-xs mx-auto space-y-2 shadow-inner">
                <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Eligibility Report</p>
                <div className="text-4xl font-black text-white">{((computeScore() / questions.length) * 100).toFixed(0)}%</div>
                <div className="text-xs font-semibold">
                  Grade:{" "}
                  <span className={`font-bold ${getScoreGrade((computeScore() / questions.length) * 100).color}`}>
                    {getScoreGrade((computeScore() / questions.length) * 100).grade}
                  </span>
                </div>
              </div>

              <button
                onClick={resetQuiz}
                className="mx-auto flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retake Test
              </button>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════
            RIGHT COLUMN: AI Proctor Panel (1/3)
        ══════════════════════════════════ */}
        <div className="lg:col-span-1 flex flex-col gap-3">

          {/* Live Camera PIP */}
          <div className="glass-card border border-slate-800 bg-slate-900/60 rounded-2xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                LIVE FEED
              </div>
              <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                REC
              </div>
            </div>
            {!quizFinished ? (
              <div className="relative bg-black aspect-video">
                <video ref={pipVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                {/* Scan-line overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)"
                }} />
                {/* Corner brackets */}
                <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-emerald-400/70" />
                <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-emerald-400/70" />
                <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-emerald-400/70" />
                <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-emerald-400/70" />
                <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between px-1">
                  <span className="text-[8px] font-mono text-emerald-400/80">FACE LOCK</span>
                  <span className="text-[8px] font-mono text-emerald-400/80">{formatTime(elapsedSeconds)}</span>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-slate-950 flex items-center justify-center">
                <CameraOff className="w-8 h-8 text-slate-700" />
              </div>
            )}
            {/* Mic bar strip */}
            <div className="px-3 py-2 flex items-center gap-2 bg-slate-950/30 border-t border-slate-800">
              <Mic className="w-3 h-3 text-emerald-400 shrink-0" />
              <div className="flex-1 flex items-end gap-0.5 h-4">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-[1px] transition-all duration-75 ${(i / 20) * 100 < micLevel ? "bg-emerald-400" : "bg-slate-800"}`}
                    style={{ height: `${40 + Math.sin((i / 20) * Math.PI) * 60}%` }}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-slate-500 shrink-0">{micLevel}%</span>
            </div>
          </div>

          {/* Status Pills */}
          <div className="grid grid-cols-2 gap-2">
            <div className={`flex items-center gap-1.5 p-2 rounded-xl border text-[9px] font-bold ${
              cameraGranted ? "border-emerald-500/30 bg-emerald-950/10 text-emerald-400" : "border-red-500/30 bg-red-950/10 text-red-400"
            }`}>
              {cameraGranted ? <Camera className="w-3 h-3" /> : <CameraOff className="w-3 h-3" />}
              {cameraGranted ? "CAM ON" : "CAM OFF"}
            </div>
            <div className={`flex items-center gap-1.5 p-2 rounded-xl border text-[9px] font-bold ${
              micGranted ? "border-emerald-500/30 bg-emerald-950/10 text-emerald-400" : "border-red-500/30 bg-red-950/10 text-red-400"
            }`}>
              {micGranted ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
              {micGranted ? "MIC ON" : "MIC OFF"}
            </div>
            <div className={`flex items-center gap-1.5 p-2 rounded-xl border text-[9px] font-bold col-span-2 ${
              tabSwitchCount === 0 ? "border-emerald-500/30 bg-emerald-950/10 text-emerald-400"
              : tabSwitchCount < 3 ? "border-amber-500/30 bg-amber-950/10 text-amber-400"
              : "border-red-500/30 bg-red-950/10 text-red-400"
            }`}>
              <WifiOff className="w-3 h-3" />
              TAB INTEGRITY: {tabSwitchCount === 0 ? "CLEAN" : `${tabSwitchCount} VIOLATION${tabSwitchCount > 1 ? "S" : ""}`}
            </div>
          </div>

          {/* AI Proctor Chat */}
          <div className="glass-card border border-slate-800 bg-slate-900/60 rounded-2xl shadow-xl flex flex-col overflow-hidden" style={{ minHeight: "240px", maxHeight: "340px" }}>
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-800 bg-slate-950/40 shrink-0">
              <div className="p-1 rounded-md bg-purple-500/10 border border-purple-500/30">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">AI Proctor Live</span>
              <div className="ml-auto flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                <span className="text-[8px] text-amber-400 font-bold">ACTIVE</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2 scrollbar-thin">
              {proctorLog.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[10px] text-slate-600 font-mono">Initialising proctor session…</p>
                </div>
              ) : (
                proctorLog.map((msg) => (
                  <div key={msg.id} className="flex gap-1.5 items-start">
                    <div className={`p-0.5 rounded-full shrink-0 mt-0.5 ${
                      msg.type === "error" ? "bg-red-500/20" :
                      msg.type === "warn" ? "bg-amber-500/20" :
                      msg.type === "success" ? "bg-emerald-500/20" : "bg-purple-500/20"
                    }`}>
                      <Bot className={`w-2.5 h-2.5 ${
                        msg.type === "error" ? "text-red-400" :
                        msg.type === "warn" ? "text-amber-400" :
                        msg.type === "success" ? "text-emerald-400" : "text-purple-400"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] leading-tight font-medium break-words ${
                        msg.type === "error" ? "text-red-300" :
                        msg.type === "warn" ? "text-amber-300" :
                        msg.type === "success" ? "text-emerald-300" : "text-slate-300"
                      }`}>{msg.text}</p>
                      <p className="text-[8px] text-slate-600 font-mono mt-0.5">{msg.ts}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
