import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindveda_project.settings')
django.setup()

from assessments.models import Question, Option
from games.models import Game

def seed_data():
    # 1. Onboarding Questions
    q_data = [
        ('onboarding', 'What is your age group?', 'age', [
            ('Teen (13-19)', 0), ('Adult (20-60)', 0), ('Senior (60+)', 0)
        ]),
        ('onboarding', 'How would you rate your focus level today?', 'focus', [
            ('Very Focused', 80), ('Steady', 60), ('Distracted', 40), ('Very Scattered', 20)
        ]),
        ('onboarding', 'How much stress have you felt this week?', 'stress', [
            ('None', 10), ('Manageable', 30), ('High', 70), ('Overwhelming', 90)
        ]),
        ('onboarding', 'How is your energy level right now?', 'energy', [
            ('Energetic', 80), ('Calm', 50), ('Tired', 30), ('Exhausted', 10)
        ]),
        ('onboarding', 'How would you rate your sleep quality last night?', 'sleep', [
            ('Excellent', 90), ('Good', 70), ('Fair', 40), ('Poor', 10)
        ]),
        ('onboarding', 'Is your daily routine generally stable?', 'routine', [
            ('Very Stable', 80), ('Mostly Stable', 60), ('A bit chaotic', 30), ('Very chaotic', 10)
        ]),
        ('onboarding', 'What kind of games do you usually prefer?', 'preference', [
            ('Logic Puzzles', 0), ('Calming Meditations', 0), ('Fast-paced Action', 0)
        ]),
        ('onboarding', 'How much time can you dedicate daily to MindVeda?', 'time', [
            ('< 15 mins', 0), ('15-30 mins', 0), ('30-60 mins', 0), ('1h+', 0)
        ]),
    ]

    for q_type, text, cat, opts in q_data:
        q, _ = Question.objects.get_or_create(type=q_type, text=text, category=cat)
        for opt_text, val in opts:
            Option.objects.get_or_create(question=q, text=opt_text, value=val)

    # 2. Condition-specific Questions (Sample)
    adhd_q = [
        ('adhd', 'Do you find yourself starting many things but finishing few?', 'focus', [
            ('Never', 10), ('Sometimes', 40), ('Often', 70), ('Always', 100)
        ]),
        ('adhd', 'How often do you feel restless or "on the go"?', 'hyperactivity', [
            ('Never', 10), ('Rarely', 30), ('Often', 70), ('Very Often', 90)
        ]),
    ]
    for q_type, text, cat, opts in adhd_q:
        q, _ = Question.objects.get_or_create(type=q_type, text=text, category=cat)
        for opt_text, val in opts:
            Option.objects.get_or_create(question=q, text=opt_text, value=val)

    # 3. Games
    games = [
        ('Logic Puzzle', 'general', 'memory', 3, 4, False),
        ('Breath Cycle', 'anxiety', 'calming', 1, 2, False),
        ('Pattern Match', 'autism', 'pattern', 4, 3, False),
        ('Reaction Sprint', 'adhd', 'reaction', 5, 8, True),
        ('Sorting Chaos', 'adhd', 'focus', 4, 6, True),
        ('Zen Flow', 'anxiety', 'calming', 1, 1, False),
        ('Visual Attention', 'autism', 'focus', 3, 3, False),
        ('Sequence Recall', 'general', 'memory', 5, 5, True),
    ]

    for name, cat, gtype, diff, stim, time_p in games:
        Game.objects.get_or_create(
            name=name, 
            category=cat, 
            type=gtype, 
            difficulty_level=diff, 
            stimulation_level=stim, 
            time_pressure=time_p
        )

    # 4. Daily Check-in Questions
    checkin_q = [
        ('checkin', 'How is your mood right now?', 'mood', [
            ('Terrible', 1), ('Low', 2), ('Neutral', 3), ('Good', 4), ('Excellent', 5)
        ]),
        ('checkin', 'What is your current energy level?', 'energy', [
            ('Exhausted', 1), ('Tired', 2), ('Steady', 3), ('Energetic', 4), ('Hyper', 5)
        ]),
        ('checkin', 'Rate your current stress level.', 'stress', [
            ('High', 5), ('Moderate', 3), ('Low', 1), ('None', 0)
        ]),
    ]
    for q_type, text, cat, opts in checkin_q:
        q, _ = Question.objects.get_or_create(type=q_type, text=text, category=cat)
        for opt_text, val in opts:
            Option.objects.get_or_create(question=q, text=opt_text, value=val)

    print("Successfully seeded onboarding, games, and check-in data.")

if __name__ == "__main__":
    seed_data()
