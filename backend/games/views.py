from rest_framework import generics, permissions
from .models import Progress
from .serializers import ProgressSerializer

class ProgressView(generics.ListCreateAPIView):
    serializer_class = ProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Progress.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
