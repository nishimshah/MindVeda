import openai
import json
import re
from django.conf import settings
from datetime import datetime

def get_daily_plan(user, streak_count, recent_activities):
    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    
    prompt = f"""Generate a brief daily wellness plan for {user.name} ({user.age_group} age group).
Their goals: {', '.join(user.goals) if user.goals else 'general wellness'}.
{f'Special considerations: {", ".join(user.special_needs)}' if user.special_needs else ''}
Current streak: {streak_count} days.
Recent activities: {', '.join([r.game_name or r.activity_type for r in recent_activities]) if recent_activities else 'none yet'}.
Provide exactly 4 items in JSON array format: [{"title": "...", "description": "...", "type": "training|chat|calm|mood", "duration": "X min"}]
Keep it encouraging and personalized. Each item should be 1 short sentence."""

    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.8,
        )
        content = completion.choices[0].message.content
        # Extract JSON from response
        json_match = re.search(r'\[[\s\S]*\]', content)
        if json_match:
            return json.loads(json_match.group(0))
    except Exception as e:
        print(f"OpenAI plan error: {e}")
    
    # Fallback plan
    goal_map = {
        'focus': {'title': '🎯 Focus Training', 'description': 'Play a Pattern Recognition game to sharpen focus', 'type': 'training', 'duration': '5 min'},
        'memory': {'title': '🧠 Memory Boost', 'description': 'Complete a Memory Match challenge', 'type': 'training', 'duration': '5 min'},
        'stress': {'title': '🧘 Stress Relief', 'description': 'Try a breathing exercise in the Calm Zone', 'type': 'calm', 'duration': '3 min'},
        'productivity': {'title': '⚡ Quick Reaction', 'description': 'Test your reflexes with the Reaction Game', 'type': 'training', 'duration': '3 min'},
    }
    
    first_goal = user.goals[0] if user.goals else 'general'
    return [
        goal_map.get(first_goal, {'title': '🧠 Brain Warm-up', 'description': 'Start with a quick memory game', 'type': 'training', 'duration': '5 min'}),
        {'title': '💬 Check In', 'description': 'Chat with your AI companion about how you feel', 'type': 'chat', 'duration': '5 min'},
        {'title': '🧘 Mindful Break', 'description': 'Take a breathing exercise break', 'type': 'calm', 'duration': '3 min'},
        {'title': '📊 Log Your Mood', 'description': "Track how you're feeling today", 'type': 'mood', 'duration': '1 min'},
    ]

def get_time_of_day():
    hour = datetime.now().hour
    if hour < 12: return 'morning'
    if hour < 17: return 'afternoon'
    return 'evening'
