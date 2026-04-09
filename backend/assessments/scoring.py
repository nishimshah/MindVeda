"""
assessments/scoring.py

Clinical scoring logic for GAD-7, PHQ-9, and ADHD screening.
Scoring is isolated here so views stay thin.
"""

# ─── GAD-7 (Anxiety) ────────────────────
# Score: 7 questions, each 0-3
# 0–4: Minimal, 5–9: Mild, 10–14: Moderate, 15–21: Severe

def score_gad7(responses: dict) -> tuple[int, str]:
    keys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7']
    total = sum(int(responses.get(k, 0)) for k in keys)
    if total <= 4:
        severity = 'minimal'
    elif total <= 9:
        severity = 'mild'
    elif total <= 14:
        severity = 'moderate'
    else:
        severity = 'severe'
    return total, severity


# ─── PHQ-9 (Depression) ─────────────────
# Score: 9 questions, each 0-3
# 0–4: Minimal, 5–9: Mild, 10–14: Moderate, 15–19: Moderately Severe, 20–27: Severe

def score_phq9(responses: dict) -> tuple[int, str]:
    keys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9']
    total = sum(int(responses.get(k, 0)) for k in keys)
    if total <= 4:
        severity = 'minimal'
    elif total <= 9:
        severity = 'mild'
    elif total <= 14:
        severity = 'moderate'
    elif total <= 19:
        severity = 'moderately_severe'
    else:
        severity = 'severe'
    return total, severity


# ─── ADHD Screening ─────────────────────
# Based on Adult ADHD Self-Report Scale (ASRS-5)
# 5 questions, scored 0-3
# 0–7: Not indicative, 8–10: Mild, 11–13: Moderate, 14–15: Severe

def score_adhd(responses: dict) -> tuple[int, str]:
    keys = ['q1', 'q2', 'q3', 'q4', 'q5']
    total = sum(int(responses.get(k, 0)) for k in keys)
    if total <= 7:
        severity = 'minimal'
    elif total <= 10:
        severity = 'mild'
    elif total <= 13:
        severity = 'moderate'
    else:
        severity = 'severe'
    return total, severity


SCORERS = {
    'anxiety': score_gad7,
    'depression': score_phq9,
    'adhd': score_adhd,
}

def calculate_score(condition: str, responses: dict) -> tuple[int, str]:
    scorer = SCORERS.get(condition)
    if scorer:
        return scorer(responses)
    return 0, 'minimal'
