"""
skill_proof.py
Calculates dynamic Skill Confidence Score (0-100%) based on weighted evidence inputs:
- Resume claim weight: 0.15
- GitHub project evidence weight: 0.35
- Certificate weight: 0.20
- Micro-assessment score weight: 0.30
"""

from typing import Dict, Any
from pydantic import BaseModel, Field

RESUME_WEIGHT = 0.15
GITHUB_WEIGHT = 0.35
CERTIFICATE_WEIGHT = 0.20
ASSESSMENT_WEIGHT = 0.30

class SkillEvidence(BaseModel):
    resume_claim: float = Field(default=0.0, ge=0.0, le=100.0, description="Self-reported resume confidence (0-100)")
    github_evidence: float = Field(default=0.0, ge=0.0, le=100.0, description="GitHub code verification score (0-100)")
    certificate_score: float = Field(default=0.0, ge=0.0, le=100.0, description="Verified certificate score (0-100)")
    assessment_score: float = Field(default=0.0, ge=0.0, le=100.0, description="Micro-assessment score (0-100)")

def calculate_skill_confidence(evidence: SkillEvidence) -> float:
    """
    Computes a weighted dynamic Skill Confidence Score (0-100%).
    """
    score = (
        evidence.resume_claim * RESUME_WEIGHT +
        evidence.github_evidence * GITHUB_WEIGHT +
        evidence.certificate_score * CERTIFICATE_WEIGHT +
        evidence.assessment_score * ASSESSMENT_WEIGHT
    )
    return round(min(max(score, 0.0), 100.0), 1)

def batch_calculate_confidence(skill_evidence_map: Dict[str, Dict[str, float]]) -> Dict[str, float]:
    """
    Helper to calculate confidence for multiple skills at once.
    """
    results = {}
    for skill, ev in skill_evidence_map.items():
        evidence_obj = SkillEvidence(**ev)
        results[skill] = calculate_skill_confidence(evidence_obj)
    return results
