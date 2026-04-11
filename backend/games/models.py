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

class Game(models.Model):
    CATEGORY_CHOICES = [
        ('adhd', 'ADHD'),
        ('anxiety', 'Anxiety'),
        ('autism', 'Autism'),
        ('general', 'General'),
    ]
    TYPE_CHOICES = [
        ('focus', 'Focus'),
        ('memory', 'Memory'),
        ('calming', 'Calming'),
        ('pattern', 'Pattern'),
        ('reaction', 'Reaction'),
    ]
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    difficulty_level = models.IntegerField(default=1) # 1-10
    stimulation_level = models.IntegerField(default=5) # 1-10
    time_pressure = models.BooleanField(default=False)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.category})"

class GameSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='game_sessions')
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    duration_seconds = models.IntegerField(default=0)
    mood_before = models.IntegerField(null=True, blank=True)
    mood_after = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def improvement(self):
        if self.mood_before is not None and self.mood_after is not None:
            return self.mood_after - self.mood_before
        return 0
