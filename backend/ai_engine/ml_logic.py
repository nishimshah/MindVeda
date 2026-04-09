import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from django.conf import settings
from analytics.models import UserActivityLog
from accounts.models import User

MODEL_PATH = os.path.join(settings.BASE_DIR, 'ai_engine', 'bin', 'activity_rf.joblib')

def train_activity_model():
    """
    Train a Random Forest model on UserActivityLog data.
    Input: user_age_group, user_goals_count, activity_type
    Output: predicted_mood_improvement (after - before)
    """
    logs = UserActivityLog.objects.all()
    
    if logs.count() < 10:
        # Not enough real data, generate synthetic if requested or skip
        return None

    data = []
    for log in logs:
        # Encode features
        age_map = {'teen': 0, 'adult': 1, 'midlife': 2, 'senior': 3, 'elderly': 4}
        age_val = age_map.get(log.user.age_group, 1)
        
        data.append({
            'age_group': age_val,
            'goals_count': len(log.user.goals or []),
            'activity_type_enc': hash(log.activity_type) % 100,
            'improvement': (log.mood_after or 0) - (log.mood_before or 0)
        })

    df = pd.DataFrame(data)
    X = df[['age_group', 'goals_count', 'activity_type_enc']]
    y = df['improvement']

    rf = RandomForestRegressor(n_estimators=100, random_state=42)
    rf.fit(X, y)

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(rf, MODEL_PATH)
    return rf

def predict_best_tasks(user, candidate_tasks):
    """
    Use the Random Forest to rank candidate tasks.
    candidate_tasks: list of activity_type strings.
    """
    if not os.path.exists(MODEL_PATH):
        # Fallback if model not trained
        return candidate_tasks

    rf = joblib.load(MODEL_PATH)
    
    age_map = {'teen': 0, 'adult': 1, 'midlife': 2, 'senior': 3, 'elderly': 4}
    age_val = age_map.get(user.age_group, 1)
    goals_count = len(user.goals or [])

    predictions = []
    for task_type in candidate_tasks:
        X_pred = pd.DataFrame([{
            'age_group': age_val,
            'goals_count': goals_count,
            'activity_type_enc': hash(task_type) % 100
        }])
        pred_improvement = rf.predict(X_pred)[0]
        predictions.append((task_type, pred_improvement))

    # Sort candidates by predicted improvement
    predictions.sort(key=lambda x: x[1], reverse=True)
    return [p[0] for p in predictions]
