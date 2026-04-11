from django.db import models
from django.conf import settings


class AssessmentQuestion(models.Model):
    """Database-driven question bank for all assessment types."""
    CONDITION_CHOICES = [
        ('anxiety', 'Anxiety (GAD-7)'),
        ('depression', 'Depression (PHQ-9)'),
        ('adhd', 'ADHD Screening'),
        ('stress', 'Stress (PSS)'),
    ]
    SCALE_CHOICES = [
        ('0-3', '0 to 3 (GAD-7 / PHQ-9 style)'),
        ('1-5', '1 to 5'),
        ('0-4', '0 to 4'),
        ('never-always', 'Never to Always'),
    ]

    condition     = models.CharField(max_length=30, choices=CONDITION_CHOICES)
    question_key  = models.CharField(max_length=10)   # e.g., 'q1', 'q2'
    question_text = models.TextField()
    scale         = models.CharField(max_length=20, choices=SCALE_CHOICES, default='0-3')
    order         = models.IntegerField(default=0)
    is_active     = models.BooleanField(default=True)

    class Meta:
        ordering = ['condition', 'order']
        unique_together = [['condition', 'question_key']]

    def __str__(self):
        return f"[{self.condition}] {self.question_key}: {self.question_text[:60]}"


class Assessment(models.Model):
    """Stores a completed clinical screening assessment for a user."""

    CONDITION_CHOICES = [
        ('anxiety', 'Anxiety (GAD-7)'),
        ('depression', 'Depression (PHQ-9)'),
        ('adhd', 'ADHD Screening'),
        ('stress', 'Stress (PSS)'),
    ]

    SEVERITY_CHOICES = [
        ('minimal', 'Minimal'),
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('moderately_severe', 'Moderately Severe'),
        ('severe', 'Severe'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assessments'
    )
    condition  = models.CharField(max_length=30, choices=CONDITION_CHOICES)
    responses  = models.JSONField(help_text="Raw answer key-value pairs from the questionnaire")
    score      = models.IntegerField(default=0)
    severity   = models.CharField(max_length=25, choices=SEVERITY_CHOICES, blank=True)
    notes      = models.TextField(blank=True, help_text="Auto-generated or therapist notes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} — {self.condition} ({self.severity})"

class Question(models.Model):
    TYPE_CHOICES = [
        ('onboarding', 'General Onboarding'),
        ('adhd', 'ADHD Specific'),
        ('anxiety', 'Anxiety Specific'),
        ('autism', 'Autism Specific'),
        ('checkin', 'Daily Check-in'),
    ]
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    text = models.TextField()
    order = models.IntegerField(default=0)
    category = models.CharField(max_length=50, blank=True) # focus, sleep, routine, etc.

    class Meta:
        ordering = ['type', 'order']

    def __str__(self):
        return f"({self.type}) {self.text[:50]}"

class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=200)
    value = models.IntegerField(default=0) # weight for scoring
    next_question = models.ForeignKey(Question, on_delete=models.SET_NULL, null=True, blank=True, related_name='previous_options')

    def __str__(self):
        return f"{self.question.id} -> {self.text}"

class UserResponse(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer_text = models.CharField(max_length=200)
    answer_value = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class UserCognitiveProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cognitive_profile')
    condition = models.CharField(max_length=20, default='general') # ADHD, anxiety, autism, general
    focus_score = models.IntegerField(default=50)
    stress_score = models.IntegerField(default=50)
    memory_score = models.IntegerField(default=50)
    sensory_preference = models.CharField(max_length=50, blank=True)
    stimulation_preference = models.CharField(max_length=50, blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile: {self.user.email} ({self.condition})"
