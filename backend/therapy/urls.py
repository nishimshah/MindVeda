from django.urls import path
from .views import ChatView, ChatHistoryView, MoodLogView

urlpatterns = [
    path('chat/', ChatView.as_view(), name='chat'),
    path('chat/history/', ChatHistoryView.as_view(), name='chat_history'),
    path('mood/', MoodLogView.as_view(), name='mood_log'),
]
