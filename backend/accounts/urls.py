from django.urls import path
from .views import SignupView, LoginView, MeView, AdminUserListView, AdminStatsView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    path('admin/users/', AdminUserListView.as_view(), name='admin_users'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin_stats'),
]
