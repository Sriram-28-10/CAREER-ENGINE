"""
main.py
FastAPI entry point for Career Engine Backend API.
Career Engine — v3.0 with Gemini AI, Interview Module, and Role Architecture.
"""

import os
from dotenv import load_dotenv
load_dotenv()  # Load .env before anything else

import io
import zipfile
import xml.etree.ElementTree as ET
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.skill_proof import SkillEvidence, calculate_skill_confidence, batch_calculate_confidence
from app.readiness_twin import TARGET_ROLES, analyze_readiness
from app.minimum_path import calculate_minimum_path
from app.counterfactual import simulate_counterfactual
from app.ollama_client import (
    health_check as ollama_health,
    generate_career_response,
    analyze_resume_text,
    score_interview_answer as ollama_score,
    ai_parse_resume_for_scoring,
    generate_readiness_feedback,
)
from app.interview import get_questions, get_all_questions, keyword_score_answer

app = FastAPI(
    title="Career Engine API v2.0",
    description="Skill Confidence Scoring, Job Blockers, ROI Paths, Counterfactual, Ollama LLM, Interview Module — Career Engine",
    version="2.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────
# Default Candidate Baseline Skills (Evidence-backed)
# ─────────────────────────────────────────────────────────────────
DEFAULT_EVIDENCE_MAP: Dict[str, Dict[str, float]] = {
    "Python & Pandas": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "SQL Querying": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "Power BI / Tableau": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "Data Cleaning & EDA": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "Statistical Analysis": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "Certified Data Associate": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "Python & Machine Learning": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "Statistical Modeling & Math": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "SQL & Data Wrangling": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "Deep Learning & PyTorch/TF": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "Model Evaluation & MLOps": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "Data Science Professional Cert": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "HTML5 & CSS3 Styling": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "JavaScript ES6+": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "Responsive & Mobile Design": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "DOM Manipulation & Web APIs": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "Git Version Control": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "Web Development Specialist Cert": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "React & Frontend Frameworks": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "Node.js & Express / Python API": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "Database Architecture (SQL/NoSQL)": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "REST API & GraphQL Integration": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "Docker & CI/CD Pipelines": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
    "Full Stack Engineering Cert": {"resume_claim": 0.0, "github_evidence": 0.0, "certificate_score": 0.0, "assessment_score": 0.0},
}

# ─────────────────────────────────────────────────────────────────
# Curated Learning Resources
# ─────────────────────────────────────────────────────────────────
LEARNING_RESOURCES: Dict[str, Dict[str, Any]] = {
    "SQL Querying": {
        "platforms": [
            {"name": "Coursera: SQL for Data Science", "url": "https://www.coursera.org/learn/sql-for-data-science", "provider": "Coursera / UC Davis", "rating": 4.8},
            {"name": "DataCamp: Intermediate SQL", "url": "https://www.datacamp.com/courses/intermediate-sql", "provider": "DataCamp", "rating": 4.7},
        ],
        "docs": [
            {"name": "PostgreSQL Official Documentation", "url": "https://www.postgresql.org/docs/", "type": "Documentation"},
            {"name": "W3Schools SQL Tutorial", "url": "https://www.w3schools.com/sql/", "type": "Interactive Guide"},
        ],
        "youtube": [
            {"title": "SQL Tutorial - Full Database Course for Beginners", "url": "https://www.youtube.com/watch?v=HXV3zeQKqGY", "channel": "freeCodeCamp.org", "duration": "4:20:00"},
        ]
    },
    "Python & Machine Learning": {
        "platforms": [
            {"name": "Machine Learning Specialization", "url": "https://www.coursera.org/specializations/machine-learning-introduction", "provider": "Coursera / Andrew Ng", "rating": 4.9},
        ],
        "docs": [
            {"name": "Scikit-Learn User Guide", "url": "https://scikit-learn.org/stable/user_guide.html", "type": "Official Docs"},
        ],
        "youtube": [
            {"title": "Python for Data Science & Machine Learning", "url": "https://www.youtube.com/watch?v=LHBE6Q9XlzI", "channel": "freeCodeCamp.org", "duration": "12:00:00"},
        ]
    },
    "React & Frontend Frameworks": {
        "platforms": [
            {"name": "Meta Front-End Developer Professional Certificate", "url": "https://www.coursera.org/professional-certificates/meta-front-end-developer", "provider": "Coursera / Meta", "rating": 4.8},
        ],
        "docs": [
            {"name": "React Official Documentation", "url": "https://react.dev/", "type": "Official Docs"},
        ],
        "youtube": [
            {"title": "React Course 2024 - Beginner to Advanced", "url": "https://www.youtube.com/watch?v=bMknfKXIFA8", "channel": "freeCodeCamp.org", "duration": "11:55:00"},
        ]
    },
}

# ─────────────────────────────────────────────────────────────────
# Pydantic Models
# ─────────────────────────────────────────────────────────────────
class ChatbotRequest(BaseModel):
    user_message: str
    role_id: Optional[str] = "data_analyst_intern"
    readiness_pct: Optional[float] = 63.5

class AnalysisRequest(BaseModel):
    role_id: str = "data_analyst_intern"
    custom_evidence: Optional[Dict[str, Dict[str, float]]] = None
    resume_text: Optional[str] = None  # Raw resume text for AI feedback generation

class CounterfactualRequest(BaseModel):
    role_id: str = "data_analyst_intern"
    candidate_skills: Optional[Dict[str, float]] = None
    hypothetical_boosts: Dict[str, float]

class InterviewScoreRequest(BaseModel):
    question_id: int
    question: str
    answer: str
    role_id: str = "data_analyst_intern"
    ideal_keywords: Optional[List[str]] = []

class OllamaAnalyzeRequest(BaseModel):
    resume_text: str
    role_id: str = "data_analyst_intern"


def get_candidate_confidence_scores(evidence_map: Dict[str, Dict[str, float]]) -> Dict[str, float]:
    return batch_calculate_confidence(evidence_map)

# ─────────────────────────────────────────────────────────────────
# Root & Health
# ─────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Career Engine API v2.0", "version": "2.0.0"}

@app.get("/api/health")
def health():
    """Returns backend + Ollama health status."""
    ollama_status = ollama_health()
    return {
        "backend": "online",
        "ollama": ollama_status,
        "team": "Career Engine"
    }

# ─────────────────────────────────────────────────────────────────
# Roles & Analysis (existing)
# ─────────────────────────────────────────────────────────────────
@app.get("/api/roles")
def list_roles():
    return [
        {"role_id": r.role_id, "role_name": r.role_name, "description": r.description}
        for r in TARGET_ROLES.values()
    ]

@app.get("/api/resources")
def get_resources(skill_name: Optional[str] = None):
    if skill_name and skill_name in LEARNING_RESOURCES:
        return {skill_name: LEARNING_RESOURCES[skill_name]}
    return LEARNING_RESOURCES

@app.post("/api/analyze")
def analyze(req: AnalysisRequest):
    evidence = req.custom_evidence if req.custom_evidence else DEFAULT_EVIDENCE_MAP
    confidence_scores = get_candidate_confidence_scores(evidence)
    twin_analysis = analyze_readiness(confidence_scores, req.role_id)
    min_path = calculate_minimum_path(twin_analysis, target_readiness_pct=85.0)

    # Generate qualitative AI readiness feedback
    role = TARGET_ROLES.get(req.role_id, TARGET_ROLES["data_analyst_intern"])
    skill_names = [r.skill_name for r in role.requirements]
    all_skills = twin_analysis.get("all_skills", [])
    ready_count = len([s for s in all_skills if not s.get("is_blocker", False)])
    total_count = len(all_skills)

    readiness_feedback = generate_readiness_feedback(
        resume_text=req.resume_text or "",
        role_name=role.role_name,
        skill_names=skill_names,
        overall_readiness_pct=twin_analysis.get("overall_readiness_pct", 65.0),
        matched_count=ready_count,
        total_count=total_count
    )

    return {
        "evidence_used": evidence,
        "confidence_scores": confidence_scores,
        "analysis": twin_analysis,
        "minimum_path": min_path,
        "readiness_feedback": readiness_feedback,
        "team": "Career Engine"
    }

@app.post("/api/counterfactual")
def counterfactual(req: CounterfactualRequest):
    if not req.candidate_skills:
        confidence_scores = get_candidate_confidence_scores(DEFAULT_EVIDENCE_MAP)
    else:
        confidence_scores = req.candidate_skills
    result = simulate_counterfactual(
        baseline_skills=confidence_scores,
        role_id=req.role_id,
        hypothetical_boosts=req.hypothetical_boosts
    )
    result["team"] = "Career Engine"
    return result

def extract_resume_text_from_bytes(filename: str, content: bytes) -> str:
    """
    Extract readable plain text from uploaded DOCX, PDF, or TXT resume files.
    Prevents binary/XML ZIP payloads from breaking LLM analysis.
    """
    fn_lower = (filename or "").lower()

    # 1. DOCX File Extraction (Native ZIP / XML parsing)
    if fn_lower.endswith(".docx") or content.startswith(b"PK"):
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as z:
                xml_content = z.read("word/document.xml")
                tree = ET.fromstring(xml_content)
                texts = [node.text for node in tree.iter() if node.tag.endswith("}t") and node.text]
                if texts:
                    return "\n".join(texts)
        except Exception as e:
            print(f"Native docx ZIP extraction error: {e}")

    # 2. PDF File Extraction
    if fn_lower.endswith(".pdf") or content.startswith(b"%PDF"):
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content))
            pages = [page.extract_text() for page in reader.pages if page.extract_text()]
            if pages:
                return "\n".join(pages)
        except Exception as e:
            print(f"pypdf extraction error: {e}")

    # 3. Plain Text / TXT / Fallback
    try:
        raw = content.decode("utf-8", errors="ignore")
        return raw.replace("\x00", "")
    except Exception:
        return ""

@app.post("/api/upload_resume")
async def upload_resume(
    file: UploadFile = File(...),
    role_id: str = Form("data_analyst_intern")
):
    content = await file.read()
    raw_text = extract_resume_text_from_bytes(file.filename or "", content)
    text_content = raw_text.lower()

    role = TARGET_ROLES.get(role_id, TARGET_ROLES["data_analyst_intern"])
    skill_names = [req.skill_name for req in role.requirements]

    updated_evidence = dict(DEFAULT_EVIDENCE_MAP)
    detected_skills = []
    ai_parsed = False

    # Try AI-powered resume reader first
    try:
        ai_result = ai_parse_resume_for_scoring(raw_text, role.role_name, skill_names)
        if ai_result and "skills" in ai_result:
            ai_skills = ai_result.get("skills", {})
            project_complexity = float(ai_result.get("project_complexity", 70.0))
            relevance = float(ai_result.get("relevance", 70.0))
            certs = ai_result.get("certifications", [])

            for skill_name in skill_names:
                # Get the AI-graded score for this skill, defaulting to 45.0 if not found
                ai_score = float(ai_skills.get(skill_name, 45.0))
                if ai_score > 50.0:
                    detected_skills.append(skill_name)

                # Cert matching logic
                cert_score = 0.0
                skill_lower = skill_name.lower()
                for cert in certs:
                    if cert.lower() in skill_lower or skill_lower in cert.lower():
                        cert_score = 90.0
                        break

                if "cert" in skill_lower and any(c in text_content for c in ["certified", "certificate", "certification"]):
                    cert_score = max(cert_score, 80.0)

                updated_evidence[skill_name] = {
                    "resume_claim": ai_score,
                    "github_evidence": project_complexity,
                    "certificate_score": cert_score,
                    "assessment_score": round(ai_score * (relevance / 100.0), 1)
                }
            ai_parsed = True
    except Exception as e:
        print(f"Ollama AI resume parser error: {e}")

    # Fallback to rule-based keyword map if AI parsing was unsuccessful
    if not ai_parsed:
        keywords_map = {
            "Python & Machine Learning": ["python", "machine learning", "scikit-learn", "xgboost"],
            "Statistical Modeling & Math": ["statistical modeling", "math", "hypothesis"],
            "SQL & Data Wrangling": ["sql", "data wrangling", "postgresql"],
            "Deep Learning & PyTorch/TF": ["deep learning", "pytorch", "tensorflow"],
            "Model Evaluation & MLOps": ["mlops", "model evaluation", "docker"],
            "HTML5 & CSS3 Styling": ["html5", "css3", "flexbox", "grid"],
            "JavaScript ES6+": ["javascript", "es6", "async/await"],
            "Responsive & Mobile Design": ["responsive design", "mobile first"],
            "DOM Manipulation & Web APIs": ["dom manipulation", "fetch api", "axios"],
            "Git Version Control": ["git", "github", "version control"],
            "React & Frontend Frameworks": ["react", "next.js", "frontend framework"],
            "Node.js & Express / Python API": ["node.js", "express", "fastapi"],
            "Database Architecture (SQL/NoSQL)": ["mongodb", "postgresql", "sql"],
            "REST API & GraphQL Integration": ["rest api", "graphql"],
            "Docker & CI/CD Pipelines": ["docker", "ci/cd", "github actions"],
            "Python & Pandas": ["python", "pandas"],
            "SQL Querying": ["sql", "queries"],
            "Power BI / Tableau": ["power bi", "tableau"],
            "Data Cleaning & EDA": ["data cleaning", "eda"],
            "Statistical Analysis": ["statistics", "regression"],
        }

        for skill_name, keywords in keywords_map.items():
            count = sum(text_content.count(kw) for kw in keywords)
            if count > 0:
                detected_skills.append(skill_name)
                ev = dict(updated_evidence.get(skill_name, {"resume_claim": 50.0, "github_evidence": 40.0, "certificate_score": 30.0, "assessment_score": 50.0}))
                ev["resume_claim"] = min(100.0, ev["resume_claim"] + min(count * 15.0, 35.0))
                ev["github_evidence"] = min(100.0, ev["github_evidence"] + min(count * 12.0, 30.0))
                ev["assessment_score"] = min(100.0, ev["assessment_score"] + min(count * 10.0, 25.0))
                if "certifi" in text_content or "licensed" in text_content:
                    ev["certificate_score"] = min(100.0, ev["certificate_score"] + 30.0)
                updated_evidence[skill_name] = ev

    confidence_scores = get_candidate_confidence_scores(updated_evidence)
    twin_analysis = analyze_readiness(confidence_scores, role_id)
    min_path = calculate_minimum_path(twin_analysis, target_readiness_pct=85.0)

    # Optional LLM qualitative analysis feedback (short summary)
    llm_analysis = None
    try:
        llm_analysis = analyze_resume_text(raw_text, role.role_name)
    except Exception:
        pass

    # AI-driven contextual readiness feedback (replaces numeric domain scores in UI)
    all_skills = twin_analysis.get("all_skills", [])
    ready_count = len([s for s in all_skills if not s.get("is_blocker", False)])
    total_count = len(all_skills)

    readiness_feedback = generate_readiness_feedback(
        resume_text=raw_text,
        role_name=role.role_name,
        skill_names=skill_names,
        overall_readiness_pct=twin_analysis.get("overall_readiness_pct", 65.0),
        matched_count=ready_count,
        total_count=total_count
    )

    return {
        "filename": file.filename,
        "detected_skills": detected_skills,
        "evidence_used": updated_evidence,
        "confidence_scores": confidence_scores,
        "analysis": twin_analysis,
        "minimum_path": min_path,
        "llm_analysis": llm_analysis,
        "ai_parsed": ai_parsed,
        "readiness_feedback": readiness_feedback,
        "resume_text": raw_text,
        "team": "Career Engine"
    }


# ─────────────────────────────────────────────────────────────────
# Chatbot — Ollama-first, rule-based fallback
# ─────────────────────────────────────────────────────────────────
@app.post("/api/chatbot")
def chatbot_reply(req: ChatbotRequest):
    role_name = req.role_id.replace("_", " ").title() if req.role_id else "Target Role"

    # Try Ollama first
    ollama_reply = generate_career_response(
        user_message=req.user_message,
        role_name=role_name,
        readiness_pct=req.readiness_pct or 63.5,
    )
    if ollama_reply:
        return {"reply": ollama_reply, "role_id": req.role_id, "powered_by": "ollama", "team": "Career Engine"}

    # Rule-based fallback
    msg = req.user_message.lower().strip()
    if any(g in msg for g in ["hello", "hi", "hey", "greetings"]):
        reply = f"Hello! 👋 I'm your **Career Engine AI Assistant**. Ask me anything about improving your career readiness for **{role_name}** today!"
    elif any(x in msg for x in ["blocker", "gap", "red", "overcome"]):
        reply = f"🔴 **Job Blockers** are skills below the required threshold for **{role_name}**. Check the Overcome Blockers widget and complete the Mock Eligibility Test for score updates!"
    elif any(x in msg for x in ["resume", "builder", "create resume"]):
        reply = "📄 Use our **AI Resume Builder** tab! Fill in your details and sync it to update your Career Engine score."
    elif any(x in msg for x in ["quiz", "test", "mock", "interview"]):
        reply = f"📝 Check the **Interview Prep** page for role-specific Q&A with AI scoring for **{role_name}**!"
    elif "sql" in msg:
        reply = "🗄️ **SQL** key concepts: SELECT/JOIN/GROUP BY/HAVING, Window Functions, Subqueries, and Indexing."
    elif "python" in msg:
        reply = "🐍 **Python** path: Master Pandas, NumPy, then Scikit-Learn for ML. Check the Resource Suggestions widget!"
    elif any(x in msg for x in ["react", "nextjs", "frontend"]):
        reply = "⚛️ Focus on **React Hooks**, **Next.js App Router**, and **TypeScript** for modern frontend roles."
    else:
        reply = f"For **{role_name}**, focus on closing your highest ROI skill gap first! Check the Minimum Path to Job widget for a personalized roadmap."

    return {"reply": reply, "role_id": req.role_id, "powered_by": "rule-based", "team": "Career Engine"}

# ─────────────────────────────────────────────────────────────────
# Ollama Endpoints
# ─────────────────────────────────────────────────────────────────
@app.get("/api/ollama/health")
def check_ollama():
    """Check if Ollama is available and which model is loaded."""
    return ollama_health()

@app.post("/api/ollama/analyze_resume")
def llm_analyze_resume(req: OllamaAnalyzeRequest):
    """Use Ollama LLM to analyze resume text and return structured feedback."""
    role_name = TARGET_ROLES.get(req.role_id, TARGET_ROLES["data_analyst_intern"]).role_name
    result = analyze_resume_text(req.resume_text, role_name)
    if result:
        return {"analysis": result, "powered_by": "ollama", "role": role_name}
    return {"analysis": None, "powered_by": "unavailable", "message": "Ollama is not running. Start Ollama for AI-powered resume analysis."}

# ─────────────────────────────────────────────────────────────────
# Interview Module
# ─────────────────────────────────────────────────────────────────
@app.get("/api/interview/questions")
def interview_questions(role_id: str = "data_analyst_intern", question_type: str = "technical"):
    """
    Returns interview questions for the given role and type.
    question_type: 'technical' | 'behavioral' | 'hr' | 'all'
    """
    if question_type == "all":
        questions = get_all_questions(role_id)
    else:
        questions = get_questions(role_id, question_type)

    role_name = TARGET_ROLES.get(role_id, TARGET_ROLES["data_analyst_intern"]).role_name
    return {
        "role_id": role_id,
        "role_name": role_name,
        "question_type": question_type,
        "questions": questions,
        "count": len(questions),
    }

@app.post("/api/interview/score")
def score_interview(req: InterviewScoreRequest):
    """
    Score an interview answer using Ollama (or keyword fallback).
    Returns score (0-10), feedback, strengths, and improvements.
    """
    role_name = TARGET_ROLES.get(req.role_id, TARGET_ROLES["data_analyst_intern"]).role_name

    if not req.answer or not req.answer.strip():
        return {
            "score": 0,
            "feedback": "No answer provided. Please type your response before submitting.",
            "strengths": "N/A",
            "improvements": "Provide a detailed answer.",
            "powered_by": "validation",
        }

    # Try Ollama scoring first
    ollama_result = ollama_score(
        question=req.question,
        answer=req.answer,
        role_name=role_name
    )
    if ollama_result:
        ollama_result["powered_by"] = "ollama"
        return ollama_result

    # Keyword-based fallback
    result = keyword_score_answer(req.answer, req.ideal_keywords or [])
    return result
