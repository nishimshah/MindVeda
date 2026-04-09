from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class Streak(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='streak')
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_active = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.user} - {self.current_streak} days"

    def update_streak(self):
        today = timezone.now().date()
        if self.last_active == today:
            return
        yesterday = today - timezone.timedelta(days=1)
        if self.last_active == yesterday:
            self.current_streak += 1
        else:
            self.current_streak = 1
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak
        self.last_active = today
        self.save()


# ─────────────────────────────────────────
# GOALS
# ─────────────────────────────────────────

class Goal(models.Model):
    CATEGORY_CHOICES = [
        ('mental', 'Mental Health'),
        ('physical', 'Physical Health'),
        ('social', 'Social'),
        ('career', 'Career'),
        ('other', 'Other'),
    ]
    user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals_list')
    title        = models.CharField(max_length=200)
    description  = models.TextField(blank=True)
    category     = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='mental')
    target_date  = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['is_completed', '-created_at']

    def __str__(self):
        return f"Goal: {self.title} ({self.user})"

class UserActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    activity_type = models.CharField(max_length=50) # 'breathing', 'game', 'chat', etc.
    activity_name = models.CharField(max_length=100)
    mood_before = models.IntegerField(null=True, blank=True)
    mood_after = models.IntegerField(null=True, blank=True)
    duration_seconds = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.activity_name} ({self.activity_type})"


