from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.postgres.fields import ArrayField

class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_admin', True)
        return self.create_user(email, name, password, **extra_fields)

class User(AbstractUser):
    ROLE_CHOICES = [
        ('individual', 'Individual'),
        ('therapist', 'Therapist'),
    ]

    AGE_GROUP_CHOICES = [
        ('teen', 'Teen'),
        ('adult', 'Adult'),
        ('senior', 'Senior'),
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='individual')
    age_group = models.CharField(max_length=20, choices=AGE_GROUP_CHOICES, default='adult')
    goals = ArrayField(models.CharField(max_length=100), default=list, blank=True)
    special_needs = ArrayField(models.CharField(max_length=100), default=list, blank=True)
    onboarding_complete = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    accessibility_mode = models.CharField(max_length=20, default='none')
    role_selected = models.BooleanField(default=False)
    session_preference = models.CharField(max_length=20, default='self_guided')
    clinical_data = models.JSONField(default=dict, blank=True)

    # Use email as username
    username = None
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    objects = UserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def is_linked(self):
        """Returns True if this user is linked to a therapist (active link)."""
        return TherapistPatientLink.objects.filter(user=self, status='active').exists()


# ─────────────────────────────────────────
# ROLE PROFILES
# ─────────────────────────────────────────

class UserProfile(models.Model):
    """Extended profile for individual users."""
    SLEEP_CHOICES = [
        ('poor', 'Poor (<5h)'),
        ('fair', 'Fair (5-7h)'),
        ('good', 'Good (7-9h)'),
        ('excellent', 'Excellent (>9h)'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user_profile')
    age_group = models.CharField(max_length=20, blank=True)
    occupation = models.CharField(max_length=100, blank=True)
    sleep_pattern = models.CharField(max_length=20, choices=SLEEP_CHOICES, blank=True)
    bio = models.TextField(blank=True)
    primary_condition = models.CharField(max_length=50, blank=True)
    severity = models.CharField(max_length=20, blank=True)
    goals = ArrayField(models.CharField(max_length=100), default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile: {self.user.email}"


    def __str__(self):
        return f"Profile: {self.user.email}"


class TherapistProfile(models.Model):
    """Profile for users with role=therapist."""
    VERIFICATION_STATUS = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='therapist_profile')
    license_number = models.CharField(max_length=100, unique=True)
    specialization = models.CharField(max_length=100, blank=True)
    years_of_experience = models.IntegerField(default=0)
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS, default='pending')
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Therapist: {self.user.email} ({self.verification_status})"


# ─────────────────────────────────────────
# THERAPIST–PATIENT LINKING
# ─────────────────────────────────────────

class TherapistPatientLink(models.Model):
    """Links a therapist to a patient via a time-limited invite code."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('revoked', 'Revoked'),
    ]

    therapist = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='therapist_links',
        limit_choices_to={'role': 'therapist'}
    )
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='patient_links'
    )
    invite_code = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.invite_code} ({self.status})"

    @property
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at


# ─────────────────────────────────────────
# LEGACY SUPPORT MODELS
# ─────────────────────────────────────────

class Relationship(models.Model):
    therapist = models.ForeignKey(User, on_delete=models.CASCADE, related_name='therapist_relations', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_relations', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['therapist', 'user']]




class UserMode(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='modes')
    adhd_mode = models.BooleanField(default=False)
    autism_mode = models.BooleanField(default=False)
    anxiety_mode = models.BooleanField(default=False)
    dyslexia_mode = models.BooleanField(default=False)
    elder_mode = models.BooleanField(default=False)
    current_mode = models.CharField(max_length=20, default='general')
    last_updated = models.DateTimeField(auto_now=True)


# ─────────────────────────────────────────
# TASKS & NOTIFICATIONS
# ─────────────────────────────────────────

class TherapistTask(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('overdue', 'Overdue'),
    ]

    therapist = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_tasks')
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patient_tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Task: {self.title} for {self.patient.email}"


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    link = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"Notification for {self.user.email}: {self.title}"


# ─────────────────────────────────────────
# SESSION NOTES (Therapist-authored)
# ─────────────────────────────────────────

class SessionNotes(models.Model):
    """Therapist session notes for a linked patient. Private by default."""
    therapist    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='session_note_author')
    patient      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='session_note_subject')
    title        = models.CharField(max_length=200)
    content      = models.TextField()
    tags         = ArrayField(models.CharField(max_length=50), default=list, blank=True)
    session_date = models.DateField()
    is_private   = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-session_date']

    def __str__(self):
        return f"Note by {self.therapist.name} for {self.patient.name} on {self.session_date}"
