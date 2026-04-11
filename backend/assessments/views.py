from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Assessment, AssessmentQuestion, Question, Option, UserResponse, UserCognitiveProfile
from .serializers import AssessmentSubmitSerializer, AssessmentSerializer, AssessmentQuestionSerializer, QuestionSerializer, UserResponseSerializer, UserCognitiveProfileSerializer

# ─── ONBOARDING & QUESTIONNAIRE SYSTEM ─────────────────────────────────────────

class OnboardingNextQuestionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Find questions the user hasn't answered yet
        answered_ids = UserResponse.objects.filter(user=request.user).values_list('question_id', flat=True)
        next_q = Question.objects.filter(type='onboarding').exclude(id__in=answered_ids).first()
        
        if not next_q:
            # Onboarding done, determine probable condition
            condition = self.determine_condition(request.user)
            return Response({"status": "onboarding_complete", "probable_condition": condition})
            
        serializer = QuestionSerializer(next_q)
        return Response(serializer.data)

    def determine_condition(self, user):
        responses = UserResponse.objects.filter(user=user, question__type='onboarding')
        # Simple heuristic or ML model call
        high_stress = responses.filter(question__category='stress', answer_value__gte=70).exists()
        low_focus = responses.filter(question__category='focus', answer_value__lte=40).exists()
        
        condition = 'general'
        if low_focus: condition = 'adhd'
        elif high_stress: condition = 'anxiety'
        
        # Save condition to user profile
        try:
            profile, _ = UserCognitiveProfile.objects.get_or_create(user=user)
            profile.condition = condition
            profile.save()
        except: pass
        
        return condition

class OnboardingAnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        question_id = request.data.get('question_id')
        option_id = request.data.get('option_id')
        
        try:
            question = Question.objects.get(id=question_id)
            option = Option.objects.get(id=option_id, question=question)
            
            UserResponse.objects.update_or_create(
                user=request.user, question=question,
                defaults={'answer_text': option.text, 'answer_value': option.value}
            )
            return Response({"status": "saved"})
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class QuestionnaireFlowView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = UserCognitiveProfile.objects.get_or_create(user=request.user)
        condition = profile.condition
        
        answered_ids = UserResponse.objects.filter(user=request.user).values_list('question_id', flat=True)
        next_q = Question.objects.filter(type=condition).exclude(id__in=answered_ids).first()
        
        if not next_q:
            # Condition-specific questionnaire done, compute final profile
            self.compute_cognitive_profile(request.user)
            return Response({"status": "flow_complete"})
            
        serializer = QuestionSerializer(next_q)
        return Response(serializer.data)

    def post(self, request):
        return OnboardingAnswerView().post(request)

    def compute_cognitive_profile(self, user):
        profile, _ = UserCognitiveProfile.objects.get_or_create(user=user)
        responses = UserResponse.objects.filter(user=user)
        
        # Simple score computation
        focus_vals = responses.filter(question__category='focus').values_list('answer_value', flat=True)
        stress_vals = responses.filter(question__category='stress').values_list('answer_value', flat=True)
        
        if focus_vals: profile.focus_score = sum(focus_vals) / len(focus_vals)
        if stress_vals: profile.stress_score = sum(stress_vals) / len(stress_vals)
        
        # Determine sensory pref
        pref = responses.filter(question__category='preference').first()
        if pref: profile.stimulation_preference = pref.answer_text
        
        profile.save()

class CognitiveProfileView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserCognitiveProfileSerializer
    
    def get_object(self):
        profile, _ = UserCognitiveProfile.objects.get_or_create(user=self.request.user)
        return profile
from .scoring import calculate_score
from ai_engine.services import suggest_activities
class CheckInStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        already_done = UserResponse.objects.filter(
            user=request.user, 
            question__type='checkin', 
            created_at__date=today
        ).exists()
        
        if already_done:
            return Response({"status": "completed"})
            
        questions = Question.objects.filter(type='checkin')
        serializer = QuestionSerializer(questions, many=True)
        return Response({"status": "pending", "questions": serializer.data})

class CheckInAnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return OnboardingAnswerView().post(request)


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
