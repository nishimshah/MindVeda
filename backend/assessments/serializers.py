from rest_framework import serializers
from .models import Assessment, AssessmentQuestion


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
