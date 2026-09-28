"""
counterfactual.py
Accepts hypothetical skill additions (e.g., 'What if I learn SQL?') and
returns projected readiness increases (e.g., 63% -> 81%).
"""

from typing import Dict, List, Any
from app.readiness_twin import analyze_readiness
from app.minimum_path import calculate_minimum_path

def simulate_counterfactual(
    baseline_skills: Dict[str, float],
    role_id: str,
    hypothetical_boosts: Dict[str, float]
) -> Dict[str, Any]:
    """
    Simulates what happens to overall readiness score, blockers, and minimum path
    if the candidate gains specified skill increases or masteries.
    
    hypothetical_boosts: mapping of skill_name -> target level or boost percentage
    e.g. {'SQL Querying': 85.0, 'Power BI / Tableau': 75.0}
    """
    # Baseline readiness analysis
    baseline_analysis = analyze_readiness(baseline_skills, role_id)
    baseline_score = baseline_analysis["overall_readiness_pct"]
    baseline_min_path = calculate_minimum_path(baseline_analysis)

    # Build mutated hypothetical skills dict
    simulated_skills = dict(baseline_skills)
    for skill_name, boost in hypothetical_boosts.items():
        current = simulated_skills.get(skill_name, 0.0)
        # If boost is specified as target level (e.g. 85), set it or add it if smaller
        simulated_skills[skill_name] = max(current, boost)

    # Simulated readiness analysis
    simulated_analysis = analyze_readiness(simulated_skills, role_id)
    simulated_score = simulated_analysis["overall_readiness_pct"]
    simulated_min_path = calculate_minimum_path(simulated_analysis)

    score_delta = round(simulated_score - baseline_score, 1)

    return {
        "role_id": role_id,
        "baseline_readiness_pct": baseline_score,
        "projected_readiness_pct": simulated_score,
        "score_delta": score_delta,
        "hypothetical_skills_applied": hypothetical_boosts,
        "baseline_blockers_count": baseline_analysis["total_blockers_count"],
        "projected_blockers_count": simulated_analysis["total_blockers_count"],
        "simulated_breakdown": simulated_analysis["breakdown"],
        "simulated_job_blockers": simulated_analysis["job_blockers"],
        "simulated_all_skills": simulated_analysis["all_skills"],
        "simulated_minimum_path": simulated_min_path
    }
