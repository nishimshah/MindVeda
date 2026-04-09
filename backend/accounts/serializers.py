from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import (
    User, UserProfile, TherapistProfile,
    TherapistPatientLink
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'name', 'email', 'role', 'role_selected',
            'age_group', 'goals', 'special_needs',
            'onboarding_complete', 'is_admin', 'accessibility_mode', 'session_preference', 'is_linked', 'date_joined'
        )
        read_only_fields = ('id', 'date_joined', 'is_admin')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data.get('name', ''),
            password=validated_data['password']
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get('email', '').strip().lower()
        password = data.get('password')
        
        if not email or not password:
            raise serializers.ValidationError({"error": "Email and password are required."})
            
        user = authenticate(email=email, password=password)
        if user and user.is_active:
            return user
        raise serializers.ValidationError({"error": "Invalid email or password. Please try again."})


class SelectRoleSerializer(serializers.Serializer):
    ROLE_CHOICES = ['individual', 'therapist']
    role = serializers.ChoiceField(choices=ROLE_CHOICES)


# ─────────────────────────────────────────
# PROFILE SERIALIZERS
# ─────────────────────────────────────────

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')




class TherapistProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TherapistProfile
        fields = '__all__'
        read_only_fields = ('user', 'verification_status', 'created_at', 'updated_at')


# ─────────────────────────────────────────
# THERAPIST-PATIENT LINK SERIALIZERS
# ─────────────────────────────────────────

class TherapistPatientLinkSerializer(serializers.ModelSerializer):
    therapist_name = serializers.CharField(source='therapist.name', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)

    class Meta:
        model = TherapistPatientLink
        fields = (
            'id', 'therapist', 'therapist_name', 'user', 'user_name',
            'invite_code', 'status', 'created_at', 'expires_at'
        )
        read_only_fields = ('id', 'invite_code', 'status', 'created_at', 'expires_at', 'therapist', 'user')


class ConnectTherapistSerializer(serializers.Serializer):
    invite_code = serializers.CharField(max_length=20)
