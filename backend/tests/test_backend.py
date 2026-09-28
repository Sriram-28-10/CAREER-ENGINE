"""
test_backend.py
Unit tests for skill_proof, readiness_twin, minimum_path, counterfactual, chatbot, and resources.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.skill_proof import SkillEvidence, calculate_skill_confidence
from app.readiness_twin import analyze_readiness
from app.minimum_path import calculate_minimum_path
from app.counterfactual import simulate_counterfactual
from app.main import chatbot_reply, get_resources, ChatbotRequest

def test_skill_confidence_weighting():
    ev = SkillEvidence(
        resume_claim=80.0,
        github_evidence=75.0,
        certificate_score=60.0,
        assessment_score=70.0
    )
    score = calculate_skill_confidence(ev)
    assert 71.0 <= score <= 71.5, f"Expected ~71.3, got {score}"

def test_readiness_twin_blockers():
    skills = {
        "Python & Pandas": 80.0,
        "SQL Querying": 50.0,
        "Power BI / Tableau": 70.0,
        "Data Cleaning & EDA": 80.0,
        "Statistical Analysis": 70.0,
        "Certified Data Associate": 60.0,
    }
    res = analyze_readiness(skills, "data_analyst_intern")
    assert res["total_blockers_count"] == 1
    assert res["job_blockers"][0]["skill_name"] == "SQL Querying"

def test_minimum_path_roi_sorting():
    skills = {
        "Python & Pandas": 75.0,
        "SQL Querying": 40.0,
        "Power BI / Tableau": 30.0,
        "Data Cleaning & EDA": 75.0,
        "Statistical Analysis": 65.0,
        "Certified Data Associate": 60.0,
    }
    res = analyze_readiness(skills, "data_analyst_intern")
    path = calculate_minimum_path(res, target_readiness_pct=85.0)
    assert path["steps_count"] > 0

def test_counterfactual_simulation():
    skills = {
        "Python & Pandas": 75.0,
        "SQL Querying": 40.0,
        "Power BI / Tableau": 30.0,
        "Data Cleaning & EDA": 75.0,
        "Statistical Analysis": 65.0,
        "Certified Data Associate": 60.0,
    }
    boosts = {"SQL Querying": 85.0, "Power BI / Tableau": 75.0}
    sim = simulate_counterfactual(skills, "data_analyst_intern", boosts)
    assert sim["score_delta"] > 0

def test_chatbot_and_resources_endpoints():
    req = ChatbotRequest(user_message="How to increase my readiness score?", role_id="data_scientist")
    reply = chatbot_reply(req)
    assert "reply" in reply
    assert reply["team"] == "Team SCORPIUS"

    resources = get_resources("SQL Querying")
    assert "SQL Querying" in resources
    assert len(resources["SQL Querying"]["platforms"]) > 0
