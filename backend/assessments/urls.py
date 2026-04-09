from django.urls import path
from .views import AssessmentQuestionsView, SubmitAssessmentView, AssessmentHistoryView

urlpatterns = [
    path('questions/<str:condition>/', AssessmentQuestionsView.as_view(), name='assessment_questions'),
    path('submit/', SubmitAssessmentView.as_view(), name='assessment_submit'),
    path('history/', AssessmentHistoryView.as_view(), name='assessment_history'),
]
