from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Assessment, AssessmentQuestion
from .serializers import AssessmentSubmitSerializer, AssessmentSerializer, AssessmentQuestionSerializer
from .scoring import calculate_score
from ai_engine.services import suggest_activities


class AssessmentQuestionsView(APIView):
    """
    GET /api/assessment/questions/<condition>/
    Returns the ordered question bank for a given condition from the database.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, condition):
        valid_conditions = ['anxiety', 'depression', 'adhd', 'stress']
        if condition not in valid_conditions:
            return Response(
                {"error": f"Invalid condition. Choose from: {', '.join(valid_conditions)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        questions = AssessmentQuestion.objects.filter(condition=condition, is_active=True)
        serializer = AssessmentQuestionSerializer(questions, many=True)
        return Response({
            "condition": condition,
            "questions": serializer.data,
            "total": questions.count(),
        })


class SubmitAssessmentView(APIView):
    """
    POST /api/assessment/submit/
    Body: { "condition": "anxiety"|"depression"|"adhd"|"stress", "responses": {"q1": 2, ...} }
    Returns scored result with severity and suggested activities.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AssessmentSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        condition = serializer.validated_data['condition']
        responses = serializer.validated_data['responses']

        score, severity = calculate_score(condition, responses)

        assessment = Assessment.objects.create(
            user=request.user,
            condition=condition,
            responses=responses,
            score=score,
            severity=severity,
        )

        # Update user primary condition on their profile
        try:
            profile = request.user.user_profile
            profile.primary_condition = condition
            profile.severity = severity
            profile.save(update_fields=['primary_condition', 'severity', 'updated_at'])
        except Exception:
            pass

        activities = suggest_activities(condition)

        # Crisis check for severe results
        crisis_alert = None
        if severity in ('severe', 'moderately_severe') and condition == 'depression':
            crisis_alert = {
                "type": "high_severity",
                "message": "Your results indicate significant distress. Please consider speaking to a mental health professional.",
                "helplines": [
                    {"name": "iCall", "number": "9152987821"},
                    {"name": "Vandrevala Foundation", "number": "1860-2662-345"},
                ]
            }

        return Response({
            "assessment_id": assessment.id,
            "condition": condition,
            "score": score,
            "severity": severity,
            "suggested_activities": activities[:3],
            "crisis_alert": crisis_alert,
            "message": f"Assessment completed. Your {condition} level is '{severity}'.",
        }, status=status.HTTP_201_CREATED)


class AssessmentHistoryView(generics.ListAPIView):
    """GET /api/assessment/history/ — Returns all assessments for the current user."""
    serializer_class = AssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Assessment.objects.filter(user=self.request.user)
