from django.urls import path
from .views import (
    # Auth
    SignupView, LoginView, LogoutView, MeView, SelectRoleView,
    # User / Individual
    UserProfileView, UserGoalsView, UserDashboardView, ConnectTherapistView,
    UserTaskListView, UpdateTaskStatusView,
    GoalView, GoalDetailView,
    # Therapist
    TherapistVerifyView, TherapistProfileView, GenerateInviteView,
    TherapistDashboardView, PatientDetailView, UpdatePatientConditionView,
    SessionNotesView, SessionNoteDetailView, TherapistAnalyticsView,
    # Tasks & Notifications
    AssignTaskView,
    NotificationListView, MarkNotificationReadView,
    # Admin
    AdminUserListView, AdminStatsView,
)

urlpatterns = [
    # ─── Auth ────────────────────────────────────────────────────────────
    path('signup/',      SignupView.as_view(),      name='signup'),
    path('login/',       LoginView.as_view(),       name='login'),
    path('logout/',      LogoutView.as_view(),      name='logout'),
    path('me/',          MeView.as_view(),          name='me'),
    path('select-role/', SelectRoleView.as_view(),  name='select_role'),

    # ─── User (individual) ───────────────────────────────────────────────
    path('user/profile/',           UserProfileView.as_view(),    name='user_profile'),
    path('user/goals/',             UserGoalsView.as_view(),      name='user_goals'),
    path('user/goals-list/',        GoalView.as_view(),           name='goal_list'),
    path('user/goals-list/<int:pk>/', GoalDetailView.as_view(),   name='goal_detail'),
    path('user/dashboard/',         UserDashboardView.as_view(),  name='user_dashboard'),
    path('user/connect-therapist/', ConnectTherapistView.as_view(), name='connect_therapist'),
    path('user/tasks/',             UserTaskListView.as_view(),   name='user_tasks'),
    path('user/tasks/<int:pk>/',    UpdateTaskStatusView.as_view(), name='update_task_status'),


    # ─── Therapist ───────────────────────────────────────────────────────
    path('therapist/verify/',                     TherapistVerifyView.as_view(),    name='therapist_verify'),
    path('therapist/profile/',                    TherapistProfileView.as_view(),   name='therapist_profile'),
    path('therapist/generate-invite/',            GenerateInviteView.as_view(),     name='generate_invite'),
    path('therapist/dashboard/',                  TherapistDashboardView.as_view(), name='therapist_dashboard'),
    path('therapist/analytics/',                  TherapistAnalyticsView.as_view(), name='therapist_analytics'),
    path('therapist/patient/<int:patient_id>/',   PatientDetailView.as_view(),      name='patient_detail'),
    path('therapist/assign-task/',                AssignTaskView.as_view(),         name='assign_task'),
    path('therapist/update-condition/',           UpdatePatientConditionView.as_view(), name='update_condition'),
    path('therapist/notes/<int:patient_id>/',     SessionNotesView.as_view(),       name='session_notes'),
    path('therapist/notes/note/<int:pk>/',        SessionNoteDetailView.as_view(),  name='session_note_detail'),

    # ─── Notifications ───────────────────────────────────────────────────
    path('notifications/',              NotificationListView.as_view(),      name='notifications'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark_notification_read'),

    # ─── Admin ───────────────────────────────────────────────────────────
    path('admin/users/', AdminUserListView.as_view(), name='admin_users'),
    path('admin/stats/', AdminStatsView.as_view(),    name='admin_stats'),
]
