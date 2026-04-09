from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Streak
from .serializers import StreakSerializer
from ai_engine.services import generate_daily_plan
from games.models import Progress

class StreakView(generics.RetrieveAPIView):
    serializer_class = StreakSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        streak, created = Streak.objects.get_or_create(user=self.request.user)
        return streak

class PlanView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        streak, _ = Streak.objects.get_or_create(user=user)
        
        # Get recent activity
        recent = Progress.objects.filter(user=user).order_by('-created_at')[:5]
        
        try:
            profile = user.user_profile
            condition = getattr(profile, 'primary_condition', 'general') or 'general'
        except Exception:
            condition = 'general'

        user_data = {
            "name": user.name,
            "age_group": user.age_group,
            "goals": user.goals,
            "condition": condition,
            "streak": streak.current_streak,
            "recent_activities": [r.game_name or r.activity_type for r in recent],
            "clinical_data": user.clinical_data or {}
        }

        plan = generate_daily_plan(user, user_data)
        
        return Response({
            "plan": plan,
            "streak": streak.current_streak,
            "greeting": f"Welcome back, {user.name}!"
        })

class UpdateStreakView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        streak, _ = Streak.objects.get_or_create(user=request.user)
        # Update logic handled in models or services
        streak.update_streak()
        return Response(StreakSerializer(streak).data)
