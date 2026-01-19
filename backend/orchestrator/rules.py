"""
Orchestrator Service - Deterministic Rule Engine
NO LLM. NO RANDOMNESS. PURE CONDITIONALS.

Routes users based on weakness scores.
"""

from typing import Tuple

# Threshold for triggering remediation
WEAKNESS_THRESHOLD = 0.4

# Module routing map
MODULES = {
    "production_interview": "Production Thinking Interview drills",
    "system_design_learning_blocks": "System Design learning modules",
    "curveball_scenarios": "Curveball scenario training",
    "failure_case_lessons": "Failure case analysis lessons",
    "dsa_visualizer": "DSA Visualizer training",
    "project_studio": "Project Studio (all metrics healthy)"
}


def decide(state: dict) -> Tuple[str, str]:
    """
    Deterministic routing logic.
    
    Args:
        state: dict with clarity_avg, tradeoff_avg, adaptability_avg, 
               failure_awareness_avg, dsa_predict_skill
    
    Returns:
        Tuple of (next_module, reason)
    
    Rules (in priority order):
    1. Low clarity → production interview (clarification drills)
    2. Low tradeoffs → system design lessons
    3. Low adaptability → curveball scenarios
    4. Low failure awareness → failure case lessons
    5. (Future) Low dsa_predict → dsa visualizer
    6. All healthy → project studio
    """
    
    # Extract values with defaults
    clarity = state.get("clarity_avg", 1.0) or 1.0
    tradeoffs = state.get("tradeoff_avg", 1.0) or 1.0
    adaptability = state.get("adaptability_avg", 1.0) or 1.0
    failure_awareness = state.get("failure_awareness_avg", 1.0) or 1.0
    dsa_predict = state.get("dsa_predict_skill", 1.0) or 1.0
    
    # Rule 1: Clarity issues → production interview
    if clarity < WEAKNESS_THRESHOLD:
        return "production_interview", f"clarity_avg ({clarity:.2f}) < {WEAKNESS_THRESHOLD}"
    
    # Rule 2: Tradeoff issues → system design
    if tradeoffs < WEAKNESS_THRESHOLD:
        return "system_design_learning_blocks", f"tradeoff_avg ({tradeoffs:.2f}) < {WEAKNESS_THRESHOLD}"
    
    # Rule 3: Adaptability issues → curveball training
    if adaptability < WEAKNESS_THRESHOLD:
        return "curveball_scenarios", f"adaptability_avg ({adaptability:.2f}) < {WEAKNESS_THRESHOLD}"
    
    # Rule 4: Failure awareness issues → failure lessons
    if failure_awareness < WEAKNESS_THRESHOLD:
        return "failure_case_lessons", f"failure_awareness_avg ({failure_awareness:.2f}) < {WEAKNESS_THRESHOLD}"
    
    # Rule 5: DSA prediction issues → visualizer (DISABLED until visualizer exists)
    # if dsa_predict < WEAKNESS_THRESHOLD:
    #     return "dsa_visualizer", f"dsa_predict_skill ({dsa_predict:.2f}) < {WEAKNESS_THRESHOLD}"
    
    # Rule 6: All healthy → project studio
    return "project_studio", "all metrics >= 0.4 (healthy)"


def get_module_description(module: str) -> str:
    """Get human-readable description of a module."""
    return MODULES.get(module, module)
