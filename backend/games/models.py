from django.db import models
from django.conf import settings

class Progress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='all_progress')
    activity_type = models.CharField(max_length=50) # training, chat, calm, mood
    game_name = models.CharField(max_length=100, null=True, blank=True)
    score = models.IntegerField(default=0)
    duration_seconds = models.IntegerField(default=0)
    difficulty = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
