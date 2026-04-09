"""
mindveda_project/asgi.py

ASGI configuration for MindVeda. Handles both HTTP and WebSocket connections.
Django Channels is used to route WebSocket traffic for real-time therapist-patient chat.
"""
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
import therapy.routing
from therapy.middleware import JWTAuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindveda_project.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    # Standard HTTP requests — handled by Django
    'http': django_asgi_app,

    # WebSocket connections — authenticated via JWT cookie middleware
    'websocket': JWTAuthMiddlewareStack(
        URLRouter(
            therapy.routing.websocket_urlpatterns
        )
    ),
})
