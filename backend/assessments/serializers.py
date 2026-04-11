from rest_framework import serializers
from .models import Assessment, AssessmentQuestion, Question, Option, UserResponse, UserCognitiveProfile

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text', 'value']

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)
    class Meta:
        model = Question
        fields = ['id', 'type', 'text', 'category', 'order', 'options']

class UserResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserResponse
        fields = ['question', 'answer_text', 'answer_value']

class UserCognitiveProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCognitiveProfile
        fields = ['condition', 'focus_score', 'stress_score', 'memory_score', 'sensory_preference', 'stimulation_preference', 'last_updated']


class AssessmentQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentQuestion
        fields = ('question_key', 'question_text', 'scale', 'order')


class AssessmentSubmitSerializer(serializers.Serializer):
    VALID_CONDITIONS = ['anxiety', 'depression', 'adhd', 'stress']
    condition = serializers.ChoiceField(choices=VALID_CONDITIONS)
    responses = serializers.DictField(
        child=serializers.IntegerField(min_value=0, max_value=4),
        allow_empty=False
    )


class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = ('id', 'condition', 'score', 'severity', 'responses', 'notes', 'created_at')
        read_only_fields = fields
