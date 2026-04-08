from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Streak
from .serializers import StreakSerializer
from .services import get_daily_plan, get_time_of_day
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
        
        plan = get_daily_plan(user, streak.current_streak, recent)
        
        return Response({
            "plan": plan,
            "streak": streak.current_streak,
            "greeting": f"Good {get_time_of_day()}, {user.name}!"
        })
