"""
readiness_twin.py
Compares candidate skill confidence levels against target job role requirements
to identify 🔴 Job Blockers and return an overall Readiness Score percentage,
broken down into Technical, Practical, and Certification indicators.
"""

from typing import Dict, List, Any
from pydantic import BaseModel

class SkillRequirement(BaseModel):
    skill_name: str
    required_level: float  # 0-100%
    category: str          # "Technical", "Practical", "Certification"
    learning_effort_hours: float = 10.0 # Estimated effort to close a gap

class TargetRole(BaseModel):
    role_id: str
    role_name: str
    description: str
    requirements: List[SkillRequirement]

# Pre-configured target job roles
TARGET_ROLES: Dict[str, TargetRole] = {
    "data_analyst_intern": TargetRole(
        role_id="data_analyst_intern",
        role_name="Data Analyst Intern",
        description="Analyzes datasets, builds dashboards, and queries relational databases.",
        requirements=[
            SkillRequirement(skill_name="Python & Pandas", required_level=75.0, category="Technical", learning_effort_hours=15.0),
            SkillRequirement(skill_name="SQL Querying", required_level=80.0, category="Technical", learning_effort_hours=12.0),
            SkillRequirement(skill_name="Power BI / Tableau", required_level=70.0, category="Practical", learning_effort_hours=15.0),
            SkillRequirement(skill_name="Data Cleaning & EDA", required_level=75.0, category="Practical", learning_effort_hours=10.0),
            SkillRequirement(skill_name="Statistical Analysis", required_level=65.0, category="Technical", learning_effort_hours=14.0),
            SkillRequirement(skill_name="Certified Data Associate", required_level=60.0, category="Certification", learning_effort_hours=20.0),
        ]
    ),
    "data_scientist": TargetRole(
        role_id="data_scientist",
        role_name="Data Scientist",
        description="Builds predictive models, applies machine learning, and extracts insights from complex data.",
        requirements=[
            SkillRequirement(skill_name="Python & Machine Learning", required_level=85.0, category="Technical", learning_effort_hours=20.0),
            SkillRequirement(skill_name="Statistical Modeling & Math", required_level=80.0, category="Technical", learning_effort_hours=18.0),
            SkillRequirement(skill_name="SQL & Data Wrangling", required_level=80.0, category="Technical", learning_effort_hours=12.0),
            SkillRequirement(skill_name="Deep Learning & PyTorch/TF", required_level=75.0, category="Practical", learning_effort_hours=25.0),
            SkillRequirement(skill_name="Model Evaluation & MLOps", required_level=70.0, category="Practical", learning_effort_hours=15.0),
            SkillRequirement(skill_name="Data Science Professional Cert", required_level=70.0, category="Certification", learning_effort_hours=24.0),
        ]
    ),
    "web_developer": TargetRole(
        role_id="web_developer",
        role_name="Web Developer",
        description="Creates responsive, accessible websites using HTML, CSS, JavaScript, and modern tools.",
        requirements=[
            SkillRequirement(skill_name="HTML5 & CSS3 Styling", required_level=85.0, category="Technical", learning_effort_hours=8.0),
            SkillRequirement(skill_name="JavaScript ES6+", required_level=80.0, category="Technical", learning_effort_hours=14.0),
            SkillRequirement(skill_name="Responsive & Mobile Design", required_level=75.0, category="Practical", learning_effort_hours=10.0),
            SkillRequirement(skill_name="DOM Manipulation & Web APIs", required_level=75.0, category="Practical", learning_effort_hours=10.0),
            SkillRequirement(skill_name="Git Version Control", required_level=70.0, category="Practical", learning_effort_hours=8.0),
            SkillRequirement(skill_name="Web Development Specialist Cert", required_level=60.0, category="Certification", learning_effort_hours=16.0),
        ]
    ),
    "full_stack_developer": TargetRole(
        role_id="full_stack_developer",
        role_name="Full Stack Developer",
        description="Architects end-to-end web applications combining modern frontend UIs with robust backend APIs.",
        requirements=[
            SkillRequirement(skill_name="React & Frontend Frameworks", required_level=85.0, category="Technical", learning_effort_hours=16.0),
            SkillRequirement(skill_name="Node.js & Express / Python API", required_level=80.0, category="Technical", learning_effort_hours=18.0),
            SkillRequirement(skill_name="Database Architecture (SQL/NoSQL)", required_level=80.0, category="Technical", learning_effort_hours=15.0),
            SkillRequirement(skill_name="REST API & GraphQL Integration", required_level=75.0, category="Practical", learning_effort_hours=12.0),
            SkillRequirement(skill_name="Docker & CI/CD Pipelines", required_level=70.0, category="Practical", learning_effort_hours=14.0),
            SkillRequirement(skill_name="Full Stack Engineering Cert", required_level=65.0, category="Certification", learning_effort_hours=20.0),
        ]
    ),
    "frontend_dev_intern": TargetRole(
        role_id="frontend_dev_intern",
        role_name="Frontend Developer Intern",
        description="Develops responsive web UIs using React, Next.js, and TypeScript.",
        requirements=[
            SkillRequirement(skill_name="React & Next.js", required_level=80.0, category="Technical", learning_effort_hours=16.0),
            SkillRequirement(skill_name="TypeScript", required_level=75.0, category="Technical", learning_effort_hours=12.0),
            SkillRequirement(skill_name="Tailwind CSS", required_level=70.0, category="Practical", learning_effort_hours=8.0),
            SkillRequirement(skill_name="REST API Integration", required_level=75.0, category="Practical", learning_effort_hours=10.0),
            SkillRequirement(skill_name="Git & CI/CD Basics", required_level=65.0, category="Practical", learning_effort_hours=8.0),
            SkillRequirement(skill_name="Frontend Specialist Cert", required_level=60.0, category="Certification", learning_effort_hours=18.0),
        ]
    ),
    "data_engineer": TargetRole(
        role_id="data_engineer",
        role_name="Data Engineer",
        description="Builds scalable data pipelines, data warehouses, and big data streaming architecture.",
        requirements=[
            SkillRequirement(skill_name="Python & PySpark", required_level=85.0, category="Technical", learning_effort_hours=20.0),
            SkillRequirement(skill_name="SQL & Data Warehousing", required_level=85.0, category="Technical", learning_effort_hours=15.0),
            SkillRequirement(skill_name="ETL Pipeline Orchestration (Airflow)", required_level=80.0, category="Practical", learning_effort_hours=18.0),
            SkillRequirement(skill_name="Kafka & Streaming Architecture", required_level=75.0, category="Practical", learning_effort_hours=22.0),
            SkillRequirement(skill_name="Cloud Infrastructure (AWS/GCP)", required_level=70.0, category="Practical", learning_effort_hours=16.0),
            SkillRequirement(skill_name="Certified Data Engineer", required_level=65.0, category="Certification", learning_effort_hours=20.0),
        ]
    ),
    "aiml_intern": TargetRole(
        role_id="aiml_intern",
        role_name="AI/ML Engineer Intern",
        description="Trains machine learning models, works with PyTorch/TensorFlow, and builds pipelines.",
        requirements=[
            SkillRequirement(skill_name="Python & PyTorch", required_level=80.0, category="Technical", learning_effort_hours=20.0),
            SkillRequirement(skill_name="Machine Learning Algorithms", required_level=75.0, category="Technical", learning_effort_hours=18.0),
            SkillRequirement(skill_name="Model Evaluation & Tuning", required_level=70.0, category="Practical", learning_effort_hours=14.0),
            SkillRequirement(skill_name="Data Preprocessing", required_level=75.0, category="Practical", learning_effort_hours=10.0),
            SkillRequirement(skill_name="ML Ops Basics", required_level=65.0, category="Practical", learning_effort_hours=15.0),
            SkillRequirement(skill_name="Machine Learning Certification", required_level=60.0, category="Certification", learning_effort_hours=22.0),
        ]
    )
}

def analyze_readiness(
    candidate_skills: Dict[str, float],
    role_id: str = "data_analyst_intern"
) -> Dict[str, Any]:
    """
    Compares candidate's calculated skill confidence against role requirements.
    Identifies 🔴 Job Blockers vs 🟢 Ready skills.
    Computes overall readiness score % and breakdown into Technical, Practical, Certification.
    """
    role = TARGET_ROLES.get(role_id, TARGET_ROLES["data_analyst_intern"])
    
    blockers = []
    skill_evaluations = []
    
    total_required = 0.0
    total_achieved = 0.0
    
    category_scores = {
        "Technical": {"achieved": 0.0, "required": 0.0},
        "Practical": {"achieved": 0.0, "required": 0.0},
        "Certification": {"achieved": 0.0, "required": 0.0},
    }

    for req in role.requirements:
        cand_level = round(candidate_skills.get(req.skill_name, 0.0), 1)
        req_level = req.required_level
        
        is_blocker = cand_level < req_level
        gap = round(max(0.0, req_level - cand_level), 1)
        status = "🔴 Blocker" if is_blocker else "🟢 Ready"
        
        eval_item = {
            "skill_name": req.skill_name,
            "candidate_level": cand_level,
            "required_level": req_level,
            "category": req.category,
            "gap": gap,
            "status": status,
            "is_blocker": is_blocker,
            "learning_effort_hours": req.learning_effort_hours
        }
        skill_evaluations.append(eval_item)
        if is_blocker:
            blockers.append(eval_item)
            
        achieved_contribution = min(cand_level, req_level)
        total_achieved += achieved_contribution
        total_required += req_level
        
        cat = req.category if req.category in category_scores else "Technical"
        category_scores[cat]["achieved"] += achieved_contribution
        category_scores[cat]["required"] += req_level

    overall_readiness_pct = round((total_achieved / total_required * 100.0), 1) if total_required > 0 else 0.0

    breakdown = {}
    for cat, scores in category_scores.items():
        if scores["required"] > 0:
            breakdown[cat] = round((scores["achieved"] / scores["required"]) * 100.0, 1)
        else:
            breakdown[cat] = 100.0

    return {
        "role_id": role.role_id,
        "role_name": role.role_name,
        "overall_readiness_pct": overall_readiness_pct,
        "breakdown": breakdown,
        "job_blockers": blockers,
        "all_skills": skill_evaluations,
        "total_blockers_count": len(blockers)
    }
