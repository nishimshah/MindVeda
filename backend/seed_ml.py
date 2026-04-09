import os
import django
import sys
import random

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindveda_project.settings')
django.setup()

from analytics.models import UserActivityLog
from accounts.models import User

def seed_activity_data():
    users = User.objects.filter(role='individual')
    if not users.exists():
        print("No users found to seed.")
        return

    activity_types = ['calm', 'training', 'chat', 'mood', 'physical']
    
    # Generate 50 synthetic logs
    for _ in range(50):
        u = random.choice(users)
        act_type = random.choice(activity_types)
        
        # Simulated logic: younger users benefit more from 'training', older from 'calm'
        before = random.randint(1, 3)
        improvement = 0
        if u.age_group in ['teen', 'adult'] and act_type == 'training':
            improvement = random.randint(1, 2)
        elif u.age_group in ['senior', 'elderly'] and act_type == 'calm':
            improvement = random.randint(1, 2)
        else:
            improvement = random.randint(0, 1)
            
        UserActivityLog.objects.create(
            user=u,
            activity_type=act_type,
            activity_name=f"Practice {act_type}",
            mood_before=before,
            mood_after=min(5, before + improvement),
            duration_seconds=random.randint(120, 600)
        )
    print("Seeded 50 activity logs.")

if __name__ == "__main__":
    seed_activity_data()
    # Now train the model
    from ai_engine.ml_logic import train_activity_model
    train_activity_model()
    print("Random Forest model trained and saved.")
