from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse
from django.utils import timezone


def health_check(request):
    return JsonResponse({"status": "ok", "timestamp": timezone.now().isoformat()})


urlpatterns = [
    # Health
    path('api/health/', health_check),

    # Django Admin
    path('admin/', admin.site.urls),

    # ─── Auth (signup, login, logout, me, select-role) ───────────────────
    path('api/auth/', include('accounts.urls')),

    # ─── Role-based APIs (user, parent, therapist, admin, notifications) ─
    path('api/', include('accounts.urls')),

    # ─── Assessment ──────────────────────────────────────────────────────
    path('api/assessment/', include('assessments.urls')),

    # ─── Therapy (chat + mood) ───────────────────────────────────────────
    path('api/', include('therapy.urls')),

    # ─── Games + Progress ────────────────────────────────────────────────
    path('api/games/', include('games.urls')),
    path('api/progress/', include('games.urls')),

    # ─── Analytics + Streaks + Plan ──────────────────────────────────────
    path('api/analytics/', include('analytics.urls')),
    path('api/plan/', include('analytics.urls')),
    path('api/streak/', include('analytics.urls')),

    # ─── Recommendations (ML) ────────────────────────────────────────────
    path('api/recommendations/', include('recommendations.urls')),
]
