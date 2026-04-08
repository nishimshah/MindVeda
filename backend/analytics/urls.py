from django.urls import path
from .views import StreakView, PlanView

urlpatterns = [
    path('streak/', StreakView.as_view(), name='streak'),
    path('plan/today/', PlanView.as_view(), name='daily_plan'),
]
