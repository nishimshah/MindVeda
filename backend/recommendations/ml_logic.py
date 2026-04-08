import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib
import os
from django.conf import settings

# Sample data for training (in a real scenario, this would be from a DB or CSV)
DATA = [
    {'goal': 'focus', 'mood': 2, 'activity': 'Pattern Recognition'},
    {'goal': 'focus', 'mood': 4, 'activity': 'Memory Match'},
    {'goal': 'stress', 'mood': 1, 'activity': 'Breathing Exercise'},
    {'goal': 'stress', 'mood': 3, 'activity': 'Calm Music'},
    {'goal': 'productivity', 'mood': 5, 'activity': 'Reaction Game'},
    {'goal': 'memory', 'mood': 2, 'activity': 'Language Puzzle'},
]

class RecommendationModel:
    def __init__(self):
        self.model_path = os.path.join(settings.BASE_DIR, 'recommendations', 'rf_model.joblib')
        self.goal_mapping = {'focus': 0, 'stress': 1, 'productivity': 2, 'memory': 3, 'general': 4}
        self.inv_activity_mapping = {0: 'Pattern Recognition', 1: 'Breathing Exercise', 2: 'Reaction Game', 3: 'Memory Match', 4: 'Language Puzzle', 5: 'Calm Music'}
        
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
        else:
            self.train_initial_model()

    def train_initial_model(self):
        df = pd.DataFrame(DATA)
        df['goal_encoded'] = df['goal'].map(self.goal_mapping)
        X = df[['goal_encoded', 'mood']]
        
        # Activity mapping for training
        activity_mapping = {v: k for k, v in self.inv_activity_mapping.items()}
        y = df['activity'].map(activity_mapping)
        
        self.model = RandomForestClassifier(n_estimators=10)
        self.model.fit(X, y)
        joblib.dump(self.model, self.model_path)

    def predict(self, goal, mood_score):
        goal_encoded = self.goal_mapping.get(goal, 4)
        prediction = self.model.predict([[goal_encoded, mood_score]])
        return self.inv_activity_mapping.get(prediction[0], 'Mindful Chat')

# Singleton instance
recommender = RecommendationModel()
