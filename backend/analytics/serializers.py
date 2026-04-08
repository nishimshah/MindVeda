from rest_framework import serializers
from .models import Streak

class StreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = Streak
        fields = '__all__'
        read_only_fields = ('user', 'last_active')
