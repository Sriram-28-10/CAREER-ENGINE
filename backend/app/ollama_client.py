"""
ollama_client.py
AI backend client — uses Google Gemini API (free tier) with Ollama local fallback.
Provides health check, career chat, resume analysis, interview scoring, and resume parsing.
Team SCORPIUS — v3.0
"""

import json
import os
import re
import urllib.request
import urllib.error
from typing import Optional, List

# ─────────────────────────────────────────────────────────────────
# Configuration — Gemini (primary) and Ollama (fallback)
# ─────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-3.6-flash"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

OLLAMA_BASE = "http://localhost:11434"
PREFERRED_MODELS = ["llama3.2", "llama3", "mistral", "llama2", "phi3"]

# ─────────────────────────────────────────────────────────────────
# Low-level HTTP helpers
# ─────────────────────────────────────────────────────────────────

def _http_get(url: str, timeout: int = 3) -> Optional[dict]:
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode())
    except Exception:
        return None


def _http_post(url: str, payload: dict, timeout: int = 30, headers: dict = None) -> Optional[str]:
    try:
        data = json.dumps(payload).encode()
        hdrs = {"Content-Type": "application/json"}
        if headers:
            hdrs.update(headers)
        req = urllib.request.Request(url, data=data, headers=hdrs, method="POST")
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode()
    except Exception as e:
        print(f"HTTP POST error: {e}")
        return None


# ─────────────────────────────────────────────────────────────────
# Gemini API
# ─────────────────────────────────────────────────────────────────

def _gemini_generate(prompt: str, system: str = "", timeout: int = 45) -> Optional[str]:
    """Call Google Gemini API and return the text response."""
    if not GEMINI_API_KEY:
        return None

    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"

    contents = []
    if system:
        contents.append({
            "role": "user",
            "parts": [{"text": f"[System Instructions]: {system}"}]
        })
        contents.append({
            "role": "model",
            "parts": [{"text": "Understood. I will follow these instructions."}]
        })
    contents.append({
        "role": "user",
        "parts": [{"text": prompt}]
    })

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 800,
        }
    }

    raw = _http_post(url, payload, timeout=timeout)
    if not raw:
        return None

    try:
        data = json.loads(raw)
        candidates = data.get("candidates", [])
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            if parts:
                return parts[0].get("text", "").strip()
    except Exception as e:
        print(f"Gemini parse error: {e}")
    return None


# ─────────────────────────────────────────────────────────────────
# Ollama local fallback
# ─────────────────────────────────────────────────────────────────

def _ollama_get_model() -> Optional[str]:
    """Return the first available Ollama model, or None if offline."""
    info = _http_get(f"{OLLAMA_BASE}/api/tags", timeout=3)
    if not info:
        return None
    models = [m.get("name", "") for m in info.get("models", [])]
    for preferred in PREFERRED_MODELS:
        for m in models:
            if preferred in m.lower():
                return m
    return models[0] if models else None


def _ollama_generate(prompt: str, system: str = "", timeout: int = 45) -> Optional[str]:
    """Send a prompt to local Ollama and return the text response."""
    model = _ollama_get_model()
    if model is None:
        return None

    full_prompt = f"{system}\n\n{prompt}" if system else prompt
    payload = {
        "model": model,
        "prompt": full_prompt,
        "stream": True,
        "options": {"temperature": 0.7, "num_predict": 400},
    }
    raw = _http_post(f"{OLLAMA_BASE}/api/generate", payload, timeout=timeout)
    if not raw:
        return None

    full_text = ""
    for line in raw.strip().splitlines():
        try:
            obj = json.loads(line)
            full_text += obj.get("response", "")
        except Exception:
            pass
    return full_text.strip() or None


# ─────────────────────────────────────────────────────────────────
# Unified generate — tries Gemini first, then Ollama
# ─────────────────────────────────────────────────────────────────

def generate(prompt: str, system: str = "", timeout: int = 45) -> Optional[str]:
    """
    Try Gemini cloud API first. If unavailable, fall back to local Ollama.
    Returns None if both are unavailable.
    """
    # Try Gemini first
    result = _gemini_generate(prompt, system=system, timeout=timeout)
    if result:
        return result

    # Fallback to Ollama
    return _ollama_generate(prompt, system=system, timeout=timeout)


# ─────────────────────────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────────────────────────

def health_check() -> dict:
    """Returns {'available': bool, 'model': str | None, 'provider': str}."""
    # Check Gemini
    if GEMINI_API_KEY:
        test = _gemini_generate("Say OK", timeout=10)
        if test:
            return {"available": True, "model": GEMINI_MODEL, "provider": "Google Gemini"}

    # Check Ollama
    model = _ollama_get_model()
    if model:
        return {"available": True, "model": model, "provider": "Ollama (local)"}

    return {"available": False, "model": None, "provider": "none"}


# ─────────────────────────────────────────────────────────────────
# Career chatbot
# ─────────────────────────────────────────────────────────────────

def generate_career_response(
    user_message: str,
    role_name: str,
    readiness_pct: float,
    context: str = "",
) -> Optional[str]:
    """Generate a career-guidance chatbot response."""
    system = (
        "You are SCORPIUS AI, an expert career readiness assistant. "
        "You help students understand their skill gaps, prepare for interviews, "
        "and improve their career readiness scores. "
        "Keep responses concise (3-5 sentences), practical, and encouraging. "
        "Use simple markdown formatting (bold, bullet points)."
    )
    prompt = (
        f"Student is targeting: {role_name}\n"
        f"Current readiness score: {readiness_pct:.1f}%\n"
        f"{('Context: ' + context) if context else ''}\n\n"
        f"Student question: {user_message}\n\n"
        "Provide a helpful, specific response:"
    )
    return generate(prompt, system=system, timeout=40)


# ─────────────────────────────────────────────────────────────────
# Resume analysis
# ─────────────────────────────────────────────────────────────────

def analyze_resume_text(resume_text: str, role_name: str) -> Optional[str]:
    """Provide detailed resume analysis and suggestions."""
    system = (
        "You are an expert technical recruiter and career coach. "
        "Analyze resumes and provide structured, actionable feedback. "
        "Format your response with clear sections."
    )
    prompt = (
        f"Analyze this resume for a {role_name} position and provide:\n"
        "1. **Strengths** (2-3 key points)\n"
        "2. **Skill Gaps** (specific missing skills for the role)\n"
        "3. **Recommendations** (3 specific actions to improve)\n"
        "4. **Overall Rating** (score out of 10 with brief justification)\n\n"
        f"Resume:\n{resume_text[:2000]}\n\n"
        "Provide structured analysis:"
    )
    return generate(prompt, system=system, timeout=50)


# ─────────────────────────────────────────────────────────────────
# Interview answer scoring
# ─────────────────────────────────────────────────────────────────

def score_interview_answer(question: str, answer: str, role_name: str) -> Optional[dict]:
    """
    Score an interview answer and return score + feedback.
    Returns dict with 'score' (0-10) and 'feedback' (string), or None.
    """
    system = (
        "You are a technical interviewer evaluating candidates. "
        "Score answers on a scale of 0-10 and provide specific, constructive feedback. "
        "Always respond in this exact JSON format: "
        '{"score": <number 0-10>, "feedback": "<2-3 sentence feedback>", "strengths": "<what was good>", "improvements": "<what to improve>"}'
    )
    prompt = (
        f"Role: {role_name}\n"
        f"Interview Question: {question}\n"
        f"Candidate Answer: {answer}\n\n"
        "Evaluate this answer and respond with JSON only:"
    )
    raw = generate(prompt, system=system, timeout=45)
    if not raw:
        return None
    try:
        json_match = re.search(r'\{[^{}]*\}', raw, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return json.loads(raw)
    except Exception:
        score_match = re.search(r'"score"[:\s]+(\d+)', raw)
        feedback_match = re.search(r'"feedback"[:\s]+"([^"]+)"', raw)
        if score_match:
            return {
                "score": int(score_match.group(1)),
                "feedback": feedback_match.group(1) if feedback_match else raw[:200],
                "strengths": "Good attempt",
                "improvements": "Review the core concepts",
            }
        return None


# ─────────────────────────────────────────────────────────────────
# AI resume scoring for readiness engine
# ─────────────────────────────────────────────────────────────────

def ai_parse_resume_for_scoring(resume_text: str, role_name: str, skill_names: List[str]) -> Optional[dict]:
    """
    Use AI to evaluate a resume against required skill names.
    Returns a dict with skill scores (0-100), project_complexity, relevance, and certifications.
    """
    skills_json_template = ", ".join([f'"{s}": <score 0-100>' for s in skill_names])
    system = (
        "You are a technical recruiting system. Evaluate the candidate's resume content "
        "and score their experience level (0 to 100) for each of the requested skills. "
        "Also assess project complexity (0-100), relevance to the role (0-100), and list "
        "any certifications found. "
        "Respond ONLY with a valid JSON block, using this exact structure:\n"
        "{\n"
        f'  "skills": {{{skills_json_template}}},\n'
        '  "project_complexity": <number 0-100>,\n'
        '  "relevance": <number 0-100>,\n'
        '  "certifications": ["cert1", "cert2"]\n'
        "}"
    )
    prompt = (
        f"Role Name: {role_name}\n"
        f"Evaluate this resume for the following skills: {', '.join(skill_names)}\n\n"
        f"Resume:\n{resume_text[:2500]}\n\n"
        "Respond with the JSON object only:"
    )
    raw = generate(prompt, system=system, timeout=40)
    if not raw:
        return None
    try:
        # Try to find a JSON block — handle nested "skills" object
        # Use a more permissive regex that handles nested braces
        json_match = re.search(r'\{.*\}', raw, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return json.loads(raw)
    except Exception as e:
        print(f"Error parsing AI resume evaluation JSON: {e}")
        return None


def generate_readiness_feedback(
    resume_text: str,
    role_name: str,
    skill_names: List[str],
    overall_readiness_pct: Optional[float] = None,
    matched_count: Optional[int] = None,
    total_count: Optional[int] = None
) -> dict:
    """
    Use AI (Gemini) to analyze a candidate's resume and generate qualitative, constructive feedback
    tailored to a targeted role. Synchronizes summary counts with calculated twin metrics.
    Returns a dictionary with status, summary, and contextual breakdown feedback.
    """
    # 1. Guard against empty/unuploaded resumes immediately
    if not resume_text or not resume_text.strip() or resume_text.strip().lower() == "no resume uploaded":
        return {
            "overall_status": "Pending Upload",
            "overall_summary": f"Upload your resume above to receive dynamic, AI-driven career twin feedback for {role_name}.",
            "technical_feedback": "Upload a resume to analyze your engineering principles and core developer logic.",
            "practical_feedback": "Hands-on projects and GitHub claims will be extracted upon resume upload.",
            "certification_feedback": "Accreditations, courses, and certifications will be verified upon resume upload."
        }

    tot = total_count if total_count is not None else len(skill_names)
    pct = round(overall_readiness_pct) if overall_readiness_pct is not None else 65

    # Smart keyword parsing for fallback
    text_lower = resume_text.lower() if resume_text else ""
    detected_matches = 0
    for s in skill_names:
        parts = [p.strip().lower() for p in re.split(r'[&/\s]+', s) if len(p.strip()) > 2]
        if any(p in text_lower for p in parts):
            detected_matches += 1

    cnt = matched_count if matched_count is not None else min(detected_matches, tot)

    # Determine status label
    if pct >= 80 or (tot > 0 and cnt / tot >= 0.8):
        status = "Industry Ready"
    elif pct >= 55 or (tot > 0 and cnt / tot >= 0.4):
        status = "Developing"
    else:
        status = "Gaps Identified"

    system = (
        "You are an expert technical recruiter. Analyze the candidate's resume text and "
        "provide constructive, contextual feedback for their targeted job role. "
        "Ensure the feedback is specific, professional, and addresses their projects, "
        "skills, and gaps contextually. "
        "Always respond ONLY with a valid JSON block, using this exact structure:\n"
        "{\n"
        f'  "overall_status": "{status}",\n'
        f'  "overall_summary": "Your resume satisfies {cnt} out of {tot} key requirements for {role_name}.",\n'
        '  "technical_feedback": "<Contextual comment highlighting strengths/gaps in technical competency/logic based on their resume skills>",\n'
        '  "practical_feedback": "<Contextual comment evaluating their projects, hands-on claims, or developer work>",\n'
        '  "certification_feedback": "<Contextual comment on certifications, course verification, or missing credentials>"\n'
        "}"
    )

    prompt = (
        f"Target Role: {role_name}\n"
        f"Required Core Skills: {', '.join(skill_names)}\n\n"
        f"Resume Content:\n{resume_text[:2500]}\n\n"
        "Analyze the projects, learned skills, and certs in this resume, and return the JSON object only:"
    )

    raw = generate(prompt, system=system, timeout=40)
    if raw:
        try:
            json_match = re.search(r'\{.*\}', raw, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
                keys = ["overall_status", "overall_summary", "technical_feedback", "practical_feedback", "certification_feedback"]
                if all(k in result for k in keys):
                    # Guarantee overall_summary matches exact ready count & role
                    result["overall_summary"] = f"Your resume satisfies {cnt} out of {tot} key requirements for {role_name}."
                    result["overall_status"] = status
                    return result
        except Exception as e:
            print(f"Error parsing AI readiness feedback JSON: {e}")

    # Offline / fallback rule-based logic
    matched_skills = [s for s in skill_names if any(p.strip().lower() in text_lower for p in re.split(r'[&/\s]+', s) if len(p.strip()) > 2)]
    missing_skills = [s for s in skill_names if s not in matched_skills]

    tech_msg = f"Your resume highlights technical skills in {', '.join(matched_skills[:2]) if matched_skills else 'general engineering'}."
    if missing_skills:
        tech_msg += f" To improve, consider focusing on core logic concepts in {missing_skills[0]}."

    practical_msg = "Your projects show practical application."
    project_keywords = ["project", "github", "build", "develop", "system", "app"]
    found_projects = [w for w in project_keywords if w in text_lower]
    if len(found_projects) >= 2:
        practical_msg = "Your projects demonstrate strong hands-on implementation details. Consider adding cloud deployment or containerization experience."
    else:
        practical_msg = "Consider adding 1-2 detailed project descriptions showing how you apply your skills in real-world scenarios."

    cert_msg = "No specific accreditations detected in the text."
    if any(k in text_lower for k in ["cert", "license", "course", "degree", "certified"]):
        cert_msg = "We verified online courses/certifications in your profile. Consider aiming for recognized industry-standard certifications next."

    return {
        "overall_status": status,
        "overall_summary": f"Your resume satisfies {cnt} out of {tot} key requirements for {role_name}.",
        "technical_feedback": tech_msg,
        "practical_feedback": practical_msg,
        "certification_feedback": cert_msg
    }

