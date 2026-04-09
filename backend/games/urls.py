from django.urls import path
from .views import ProgressView, StatsView

urlpatterns = [
    path('', ProgressView.as_view(), name='progress'),
    path('stats/', StatsView.as_view(), name='stats'),
]
