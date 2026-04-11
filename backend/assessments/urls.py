from django.urls import path
from .views import (
    AssessmentQuestionsView, SubmitAssessmentView, AssessmentHistoryView,
    OnboardingNextQuestionView, OnboardingAnswerView,
    QuestionnaireFlowView, CognitiveProfileView,
    CheckInStatusView, CheckInAnswerView
)

urlpatterns = [
    path('questions/<str:condition>/', AssessmentQuestionsView.as_view(), name='assessment_questions'),
    path('submit/', SubmitAssessmentView.as_view(), name='assessment_submit'),
    path('history/', AssessmentHistoryView.as_view(), name='assessment_history'),
    
    # New Onboarding & Questionnaire
    path('onboarding/next-question/', OnboardingNextQuestionView.as_view(), name='onboarding_next'),
    path('onboarding/answer/', OnboardingAnswerView.as_view(), name='onboarding_answer'),
    path('questionnaire/next/', QuestionnaireFlowView.as_view(), name='questionnaire_next'),
    path('questionnaire/answer/', OnboardingAnswerView.as_view(), name='questionnaire_answer'),
    path('profile/cognitive/', CognitiveProfileView.as_view(), name='cognitive_profile'),
    path('checkin/status/', CheckInStatusView.as_view(), name='checkin_status'),
    path('checkin/answer/', CheckInAnswerView.as_view(), name='checkin_answer'),
]
