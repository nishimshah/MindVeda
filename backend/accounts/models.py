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
        ('child', 'Child'),
        ('parent', 'Parent'),
        ('therapist', 'Therapist'),
    ]
    
    AGE_GROUP_CHOICES = [
        ('child', 'Child'),
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
    
    # Use email as username
    username = None
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    objects = UserManager()

    def __str__(self):
        return self.email

class Relationship(models.Model):
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='parent_relations', null=True, blank=True)
    child = models.ForeignKey(User, on_delete=models.CASCADE, related_name='child_relations', null=True, blank=True)
    therapist = models.ForeignKey(User, on_delete=models.CASCADE, related_name='therapist_relations', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_relations', null=True, blank=True, help_text="For therapist-user link")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Replicating original UNIQUE constraints
        unique_together = [['parent', 'child'], ['therapist', 'user']]

class ParentalControl(models.Model):
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='parent_controls')
    child = models.OneToOneField(User, on_delete=models.CASCADE, related_name='parental_controls')
    screen_time_limit = models.IntegerField(default=60) # minutes
    allowed_features = ArrayField(models.CharField(max_length=50), default=list)
    difficulty_level = models.CharField(max_length=20, default='medium')
    last_updated = models.DateTimeField(auto_now=True)

class UserMode(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='modes')
    adhd_mode = models.BooleanField(default=False)
    autism_mode = models.BooleanField(default=False)
    anxiety_mode = models.BooleanField(default=False)
    dyslexia_mode = models.BooleanField(default=False)
    elder_mode = models.BooleanField(default=False)
    current_mode = models.CharField(max_length=20, default='general')
    last_updated = models.DateTimeField(auto_now=True)
