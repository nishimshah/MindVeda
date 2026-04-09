"""
accounts/authentication.py

Custom JWT authentication that reads the token from an httpOnly cookie
instead of the Authorization header. Falls back to Bearer header for
backward compatibility during the transition period.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings


class CookieJWTAuthentication(JWTAuthentication):
    """
    Extends SimpleJWT to read the access token from an httpOnly cookie.
    Cookie name is configured via settings.SIMPLE_JWT['AUTH_COOKIE'].
    Falls back to the Authorization Bearer header if the cookie is absent.
    """

    def authenticate(self, request):
        cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE', 'mindveda_access_token')
        raw_token = request.COOKIES.get(cookie_name)

        if raw_token is None:
            # Fall back to standard Bearer header (for mobile / API clients)
            return super().authenticate(request)

        try:
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)
            return user, validated_token
        except Exception:
            return None
