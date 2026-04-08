from rest_framework import serializers
from .models import MoodLog, ChatMessage, TherapistNote

class MoodLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoodLog
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

class TherapistNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TherapistNote
        fields = '__all__'
        read_only_fields = ('therapist', 'created_at')
