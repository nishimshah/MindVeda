from django.db import models
from django.conf import settings

class MoodLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mood_logs')
    mood_score = models.IntegerField() # 1-5
    note = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

class ChatMessage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_messages')
    role = models.CharField(max_length=20) # user, assistant
    content = models.TextField()
    sentiment = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

class TherapistNote(models.Model):
    therapist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='authored_notes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='therapist_notes')
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
