"""
URL configuration for mindveda_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.utils import timezone

def health_check(request):
    return JsonResponse({"status": "ok", "timestamp": timezone.now().isoformat()})

urlpatterns = [
    path('api/health/', health_check),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/admin/', include('accounts.urls')), # This handles /api/admin/users and /api/admin/stats
    path('api/therapy/', include('therapy.urls')),
    path('api/chat/', include('therapy.urls')),
    path('api/mood/', include('therapy.urls')),
    path('api/games/', include('games.urls')),
    path('api/progress/', include('games.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/plan/', include('analytics.urls')),
    path('api/streak/', include('analytics.urls')),
    path('api/recommendations/', include('recommendations.urls')),
]
