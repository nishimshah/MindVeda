"""
ai_engine/services.py

Central AI service module. All AI and ML logic lives here — never in views.
Views should call these functions and return their results.
"""
import re
import json
import openai
from django.conf import settings

# ─────────────────────────────────────────
# CRISIS DETECTION
# ─────────────────────────────────────────

CRISIS_KEYWORDS = [
    "i want to quit", "i feel like dying", "i want to die",
    "end my life", "kill myself", "no reason to live",
    "can't go on", "want to disappear", "suicidal",
    "hurt myself", "self harm",
]

def detect_crisis(text: str) -> dict | None:
    """
    Scan user text for crisis signals.
    Returns a crisis alert dict if detected, else None.
    """
    lower = text.lower()
    for keyword in CRISIS_KEYWORDS:
        if keyword in lower:
            return {
                "alert": "crisis_detected",
                "message": "It sounds like you might be going through something very difficult. "
                           "You are not alone. Please reach out to a crisis helpline immediately. "
                           "India: iCall — 9152987821 | Vandrevala Foundation — 1860-2662-345",
                "keyword_matched": keyword,
            }
    return None


# ─────────────────────────────────────────
# MOOD ANALYSIS
# ─────────────────────────────────────────

def analyze_mood(text: str) -> dict:
    """
    Analyze the sentiment and emotional state of user-submitted text.
    Returns mood label, score, and crisis status.
    """
    crisis = detect_crisis(text)
    if crisis:
        return {"mood": "crisis", "score": 0, "crisis": crisis}

    positive_words = [
        'happy', 'great', 'good', 'wonderful', 'amazing', 'love', 'excited',
        'grateful', 'thankful', 'joy', 'fantastic', 'excellent', 'blessed',
        'hopeful', 'calm', 'peaceful', 'motivated', 'confident',
    ]
    negative_words = [
        'sad', 'angry', 'depressed', 'anxious', 'worried', 'stressed',
        'scared', 'lonely', 'hopeless', 'tired', 'frustrated', 'overwhelmed',
        'hurt', 'pain', 'afraid', 'panic', 'cry', 'helpless', 'worthless',
    ]

    lower = text.lower()
    pos = sum(1 for w in positive_words if w in lower)
    neg = sum(1 for w in negative_words if w in lower)

    if neg > pos:
        mood, score = 'negative', max(1, 5 - neg)
    elif pos > neg:
        mood, score = 'positive', min(5, 3 + pos)
    else:
        mood, score = 'neutral', 3

    return {"mood": mood, "score": score, "crisis": None}


# ─────────────────────────────────────────
# ACTIVITY SUGGESTIONS
# ─────────────────────────────────────────

ACTIVITY_MAP = {
    'anxiety': [
        {"name": "4-7-8 Breathing", "type": "calm", "duration": "5 min"},
        {"name": "Grounding Exercise (5-4-3-2-1)", "type": "calm", "duration": "5 min"},
        {"name": "Progressive Muscle Relaxation", "type": "calm", "duration": "10 min"},
        {"name": "Journaling", "type": "reflection", "duration": "10 min"},
    ],
    'depression': [
        {"name": "Gratitude Journaling", "type": "reflection", "duration": "10 min"},
        {"name": "Behavioral Activation Walk", "type": "physical", "duration": "15 min"},
        {"name": "Social Connection Check-In", "type": "social", "duration": "5 min"},
        {"name": "Memory Boost Game", "type": "training", "duration": "5 min"},
    ],
    'adhd': [
        {"name": "Pomodoro Focus Session", "type": "productivity", "duration": "25 min"},
        {"name": "Pattern Recognition Game", "type": "training", "duration": "5 min"},
        {"name": "Task Chunking Exercise", "type": "productivity", "duration": "10 min"},
        {"name": "Reaction Speed Game", "type": "training", "duration": "3 min"},
    ],
    'stress': [
        {"name": "Box Breathing", "type": "calm", "duration": "5 min"},
        {"name": "Body Scan Meditation", "type": "calm", "duration": "10 min"},
        {"name": "Nature Soundscape", "type": "calm", "duration": "15 min"},
        {"name": "Stretching Routine", "type": "physical", "duration": "10 min"},
    ],
    'general': [
        {"name": "Mindful Breathing", "type": "calm", "duration": "5 min"},
        {"name": "Memory Match Game", "type": "training", "duration": "5 min"},
        {"name": "Mood Check-In", "type": "reflection", "duration": "2 min"},
        {"name": "Gratitude Note", "type": "reflection", "duration": "5 min"},
    ],
}

def suggest_activities(condition: str) -> list:
    """Return a list of recommended activities for a given condition."""
    return ACTIVITY_MAP.get(condition.lower(), ACTIVITY_MAP['general'])


# ─────────────────────────────────────────
# DAILY PLAN GENERATION (AI-powered)
# ─────────────────────────────────────────

def generate_daily_plan(user, user_data: dict) -> list:
    """
    Generate a personalized daily wellness plan.
    user: The User model instance
    user_data keys: name, age_group, goals, condition, streak, recent_activities
    Falls back to a rule-based plan if OpenAI is unavailable.
    """
    condition = user_data.get('condition', 'general')
    name = user_data.get('name', 'there')
    streak = user_data.get('streak', 0)
    goals = user_data.get('goals', [])
    clinical = user_data.get('clinical_data', {})

    distress = clinical.get('distress_level', 'unknown')
    sleep = clinical.get('sleep_quality', 'unknown')

    # Use Random Forest to rank possible activity types based on user traits
    best_type = 'general'
    try:
        from .ml_logic import predict_best_tasks
        candidate_types = ['calm', 'training', 'chat', 'mood', 'physical']
        ranked_types = predict_best_tasks(user, candidate_types)
        best_type = ranked_types[0]
    except Exception as e:
        print(f"[ai_engine] ML prediction error: {e}")

    try:
        if not settings.OPENAI_API_KEY:
            raise ValueError("OpenAI API key missing")

        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        prompt = f"""Generate a personalized daily wellness plan for {name}.
Context:
- Condition: {condition}
- Goals: {', '.join(goals) if goals else 'general wellness'}
- Streak: {streak} days active
- Distress Level (Weekly): {distress}
- Sleep Quality: {sleep}
- Preferred Category (ML Verified): {best_type}

Return ONLY a JSON array with exactly 4 items. Each item must have:
{{"title": "string", "description": "1 sentence", "type": "training|chat|calm|mood", "duration": "X min"}}
Prioritize tasks related to {best_type} as our model shows these correlate best with mood. Be warm and encouraging."""

        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=400,
            temperature=0.7,
        )
        content = completion.choices[0].message.content
        match = re.search(r'\[[\s\S]*\]', content)
        if match:
            return json.loads(match.group(0))
    except Exception as e:
        print(f"[ai_engine] AI generation fallback: {e}")

    # Rule-based fallback (Now ML-ranked)
    activities = suggest_activities(best_type if best_type != 'general' else condition)
    return [
        {"title": f"🎯 {activities[0]['name']}", "description": f"Focus session tailored to your profile", "type": best_type if best_type != 'physical' else 'calm', "duration": activities[0]['duration']},
        {"title": "💬 AI Check-In", "description": "Quick chat about your day", "type": "chat", "duration": "5 min"},
        {"title": "📊 Mood Log", "description": "Reflection on your current feelings", "type": "mood", "duration": "2 min"},
        {"title": f"🧘 {activities[-1]['name']}", "description": f"Mindful wind-down session", "type": activities[-1]['type'] if activities[-1]['type'] in ['calm','training','chat','mood'] else 'calm', "duration": activities[-1]['duration']},
    ]
