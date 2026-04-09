from django.urls import path
from .views import StreakView, PlanView, UpdateStreakView

urlpatterns = [
    path('', StreakView.as_view(), name='streak'),
    path('today/', PlanView.as_view(), name='daily_plan'),
    path('update/', UpdateStreakView.as_view(), name='update_streak'),
]
