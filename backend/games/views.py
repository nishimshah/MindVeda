from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Avg, Count
from django.utils import timezone
from .models import Progress, Game, GameSession
from .serializers import ProgressSerializer, GameSerializer, GameSessionSerializer
from assessments.models import UserCognitiveProfile
from ai_engine.ml_logic import recommend_games

class RecommendedGamesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.cognitive_profile
            condition = profile.condition
        except:
            condition = 'general'
            
        # Get candidate games
        games = Game.objects.filter(category__in=[condition, 'general'])
        
        # Rank them using ML logic
        ranked_games = recommend_games(request.user, games)
        
        serializer = GameSerializer(ranked_games, many=True)
        return Response(serializer.data)

class GameSessionView(generics.CreateAPIView):
    serializer_class = GameSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ProgressView(generics.ListCreateAPIView):
    serializer_class = ProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Progress.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Avg, Count
from django.utils import timezone

class StatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = Progress.objects.filter(user=user)
        
        overview = qs.aggregate(
            total_sessions=Count('id'),
            avg_score=Avg('score')
        )
        
        # Simple weekly mock/calc for now
        weekly = []
        for i in range(7):
            day = timezone.now() - timezone.timedelta(days=i)
            day_qs = qs.filter(created_at__date=day.date())
            weekly.append({
                "date": day.date().isoformat(),
                "sessions": day_qs.count(),
                "avg_score": day_qs.aggregate(Avg('score'))['score__avg'] or 0
            })
            
        return Response({
            "overview": overview,
            "weekly": weekly[::-1]
        })
