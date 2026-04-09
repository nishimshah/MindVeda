"""
therapy/middleware.py

Custom WebSocket middleware that authenticates users via JWT access token
stored in an httpOnly cookie. Django Channels' default AuthMiddlewareStack
only supports session-based auth, which doesn't work with JWT.

The middleware reads the 'access_token' cookie from the WebSocket handshake
request, validates it using simplejwt, and injects the authenticated user
into the request scope.
"""
from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser


@database_sync_to_async
def get_user_from_token(token_str):
    """Validate a JWT access token string and return the User, or AnonymousUser."""
    try:
        from rest_framework_simplejwt.tokens import AccessToken
        from accounts.models import User

        token = AccessToken(token_str)
        user_id = token.get('user_id')
        return User.objects.get(id=user_id)
    except Exception:
        return AnonymousUser()


class JWTAuthMiddleware:
    """
    Extracts the JWT access token from the 'access_token' cookie
    (or 'token' query param as fallback) and authenticates the WS user.
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Extract cookies from headers
        headers = dict(scope.get('headers', []))
        cookie_header = headers.get(b'cookie', b'').decode('utf-8')

        token_str = None

        # 1. Try cookie first (httpOnly JWT)
        for part in cookie_header.split(';'):
            part = part.strip()
            if part.startswith('mindveda_access_token='):
                token_str = part[len('mindveda_access_token='):]
                break

        # 2. Fallback: query string ?token=xxx (for dev convenience)
        if not token_str:
            query_string = scope.get('query_string', b'').decode()
            params = parse_qs(query_string)
            token_list = params.get('token', [])
            if token_list:
                token_str = token_list[0]

        if token_str:
            scope['user'] = await get_user_from_token(token_str)
        else:
            scope['user'] = AnonymousUser()

        return await self.inner(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    """Convenience wrapper — use instead of AuthMiddlewareStack."""
    return JWTAuthMiddleware(inner)
