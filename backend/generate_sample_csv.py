import pandas as pd
import random
import os

def generate_csv():
    age_groups = ['teen', 'adult', 'midlife', 'senior', 'elderly']
    activities = ['calm', 'training', 'chat', 'mood', 'physical']
    
    data = []
    for _ in range(50):
        age = random.choice(age_groups)
        act = random.choice(activities)
        goals = random.randint(1, 6)
        before = random.randint(1, 4)
        
        # Patterns for RF to detect:
        # Seniors benefit from Calm
        # Teens benefit from Training
        if age in ['senior', 'elderly'] and act == 'calm':
            improvement = random.randint(1, 2)
        elif age in ['teen', 'adult'] and act == 'training':
            improvement = random.randint(1, 2)
        else:
            improvement = random.choice([0, 1])
            
        data.append({
            'user_age_group': age,
            'goals_count': goals,
            'activity_type': act,
            'mood_before': before,
            'mood_after': min(5, before + improvement),
            'improvement': improvement
        })
        
    df = pd.DataFrame(data)
    df.to_csv('sample_activity_data.csv', index=False)
    print("✅ Created sample_activity_data.csv with 50 records.")

if __name__ == "__main__":
    generate_csv()
