from django.db import models
from django.conf import settings
from django.utils import timezone

class Streak(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='streak')
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_active = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.user.email} - {self.current_streak} days"
