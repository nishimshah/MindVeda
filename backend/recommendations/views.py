from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .ml_logic import recommender
from therapy.models import MoodLog

class RecommendationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        last_mood = MoodLog.objects.filter(user=user).first()
        mood_score = last_mood.mood_score if last_mood else 3
        
        goal = user.goals[0] if user.goals else 'general'
        
        recommended_activity = recommender.predict(goal, mood_score)
        
        return Response({
            "goal": goal,
            "mood_detected": mood_score,
            "recommended_activity": recommended_activity,
            "reason": f"Based on your {goal} goal and current mood."
        })
