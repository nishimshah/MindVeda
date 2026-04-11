from django.urls import path
from .views import ProgressView, StatsView, RecommendedGamesView, GameSessionView

urlpatterns = [
    path('', ProgressView.as_view(), name='progress'),
    path('stats/', StatsView.as_view(), name='stats'),
    path('recommended/', RecommendedGamesView.as_view(), name='recommended_games'),
    path('session/', GameSessionView.as_view(), name='game_session'),
]
