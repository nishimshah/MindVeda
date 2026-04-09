"""
therapy/routing.py

WebSocket URL routing for Django Channels.
URL pattern: ws/chat/<other_user_id>/
"""
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'^ws/chat/(?P<other_id>\d+)/$', consumers.ChatConsumer.as_asgi()),
]
