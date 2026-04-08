from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from .models import User
from analytics.models import Streak

class SignupView(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create streak record (as in Express)
        Streak.objects.get_or_create(user=user)
        
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "token": str(refresh.access_token)
        }, status=status.HTTP_201_CREATED)

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "token": str(refresh.access_token)
        })

class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

# Admin Views
class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin

class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from django.db.models import Count, Avg
        from django.utils import timezone
        import datetime
        
        users_count = User.objects.count()
        from games.models import Progress
        from therapy.models import MoodLog
        
        sessions_count = Progress.objects.count()
        today = timezone.now().date()
        today_active = Progress.objects.filter(created_at__date=today).values('user').distinct().count()
        
        last_7_days = timezone.now() - datetime.timedelta(days=7)
        avg_mood = MoodLog.objects.filter(created_at__gte=last_7_days).aggregate(avg=Avg('mood_score'))['avg'] or 0
        
        return Response({
            "total_users": users_count,
            "total_sessions": sessions_count,
            "today_active": today_active,
            "avg_mood_7d": round(float(avg_mood), 1)
        })
