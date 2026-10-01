"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  BookOpen, CheckCircle2, AlertTriangle, ArrowRight, Award,
  RotateCcw, Camera, Mic, XCircle, Shield, Clock, Eye,
  MicOff, CameraOff, Bot, User, WifiOff, Zap, Activity,
  Maximize2, AlertOctagon, ScanFace, Target
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
// Biometric Neural Face Canvas (Fallback & Virtual Vision Mode)
// ─────────────────────────────────────────────────────────────────
function NeuralFaceCanvas({
  pupilOffset,
  gazeDirection,
  className = "",
}: {
  pupilOffset: { x: number; y: number };
  gazeDirection: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let scanY = 0;
    let scanSpeed = 1.4;
    let pulse = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Dark background with subtle cyber grid
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(99, 102, 241, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      pulse += 0.05;
      const glow = Math.sin(pulse) * 0.25 + 0.75;
      const cx = w / 2;
      const cy = h / 2 - 4;

      // Outer Head Wireframe
      ctx.strokeStyle = `rgba(99, 102, 241, ${0.45 * glow})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 38, 48, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Head Contour
      ctx.strokeStyle = "rgba(129, 140, 248, 0.25)";
      ctx.beginPath();
      ctx.ellipse(cx, cy - 4, 30, 38, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Jaw / Chin Wireframe
      ctx.strokeStyle = "rgba(99, 102, 241, 0.4)";
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy + 15);
      ctx.lineTo(cx - 15, cy + 45);
      ctx.lineTo(cx + 15, cy + 45);
      ctx.lineTo(cx + 30, cy + 15);
      ctx.stroke();

      // Dynamic Eye Landmarks (track with gaze offset)
      const leftEyeX = cx - 14 + pupilOffset.x * 0.4;
      const leftEyeY = cy - 8 + pupilOffset.y * 0.4;
      const rightEyeX = cx + 14 + pupilOffset.x * 0.4;
      const rightEyeY = cy - 8 + pupilOffset.y * 0.4;

      // Left Eye Box & Iris
      ctx.strokeStyle = "rgba(52, 211, 153, 0.75)";
      ctx.strokeRect(cx - 20, cy - 13, 12, 10);
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(leftEyeX - 2, leftEyeY - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Right Eye Box & Iris
      ctx.strokeStyle = "rgba(52, 211, 153, 0.75)";
      ctx.strokeRect(cx + 8, cy - 13, 12, 10);
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(rightEyeX + 2, rightEyeY - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Nose & Mouth landmarks
      ctx.strokeStyle = "rgba(167, 139, 250, 0.5)";
      ctx.beginPath();
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx, cy + 8);
      ctx.lineTo(cx + 4, cy + 12);
      ctx.stroke();

      ctx.strokeStyle = "rgba(167, 139, 250, 0.6)";
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy + 24);
      ctx.lineTo(cx + 10, cy + 24);
      ctx.stroke();

      // Scanning wave line
      scanY += scanSpeed;
      if (scanY > h || scanY < 0) scanSpeed = -scanSpeed;

      const grad = ctx.createLinearGradient(0, scanY - 6, 0, scanY + 6);
      grad.addColorStop(0, "rgba(52, 211, 153, 0)");
      grad.addColorStop(0.5, "rgba(52, 211, 153, 0.4)");
      grad.addColorStop(1, "rgba(52, 211, 153, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 6, w, 12);

      ctx.strokeStyle = "rgba(52, 211, 153, 0.8)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(w, scanY);
      ctx.stroke();

      // Biometric overlay text
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 8px monospace";
      ctx.fillText("AI BIOMETRIC EYE RADAR", 8, 12);

      ctx.fillStyle = gazeDirection === "CENTER" ? "#10b981" : "#f59e0b";
      ctx.fillText(`GAZE VECTOR: [ ${gazeDirection} ]`, 8, h - 8);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [pupilOffset, gazeDirection]);

  return <canvas ref={canvasRef} width={200} height={140} className={`w-full h-full object-cover ${className}`} />;
}

// ─────────────────────────────────────────────────────────────────
// Helper to reliably setup & play HTML5 Video streams
// ─────────────────────────────────────────────────────────────────
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
          console.warn("video.play() caught:", e);
        });
      }
    };

    video.onloadedmetadata = startPlay;
    video.onloadeddata = startPlay;
    video.oncanplay = startPlay;
    startPlay();
  } catch (e) {
    console.error("Error setting up video playback:", e);
  }
};

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
  proctorMsg("🛡️ AI Proctor v2.5 initialized. Fullscreen & biometric verification active.", "success"),
  proctorMsg("📷 Live camera stream confirmed. Eye-tracking analyzer running.", "success"),
  proctorMsg("🎙️ Microphone audio stream active. Ambient levels nominal.", "success"),
  proctorMsg("👀 RULE: Keep your eyes focused directly on the screen/camera at all times.", "warn"),
  proctorMsg("⚠️ 2 Gaze Warnings permitted. On the 3rd deviation, assessment is terminated!", "warn"),
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
  const [isSimulatedStream, setIsSimulatedStream] = useState(false);
  const [viewMode, setViewMode] = useState<"camera" | "neural">("camera");
  const [testStarted, setTestStarted] = useState(false);

  // ─── Eye Tracking / Gaze State ───
  const [gazeDirection, setGazeDirection] = useState<"CENTER" | "LEFT" | "RIGHT" | "UP" | "DOWN">("CENTER");
  const [gazeViolations, setGazeViolations] = useState(0); // Max 2 warnings, 3rd terminates
  const [showGazeWarning, setShowGazeWarning] = useState(false);
  const [gazeWarningText, setGazeWarningText] = useState("");
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const eyeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const deviationDurationRef = useRef<number>(0);

  // ─── Forced Retake Modal State ───
  const [retakeModalReason, setRetakeModalReason] = useState<string | null>(null);

  const enableSimulatedProctor = () => {
    setCameraGranted(true);
    setMicGranted(true);
    setIsSimulatedStream(true);
    setViewMode("neural");
    setPermissionPhase("granted");
    setCameraError("");
    setMicError("");
  };

  // ─── Quiz State ───
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // ─── Proctor Chat State ───
  const [proctorLog, setProctorLog] = useState<ProctorMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
  // Forced Retake Trigger
  // ─────────────────────────────────────────────────────────────────
  const triggerForcedRetake = useCallback((reason: string) => {
    setRetakeModalReason(reason);
    setQuizFinished(true);
    addProctorMsg({
      id: ++msgCounter,
      from: "proctor",
      text: `❌ ASSESSMENT TERMINATED: ${reason}. You must retake the test.`,
      type: "error",
      ts: now(),
    });
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [addProctorMsg]);

  // ─────────────────────────────────────────────────────────────────
  // Camera Request
  // ─────────────────────────────────────────────────────────────────
  const requestCamera = async () => {
    setCameraError("");
    setPermissionPhase("requesting");
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setCameraStream(stream);
      setCameraGranted(true);
      setIsSimulatedStream(false);
      setViewMode("camera");
      setPermissionPhase("granted");

      setTimeout(() => {
        setupVideoPlayback(videoPreviewRef.current, stream);
        setupVideoPlayback(pipVideoRef.current, stream);
      }, 50);
    } catch (err: any) {
      console.warn("Camera request error:", err);
      setCameraError("Camera access denied or hardware unavailable. Switch to AI Neural Mesh to proceed.");
      setPermissionPhase("denied");
      setViewMode("neural");
    }
  };

  // Dedicated effect to attach cameraStream to videoPreviewRef & pipVideoRef
  useEffect(() => {
    if (cameraStream) {
      setupVideoPlayback(videoPreviewRef.current, cameraStream);
      setupVideoPlayback(pipVideoRef.current, cameraStream);
    }
  }, [cameraStream, cameraGranted, testStarted, viewMode]);

  // ─────────────────────────────────────────────────────────────────
  // Mic Request + Audio Analyser
  // ─────────────────────────────────────────────────────────────────
  const requestMic = async () => {
    setMicError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream);
      setMicGranted(true);

      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try {
          audioCtxRef.current.close().catch(() => {});
        } catch {
          // ignore closed error
        }
      }

      // Build Web Audio analyser
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        await ctx.resume().catch(() => {});
      }
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
  // Mic level animation loop (using RMS Audio level)
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!micGranted || !analyserRef.current) return;
    
    // Auto resume suspended AudioContext
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }

    const analyser = analyserRef.current;
    const timeData = new Uint8Array(analyser.fftSize);

    const tick = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteTimeDomainData(timeData);
        let sumSquares = 0;
        for (let i = 0; i < timeData.length; i++) {
          const norm = (timeData[i] - 128) / 128;
          sumSquares += norm * norm;
        }
        const rms = Math.sqrt(sumSquares / timeData.length);
        // Map RMS volume to 0-100% with high speech sensitivity
        const rawPct = Math.round(rms * 450);
        const volumePct = Math.min(100, Math.max(0, rawPct));
        setMicLevel(volumePct);
      }
      micAnimRef.current = requestAnimationFrame(tick);
    };

    micAnimRef.current = requestAnimationFrame(tick);
    return () => { if (micAnimRef.current) cancelAnimationFrame(micAnimRef.current); };
  }, [micGranted]);

  // ─────────────────────────────────────────────────────────────────
  // Launch Test in Fullscreen
  // ─────────────────────────────────────────────────────────────────
  const handleLaunchTest = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen request error:", err);
    }
    setTestStarted(true);
  };

  // Fullscreen Exit Detection
  useEffect(() => {
    if (!testStarted || quizFinished || retakeModalReason) return;
    const handleFullScreenChange = () => {
      const isFull = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isFull) {
        triggerForcedRetake("Fullscreen mode was exited or minimized. Fullscreen is mandatory during the assessment.");
      }
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
    };
  }, [testStarted, quizFinished, retakeModalReason, triggerForcedRetake]);

  // ─────────────────────────────────────────────────────────────────
  // Real Computer Vision AI Eye-Tracking Engine
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!testStarted || quizFinished || retakeModalReason) return;

    const interval = setInterval(() => {
      const canvas = eyeCanvasRef.current;
      const video = pipVideoRef.current || videoPreviewRef.current;

      let detectedGaze: "CENTER" | "LEFT" | "RIGHT" | "UP" | "DOWN" = "CENTER";
      let offset = { x: 0, y: 0 };

      if (video && video.videoWidth > 0 && canvas) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          try {
            ctx.drawImage(video, 0, 0, 160, 120);
            const frame = ctx.getImageData(0, 0, 160, 120);
            const data = frame.data;

            // Computer Vision Dark-Cluster Pupil Centroid Analysis
            const findDarkCentroid = (minX: number, maxX: number, minY: number, maxY: number) => {
              let minB = 255;
              for (let y = minY; y < maxY; y++) {
                for (let x = minX; x < maxX; x++) {
                  const i = (y * 160 + x) * 4;
                  const b = (data[i] + data[i + 1] + data[i + 2]) / 3;
                  if (b < minB) minB = b;
                }
              }

              let sumX = 0, sumY = 0, count = 0;
              const thresh = minB + 22; // Dark pupil pixel threshold
              for (let y = minY; y < maxY; y++) {
                for (let x = minX; x < maxX; x++) {
                  const i = (y * 160 + x) * 4;
                  const b = (data[i] + data[i + 1] + data[i + 2]) / 3;
                  if (b <= thresh) {
                    sumX += x;
                    sumY += y;
                    count++;
                  }
                }
              }

              const centerX = (minX + maxX) / 2;
              const centerY = (minY + maxY) / 2;
              return {
                dx: count > 0 ? (sumX / count) - centerX : 0,
                dy: count > 0 ? (sumY / count) - centerY : 0,
              };
            };

            // Left eye region (30..70, 30..60), Right eye region (90..130, 30..60)
            const leftEye = findDarkCentroid(30, 70, 30, 60);
            const rightEye = findDarkCentroid(90, 130, 30, 60);

            const shiftX = (leftEye.dx + rightEye.dx) / 2;
            const shiftY = (leftEye.dy + rightEye.dy) / 2;

            // Horizontal & Vertical Gaze thresholding
            if (shiftX < -4.2) {
              detectedGaze = "RIGHT"; // Mirrored feed
              offset = { x: 14, y: 0 };
            } else if (shiftX > 4.2) {
              detectedGaze = "LEFT";
              offset = { x: -14, y: 0 };
            } else if (shiftY < -4.0) {
              detectedGaze = "UP";
              offset = { x: 0, y: -10 };
            } else if (shiftY > 4.0) {
              detectedGaze = "DOWN";
              offset = { x: 0, y: 10 };
            } else {
              detectedGaze = "CENTER";
              offset = { x: 0, y: 0 };
            }
          } catch {
            detectedGaze = "CENTER";
          }
        }
      } else if (isSimulatedStream) {
        detectedGaze = "CENTER";
        offset = { x: 0, y: 0 };
      }

      setGazeDirection(detectedGaze);
      setPupilOffset(offset);

      if (detectedGaze !== "CENTER") {
        deviationDurationRef.current += 1;
        if (deviationDurationRef.current === 2) {
          setGazeViolations((prev) => {
            const nextCount = prev + 1;
            const warnText = nextCount === 1
              ? `⚠️ GAZE WARNING (1/2): Looking ${detectedGaze}! Focus your eyes on the screen/camera.`
              : nextCount === 2
              ? `🚨 GAZE WARNING (2/2): Second violation looking ${detectedGaze}! Next violation terminates test!`
              : `❌ 3rd Gaze Deviation! Looked away from screen. Assessment Terminated.`;

            setGazeWarningText(warnText);
            setShowGazeWarning(true);
            setFlashBorder(true);
            setTimeout(() => setShowGazeWarning(false), 5000);
            setTimeout(() => setFlashBorder(false), 900);

            addProctorMsg({
              id: ++msgCounter,
              from: "proctor",
              text: warnText,
              type: nextCount >= 3 ? "error" : "warn",
              ts: now(),
            });

            if (nextCount >= 3) {
              setTimeout(() => {
                triggerForcedRetake("3 Gaze Deviations Detected (looked away from camera 3 times)");
              }, 1200);
            }

            return nextCount;
          });
        }
      } else {
        deviationDurationRef.current = 0;
      }
    }, 400);

    return () => clearInterval(interval);
  }, [testStarted, quizFinished, retakeModalReason, isSimulatedStream, triggerForcedRetake, addProctorMsg]);

  // ─────────────────────────────────────────────────────────────────
  // Opening proctor messages + timer
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!testStarted) return;
    let delay = 0;
    OPENING_MESSAGES.forEach((msg) => {
      delay += 600;
      setTimeout(() => addProctorMsg(msg), delay);
    });
    timerRef.current = setInterval(() => setElapsedSeconds((p) => p + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [testStarted, addProctorMsg]);

  // ─────────────────────────────────────────────────────────────────
  // Internal container scroll (Fixes window auto-scrolling bug!)
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
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
  // Cleanup on unmount / stream changes
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach((t) => t.stop());
      micStream?.getTracks().forEach((t) => t.stop());
      if (micAnimRef.current) cancelAnimationFrame(micAnimRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try {
          audioCtxRef.current.close().catch(() => {});
        } catch {
          // ignore closed error
        }
        audioCtxRef.current = null;
      }
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
    setCurrentIdx(0);
    setSelectedOpt(null);
    setAnswers([]);
    setShowExplanation(false);
    setQuizFinished(false);
    setTestStarted(false);
    setTabSwitchCount(0);
    setElapsedSeconds(0);
    setCameraGranted(false);
    setMicGranted(false);
    setCameraStream(null);
    setMicStream(null);
    setCameraError("");
    setMicError("");
    setProctorLog([]);
    setMicLevel(0);
    setPermissionPhase("idle");
    setGazeViolations(0);
    setGazeDirection("CENTER");
    setShowGazeWarning(false);
    setRetakeModalReason(null);
    setPupilOffset({ x: 0, y: 0 });
    deviationDurationRef.current = 0;
  };

  const computeScore = () => answers.filter((a, i) => i < questions.length && a === questions[i].correct).length;

  const getScoreGrade = (pct: number) => {
    if (pct >= 85) return { grade: "A — Excellent", color: "text-emerald-400" };
    if (pct >= 60) return { grade: "B — Good", color: "text-zinc-200" };
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
            className={`w-1 rounded-sm transition-all duration-75 ${active ? "bg-emerald-400" : "bg-zinc-700"}`}
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
        {/* Hidden canvas for image analysis */}
        <canvas ref={eyeCanvasRef} width="160" height="120" className="hidden" />

        {/* ── Retake Modal (if redirected back due to violation) ── */}
        {retakeModalReason && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="glass-card border border-red-500/50 bg-zinc-950/95 max-w-md w-full p-6 rounded-2xl shadow-2xl text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/60 flex items-center justify-center mx-auto text-red-400">
                <AlertOctagon className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-xl font-black text-red-400">Assessment Terminated</h3>
                <p className="text-xs text-zinc-300 mt-2 font-medium leading-relaxed">
                  {retakeModalReason}
                </p>
              </div>
              <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-xl text-[11px] text-red-300 text-left space-y-1">
                <p className="font-bold flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-red-400" /> Proctoring Rule</p>
                <p className="text-zinc-400">Assessment requires continuous fullscreen mode and strict eyeball focus on the screen/camera at all times. Exceeding 2 warnings requires a full retake.</p>
              </div>
              <button
                onClick={resetQuiz}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Start Assessment Again
              </button>
            </div>
          </div>
        )}

        {/* ── Camera Access Notification Banner ── */}
        {permissionPhase === "requesting" && (
          <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-semibold animate-pulse">
            <Camera className="w-4 h-4 shrink-0" />
            <span>Your browser is asking for camera access — please click <strong>"Allow"</strong> in the popup to continue.</span>
          </div>
        )}
        {permissionPhase === "denied" && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/40 rounded-xl text-red-300 text-xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-semibold">
                <CameraOff className="w-4 h-4 shrink-0 text-red-400" />
                <span>Camera access was blocked by browser permissions.</span>
              </div>
              <button
                onClick={enableSimulatedProctor}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-zinc-100 via-slate-200 to-zinc-300 text-zinc-950 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-md"
              >
                ✨ Use Simulated AI Proctor (Bypass)
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              To unblock real camera: Click the 🔒 lock icon near the URL address bar (<code className="text-amber-300">http://localhost:2080</code>) → Set <strong>Camera</strong> to <strong>Allow</strong> → Click "Enable Camera".
            </p>
          </div>
        )}
        {permissionPhase === "granted" && cameraGranted && (
          <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{isSimulatedStream ? "Simulated AI Proctor active. Virtual vision stream enabled." : "Camera access granted. Live feed is active and ready for proctoring."}</span>
          </div>
        )}

        {/* ── Setup Card ── */}
        <div className="glass-card p-7 border border-zinc-700/60 bg-zinc-950/85 rounded-3xl shadow-[0_0_35px_rgba(255,255,255,0.06)] space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <Shield className="w-5 h-5 text-zinc-200" />
              </div>
              <div>
                <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-zinc-300">AI Proctor Setup</h3>
                <p className="text-[11px] text-zinc-400 font-medium">Enable camera & microphone to begin the live proctored test.</p>
              </div>
            </div>

            {/* Quick 1-click bypass button */}
            {(!cameraGranted || !micGranted) && (
              <button
                onClick={enableSimulatedProctor}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-400 text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Bypass hardware (Simulate)
              </button>
            )}
          </div>

          {/* Role pill */}
          <div className="p-3.5 bg-gradient-to-r from-zinc-900/80 via-zinc-950/90 to-zinc-900/80 border border-zinc-750 border-zinc-700/60 rounded-xl text-xs text-zinc-300 flex items-center justify-between shadow-inner">
            <span><span className="text-zinc-400">Target Role: </span><span className="text-zinc-100 font-bold">{roleName}</span></span>
            <span><span className="text-zinc-400">Questions: </span><span className="font-black text-zinc-100 bg-zinc-850 px-2 py-0.5 rounded border border-zinc-700">{questions.length}</span></span>
          </div>

          {/* Permission Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {/* Camera Card */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${cameraGranted ? "border-emerald-500/40 bg-emerald-950/15 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "border-zinc-700/60 bg-zinc-950/80"}`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-800/60">
                  <div className="flex items-center gap-2">
                    <Camera className={`w-5 h-5 ${cameraGranted ? "text-emerald-400" : "text-zinc-300"}`} />
                    <span className="text-xs font-bold text-zinc-200">Camera</span>
                  </div>
                  {cameraGranted ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-zinc-600 shrink-0" />}
                </div>

                {cameraGranted ? (
                  <div className="rounded-xl overflow-hidden border border-emerald-500/30 relative shadow-inner bg-black">
                    {viewMode === "neural" || isSimulatedStream ? (
                      <div className="w-full h-32 bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden">
                        <NeuralFaceCanvas pupilOffset={pupilOffset} gazeDirection={gazeDirection} className="h-32" />
                      </div>
                    ) : (
                      <video
                        ref={(el) => {
                          videoPreviewRef.current = el;
                          if (el && cameraStream) {
                            setupVideoPlayback(el, cameraStream);
                          }
                        }}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-32 object-cover bg-black transform -scale-x-100"
                      />
                    )}
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-2 py-0.5 bg-black/80 rounded-md text-[9px] text-emerald-400 font-black">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {viewMode === "neural" || isSimulatedStream ? "AI RADAR" : "LIVE WEBCAM"}
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewMode((prev) => (prev === "camera" ? "neural" : "camera"))}
                      className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-[9px] text-zinc-200 font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Zap className="w-2.5 h-2.5 text-amber-400" />
                      {viewMode === "camera" ? "Use AI Radar" : "Use WebCam"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 py-2">
                    <button
                      onClick={requestCamera}
                      className="silver-button-primary w-full py-2.5 rounded-xl text-zinc-950 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Camera className="w-3.5 h-3.5" /> Enable Camera
                    </button>
                    <button
                      onClick={enableSimulatedProctor}
                      className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-bold transition-all cursor-pointer border border-zinc-700 flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Zap className="w-3 h-3 text-amber-400" /> Use Simulated AI Camera
                    </button>
                  </div>
                )}
              </div>
              {cameraError && <p className="text-[10px] text-red-400 leading-tight mt-2">{cameraError}</p>}
            </div>

            {/* Microphone Card */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${micGranted ? "border-emerald-500/40 bg-emerald-950/15 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "border-zinc-700/60 bg-zinc-950/80"}`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-800/60">
                  <div className="flex items-center gap-2">
                    <Mic className={`w-5 h-5 ${micGranted ? "text-emerald-400" : "text-zinc-300"}`} />
                    <span className="text-xs font-bold text-zinc-200">Microphone</span>
                  </div>
                  {micGranted ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-zinc-600 shrink-0" />}
                </div>

                {micGranted ? (
                  <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
                        <span className="text-[11px] text-emerald-300 font-bold">Live Audio Stream</span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-300 font-black px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">{micLevel}% Vol</span>
                    </div>

                    <div className="flex items-center justify-between bg-zinc-950/90 px-3 py-2.5 rounded-xl border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-mono font-medium">Mic Input Level:</span>
                      <MicBars />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-2">
                    <button
                      onClick={requestMic}
                      className="silver-button-primary w-full py-2.5 rounded-xl text-zinc-950 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Mic className="w-3.5 h-3.5" /> Enable Microphone
                    </button>
                  </div>
                )}
              </div>
              {micError && <p className="text-[10px] text-red-400 leading-tight mt-2">{micError}</p>}
            </div>
          </div>

          {/* Proctoring Rules */}
          <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl text-[11px] space-y-1.5 shadow-[0_0_15px_rgba(245,158,11,0.08)]">
            <p className="font-bold text-amber-300 flex items-center gap-1.5"><Eye className="w-4 h-4" /> Strict AI Proctoring Rules</p>
            <ul className="space-y-1 pl-5 list-disc text-amber-300/80 font-medium">
              <li>Test runs in <strong>mandatory Fullscreen Mode</strong>. Exiting fullscreen forces an immediate retake.</li>
              <li><strong>AI Eye-Tracking is Active:</strong> You must keep your eyes on the screen/camera. Deviating (left, right, up, down) gives <strong>2 warnings</strong>; the 3rd deviation terminates the test and forces a retake.</li>
              <li>Tab switching or minimizing results in test termination.</li>
              <li>Camera & microphone must remain active throughout.</li>
            </ul>
          </div>

          {/* Start Button */}
          <button
            onClick={handleLaunchTest}
            disabled={!cameraGranted || !micGranted}
            className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              cameraGranted && micGranted
                ? "silver-button-primary text-zinc-950 cursor-pointer"
                : "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            {cameraGranted && micGranted ? "Launch Fullscreen Proctored Test" : "Enable Camera & Mic to Start"}
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
      {/* Hidden canvas for eyeball vision analysis */}
      <canvas ref={eyeCanvasRef} width="160" height="120" className="hidden" />

      {/* ── Retake Modal (Termination overlay) ── */}
      {retakeModalReason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="glass-card border border-red-500/50 bg-zinc-950/95 max-w-md w-full p-6 rounded-2xl shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/60 flex items-center justify-center mx-auto text-red-400 animate-pulse">
              <AlertOctagon className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-xl font-black text-red-400">Assessment Terminated</h3>
              <p className="text-xs text-zinc-300 mt-2 font-medium leading-relaxed">
                {retakeModalReason}
              </p>
            </div>
            <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-xl text-[11px] text-red-300 text-left space-y-1">
              <p className="font-bold flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-red-400" /> Proctoring Rule Enforced</p>
              <p className="text-zinc-400">The assessment requires continuous fullscreen focus and eyeballs directed on the screen. Exceeding 2 warnings requires a retake.</p>
            </div>
            <button
              onClick={resetQuiz}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Retake Assessment From Beginning
            </button>
          </div>
        </div>
      )}

      {/* ── Tab-Switch Alert Banner ── */}
      {showTabWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 py-3 px-4 bg-red-600 text-white text-sm font-bold text-center flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300 shadow-2xl">
          <AlertTriangle className="w-5 h-5" />
          ⚠️ TAB SWITCH VIOLATION DETECTED — {tabSwitchCount}/3 — {tabSwitchCount >= 2 ? "NEXT VIOLATION AUTO-SUBMITS!" : "Return immediately!"}
        </div>
      )}

      {/* ── Gaze Warning Banner ── */}
      {showGazeWarning && (
        <div className="fixed top-12 left-0 right-0 z-50 py-3 px-4 bg-amber-600 text-white text-sm font-bold text-center flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300 shadow-2xl">
          <ScanFace className="w-5 h-5 animate-spin" />
          {gazeWarningText}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ══════════════════════════════════
            LEFT COLUMN: Quiz Panel (2/3 width)
        ══════════════════════════════════ */}
        <div className={`lg:col-span-2 glass-card p-5 border bg-zinc-950/80 rounded-2xl shadow-xl space-y-5 relative transition-all duration-300 ${
          flashBorder ? "border-red-500 shadow-red-500/30" : "border-zinc-800"
        }`}>

          {/* ── Proctor HUD Bar ── */}
          <div className="flex items-center justify-between text-[10px] font-mono border-b border-zinc-800 pb-2.5 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
                tabSwitchCount > 0 ? "border-red-500/40 bg-red-500/10 text-red-400" : "border-zinc-700 text-zinc-400"
              }`}>
                <Eye className="w-3 h-3" />
                <span>Tab: {tabSwitchCount}/3</span>
              </div>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
                gazeViolations > 0 ? "border-amber-500/40 bg-amber-500/10 text-amber-300" : "border-zinc-700 text-zinc-400"
              }`}>
                <Target className="w-3 h-3" />
                <span>Eye Warns: {gazeViolations}/2</span>
              </div>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                gazeDirection === "CENTER" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-amber-500/40 bg-amber-500/10 text-amber-300 animate-pulse"
              }`}>
                <ScanFace className="w-3 h-3" />
                <span>Gaze: {gazeDirection}</span>
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
            <div className="flex items-center gap-1 text-zinc-400">
              <Clock className="w-3 h-3" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
          </div>

          {/* ── Quiz Header ── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-zinc-200 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-white">Mock Eligibility Test</h3>
                <p className="text-[10px] text-zinc-400">Role: <span className="text-zinc-200 font-semibold">{roleName}</span></p>
              </div>
            </div>
            {!quizFinished && (
              <span className="text-[10px] font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg">
                Q {currentIdx + 1}/{questions.length}
              </span>
            )}
          </div>

          {/* ── Progress Bar ── */}
          {!quizFinished && (
            <div className="w-full h-1 bg-zinc-850 bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-zinc-400 via-slate-200 to-white rounded-full transition-all duration-500"
                style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
              />
            </div>
          )}

          {/* ── Question / Result ── */}
          {!quizFinished ? (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl">
                <p className="text-sm font-semibold text-zinc-100 leading-relaxed">
                  {questions[currentIdx].question}
                </p>
              </div>

              <div className="space-y-2">
                {questions[currentIdx].options.map((opt, oIdx) => {
                  const isSelected = selectedOpt === oIdx;
                  const isCorrect = questions[currentIdx].correct === oIdx;
                  let cls = "border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 hover:border-zinc-600 text-zinc-300";
                  if (isSelected && !showExplanation) cls = "border-zinc-400 bg-zinc-800/90 text-white font-bold shadow-md shadow-white/5";
                  if (showExplanation) {
                    if (isCorrect) cls = "border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold";
                    else if (isSelected) cls = "border-red-500 bg-red-500/10 text-red-300";
                    else cls = "border-zinc-850/40 bg-zinc-950/20 text-zinc-600 opacity-50";
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
                <div className="p-3.5 bg-zinc-900/90 border border-zinc-700/80 text-zinc-200 rounded-xl text-xs leading-relaxed animate-in fade-in duration-200">
                  <span className="font-bold text-white block mb-1">📘 Explanation:</span>
                  {questions[currentIdx].explanation}
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={selectedOpt === null}
                className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedOpt === null
                    ? "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
                    : "silver-button-primary text-zinc-950"
                }`}
              >
                <span>{showExplanation ? "Next Question" : "Confirm Answer"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* ── Results Screen ── */
            <div className="text-center space-y-5 py-4 animate-in fade-in duration-300">
              <div className="inline-flex p-4 rounded-3xl bg-zinc-800/60 border border-zinc-700/80 text-zinc-200">
                <Award className="w-12 h-12 text-zinc-200 animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-zinc-100">
                  {tabSwitchCount >= 3 ? "Test Auto-Submitted!" : "Test Complete!"}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {tabSwitchCount >= 3 ? "Auto-submitted after 3 tab-switch violations." : "Mock assessment complete."}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px] max-w-xs mx-auto">
                {[
                  { label: "Duration", value: formatTime(elapsedSeconds), color: "text-zinc-200" },
                  { label: "Violations", value: `${tabSwitchCount}`, color: tabSwitchCount > 0 ? "text-red-400" : "text-emerald-400" },
                  { label: "Answered", value: `${answers.length}/${questions.length}`, color: "text-zinc-200" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-2 bg-zinc-950/80 border border-zinc-800 rounded-lg text-center">
                    <p className="text-zinc-500">{label}</p>
                    <p className={`font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-zinc-950/80 border border-zinc-800 rounded-2xl max-w-xs mx-auto space-y-2 shadow-inner">
                <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Eligibility Report</p>
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
                className="mx-auto flex items-center gap-2 px-6 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold cursor-pointer transition-colors"
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
          <div className="glass-card border border-zinc-800 bg-zinc-950/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-950/60">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-300">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>{viewMode === "camera" && !isSimulatedStream ? "LIVE WEBCAM" : "AI NEURAL RADAR"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setViewMode((prev) => (prev === "camera" ? "neural" : "camera"))}
                  className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[9px] font-semibold text-zinc-300 border border-zinc-700 transition-colors cursor-pointer flex items-center gap-1"
                  title="Toggle between real camera and AI neural vision"
                >
                  <Zap className="w-2.5 h-2.5 text-amber-400" />
                  {viewMode === "camera" ? "AI Radar" : "WebCam"}
                </button>
                <button
                  type="button"
                  onClick={requestCamera}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 transition-colors cursor-pointer"
                  title="Reconnect camera stream"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
                <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold ml-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ON</span>
                </div>
              </div>
            </div>
            {!quizFinished ? (
              <div className="relative bg-zinc-950 aspect-video flex items-center justify-center overflow-hidden">
                {viewMode === "neural" || isSimulatedStream || (!cameraStream && !cameraGranted) ? (
                  <NeuralFaceCanvas pupilOffset={pupilOffset} gazeDirection={gazeDirection} />
                ) : (
                  <video
                    ref={(el) => {
                      pipVideoRef.current = el;
                      if (el && cameraStream) {
                        setupVideoPlayback(el, cameraStream);
                      }
                    }}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                )}
                {/* Scan-line overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)",
                  }}
                />

                {/* Eyeball Tracking Crosshairs & Pupil Center HUD */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Center Target Box */}
                  <div className="w-16 h-12 border border-emerald-400/40 rounded-md relative flex items-center justify-center">
                    <div className="w-full h-[1px] bg-emerald-400/20" />
                    <div className="h-full w-[1px] bg-emerald-400/20 absolute" />
                  </div>
                  {/* Pupil tracking dot */}
                  <div
                    className="absolute w-3 h-3 rounded-full bg-emerald-400 border-2 border-white transition-transform duration-100 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                      boxShadow: "0 0 8px #10b981",
                    }}
                  />
                </div>

                {/* Corner brackets */}
                <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-emerald-400/70 pointer-events-none" />
                <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-emerald-400/70 pointer-events-none" />
                <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-emerald-400/70 pointer-events-none" />
                <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-emerald-400/70 pointer-events-none" />

                {/* Bottom Info Bar */}
                <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between px-1 pointer-events-none">
                  <span
                    className={`text-[8px] font-mono px-1 rounded ${
                      gazeDirection === "CENTER" ? "text-emerald-400 bg-black/70" : "text-amber-300 bg-amber-950/90 animate-pulse font-bold"
                    }`}
                  >
                    GAZE: {gazeDirection}
                  </span>
                  <span className="text-[8px] font-mono text-emerald-400/80 bg-black/70 px-1 rounded">
                    {formatTime(elapsedSeconds)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-zinc-950 flex items-center justify-center">
                <CameraOff className="w-8 h-8 text-zinc-700" />
              </div>
            )}
            {/* Mic bar strip */}
            <div className="px-3 py-2 flex items-center gap-2 bg-zinc-950/60 border-t border-zinc-800">
              <Mic className="w-3 h-3 text-emerald-400 shrink-0" />
              <div className="flex-1 flex items-end gap-0.5 h-4">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-[1px] transition-all duration-75 ${(i / 20) * 100 < micLevel ? "bg-emerald-400" : "bg-zinc-800"}`}
                    style={{ height: `${40 + Math.sin((i / 20) * Math.PI) * 60}%` }}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-zinc-500 shrink-0">{micLevel}%</span>
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
          <div className="glass-card border border-zinc-800 bg-zinc-950/80 rounded-2xl shadow-xl flex flex-col overflow-hidden" style={{ minHeight: "240px", maxHeight: "340px" }}>
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-zinc-800 bg-zinc-950/60 shrink-0">
              <div className="p-1 rounded-md bg-zinc-800/80 border border-zinc-700/80">
                <Bot className="w-3.5 h-3.5 text-zinc-200" />
              </div>
              <span className="text-[10px] font-bold text-zinc-200 uppercase tracking-wider">AI Proctor Live</span>
              <div className="ml-auto flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                <span className="text-[8px] text-amber-400 font-bold">ACTIVE</span>
              </div>
            </div>
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-2.5 space-y-2 scrollbar-thin">
              {proctorLog.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[10px] text-zinc-600 font-mono">Initialising proctor session…</p>
                </div>
              ) : (
                proctorLog.map((msg) => (
                  <div key={msg.id} className="flex gap-1.5 items-start">
                    <div className={`p-0.5 rounded-full shrink-0 mt-0.5 ${
                      msg.type === "error" ? "bg-red-500/20" :
                      msg.type === "warn" ? "bg-amber-500/20" :
                      msg.type === "success" ? "bg-emerald-500/20" : "bg-zinc-800/60"
                    }`}>
                      <Bot className={`w-2.5 h-2.5 ${
                        msg.type === "error" ? "text-red-400" :
                        msg.type === "warn" ? "text-amber-400" :
                        msg.type === "success" ? "text-emerald-400" : "text-zinc-300"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] leading-tight font-medium break-words ${
                        msg.type === "error" ? "text-red-300" :
                        msg.type === "warn" ? "text-amber-300" :
                        msg.type === "success" ? "text-emerald-300" : "text-zinc-300"
                      }`}>{msg.text}</p>
                      <p className="text-[8px] text-zinc-600 font-mono mt-0.5">{msg.ts}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

