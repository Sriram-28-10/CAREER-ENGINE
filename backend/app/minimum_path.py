"""
minimum_path.py
Sorts non-verified or missing skills by ROI (Readiness Gain / Learning Effort)
to return the fastest hourly path to reaching 85%+ job readiness.
"""

from typing import Dict, List, Any

def calculate_minimum_path(
    analysis_result: Dict[str, Any],
    target_readiness_pct: float = 85.0
) -> Dict[str, Any]:
    """
    Computes ROI for each blocker skill:
    ROI = Readiness Gain % / Learning Effort (hours)
    
    Greedily selects highest ROI skills until current readiness >= target_readiness_pct
    or all blockers are resolved.
    """
    current_readiness = analysis_result["overall_readiness_pct"]
    blockers = analysis_result.get("job_blockers", [])
    all_skills = analysis_result.get("all_skills", [])
    
    # Calculate total baseline required sum across all skills in the target role
    total_required_sum = sum(s["required_level"] for s in all_skills) if all_skills else 100.0

    steps = []
    for skill in blockers:
        gap = skill["gap"]
        effort = skill["learning_effort_hours"]
        # Readiness gain if this gap is completely closed
        readiness_gain = round((gap / total_required_sum) * 100.0, 2)
        roi = round(readiness_gain / effort, 3) if effort > 0 else 0.0
        
        steps.append({
            "skill_name": skill["skill_name"],
            "category": skill["category"],
            "current_level": skill["candidate_level"],
            "required_level": skill["required_level"],
            "gap": gap,
            "learning_effort_hours": effort,
            "readiness_gain": readiness_gain,
            "roi": roi,
            "action": f"Complete targeted practice for {skill['skill_name']} (+{gap}% boost)"
        })

    # Sort steps descending by ROI (highest ROI first)
    steps.sort(key=lambda s: s["roi"], reverse=True)

    path_steps = []
    accumulated_readiness = current_readiness
    total_hours = 0.0

    for i, step in enumerate(steps, start=1):
        if accumulated_readiness >= target_readiness_pct:
            break
            
        step_with_index = dict(step)
        step_with_index["step_number"] = len(path_steps) + 1
        path_steps.append(step_with_index)
        
        accumulated_readiness += step["readiness_gain"]
        total_hours += step["learning_effort_hours"]

    accumulated_readiness = round(min(100.0, accumulated_readiness), 1)

    return {
        "target_readiness_pct": target_readiness_pct,
        "initial_readiness_pct": current_readiness,
        "projected_readiness_pct": accumulated_readiness,
        "is_target_reached": accumulated_readiness >= target_readiness_pct,
        "total_hours_needed": round(total_hours, 1),
        "steps_count": len(path_steps),
        "learning_path": path_steps
    }
