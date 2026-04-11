import uuid
from datetime import timedelta
from django.utils import timezone

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    User, UserProfile, TherapistProfile,
    TherapistPatientLink, SessionNotes,
    TherapistTask, Notification
)
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    SelectRoleSerializer, UserProfileSerializer,
    TherapistProfileSerializer,
    TherapistPatientLinkSerializer, ConnectTherapistSerializer,
)
from ai_engine.services import generate_daily_plan, analyze_mood, suggest_activities


# ─────────────────────────────────────────
# PERMISSIONS
# ─────────────────────────────────────────

class IsTherapist(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'therapist'




class IsIndividual(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'individual'


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


class IsOnboarded(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.onboarding_complete


class IsTherapistOfPatient(permissions.BasePermission):
    """Object-level: only the therapist linked to this patient may access."""
    def has_object_permission(self, request, view, obj):
        from .models import TherapistPatientLink
        return TherapistPatientLink.objects.filter(
            therapist=request.user, user=obj, status='active'
        ).exists()




def _get_redirect(role: str) -> str:
    mapping = {
        'individual': '/dashboard',
        'therapist': '/dashboard',
    }
    return mapping.get(role, '/dashboard')


def _set_auth_cookies(response, access_token: str, refresh_token: str):
    """Set JWT tokens as httpOnly cookies on a Response object."""
    from django.conf import settings
    jwt_settings = settings.SIMPLE_JWT
    secure = jwt_settings.get('AUTH_COOKIE_SECURE', False)
    samesite = jwt_settings.get('AUTH_COOKIE_SAMESITE', 'Lax')

    response.set_cookie(
        key=jwt_settings.get('AUTH_COOKIE', 'mindveda_access_token'),
        value=access_token,
        max_age=int(jwt_settings['ACCESS_TOKEN_LIFETIME'].total_seconds()),
        httponly=True,
        secure=secure,
        samesite=samesite,
        path='/',
    )
    response.set_cookie(
        key=jwt_settings.get('AUTH_COOKIE_REFRESH', 'mindveda_refresh_token'),
        value=refresh_token,
        max_age=int(jwt_settings['REFRESH_TOKEN_LIFETIME'].total_seconds()),
        httponly=True,
        secure=secure,
        samesite=samesite,
        path='/',
    )


# ─────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────

class SignupView(generics.GenericAPIView):
    """POST /api/auth/signup/"""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Bootstrap streak record
        from analytics.models import Streak
        Streak.objects.get_or_create(user=user)

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response = Response({
            "user": UserSerializer(user).data,
            "role": user.role,
            "next_step": "select_role",
            "message": "Account created. Please select your role to continue.",
        }, status=status.HTTP_201_CREATED)

        _set_auth_cookies(response, str(refresh.access_token), str(refresh))
        return response


class LoginView(generics.GenericAPIView):
    """POST /api/auth/login/"""
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data

        refresh = RefreshToken.for_user(user)

        response = Response({
            "user": UserSerializer(user).data,
            "role": user.role,
            "redirect_to": _get_redirect(user.role),
        })

        _set_auth_cookies(response, str(refresh.access_token), str(refresh))
        return response


class LogoutView(APIView):
    """POST /api/auth/logout/ — clears httpOnly auth cookies."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        response = Response({"message": "Logged out successfully."})
        response.delete_cookie('mindveda_access_token')
        response.delete_cookie('mindveda_refresh_token')
        return response


class MeView(generics.RetrieveAPIView):
    """GET /api/auth/me/"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class SelectRoleView(APIView):
    """
    POST /api/auth/select-role/
    Body: { "role": "individual" | "parent" | "therapist" }
    Called once after signup to assign a role.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SelectRoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role = serializer.validated_data['role']

        user = request.user
        if user.role_selected:
            return Response(
                {"error": "Role already selected. Please contact support to change it."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.role = role
        user.role_selected = True
        user.save(update_fields=['role', 'role_selected'])

        return Response({
            "message": f"Role set to '{role}' successfully.",
            "role": role,
            "redirect_to": _get_redirect(role),
            "next_step": "complete_profile",
        })


# ─────────────────────────────────────────
# USER (INDIVIDUAL) FLOW
# ─────────────────────────────────────────

class UserProfileView(APIView):
    """
    POST /api/user/profile/ — Create/update profile
    GET  /api/user/profile/ — Retrieve profile
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response(UserProfileSerializer(profile).data)

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Sync to User model
        user = request.user
        age_group = request.data.get('age_group')
        goals = request.data.get('goals')
        special_needs = request.data.get('special_needs')
        session_preference = request.data.get('session_preference')
        clinical_data = request.data.get('clinical_data')
        
        if age_group: user.age_group = age_group
        if goals: user.goals = goals
        if special_needs: user.special_needs = special_needs
        if session_preference: user.session_preference = session_preference
        if clinical_data: user.clinical_data = clinical_data
        
        if request.data.get('onboarding_complete'):
            user.onboarding_complete = True
            
        user.save(update_fields=['age_group', 'goals', 'special_needs', 'session_preference', 'clinical_data', 'onboarding_complete'])
        
        return Response({
            "profile": serializer.data,
            "user": UserSerializer(user).data,
            "next_step": "dashboard",
        })


class UserGoalsView(APIView):
    """POST /api/user/goals/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        goals = request.data.get('goals', [])
        if not isinstance(goals, list):
            return Response({"error": "Goals must be a list."}, status=status.HTTP_400_BAD_REQUEST)

        request.user.goals = goals
        request.user.save(update_fields=['goals'])

        try:
            profile = request.user.user_profile
            profile.goals = goals
            profile.save(update_fields=['goals', 'updated_at'])
        except Exception:
            pass

        return Response({"message": "Goals updated.", "goals": goals})


class UserDashboardView(APIView):
    """GET /api/user/dashboard/"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        from analytics.models import Streak
        from therapy.models import MoodLog

        streak, _ = Streak.objects.get_or_create(user=user)
        last_mood = MoodLog.objects.filter(user=user).first()

        try:
            profile = user.user_profile
            condition = profile.primary_condition or 'general'
        except Exception:
            condition = 'general'

        therapist_link = TherapistPatientLink.objects.filter(
            user=user, status='active'
        ).select_related('therapist').first()

        user_data = {
            "name": user.name,
            "age_group": user.age_group,
            "goals": user.goals,
            "condition": condition,
            "streak": streak.current_streak,
            "recent_activities": [],
        }

        daily_plan = generate_daily_plan(user, user_data)
        activities = suggest_activities(condition)
        mood_result = analyze_mood(last_mood.note or '' if last_mood else '')

        return Response({
            "greeting": f"Welcome back, {user.name}!",
            "streak": streak.current_streak,
            "daily_plan": daily_plan,
            "recommended_activities": activities,
            "mood_summary": {
                "last_mood_score": last_mood.mood_score if last_mood else None,
                "sentiment": mood_result.get("mood"),
            },
            "therapist_connected": therapist_link is not None,
            "therapist_name": therapist_link.therapist.name if therapist_link else None,
            "therapist_id": therapist_link.therapist.id if therapist_link else None,
        })


class ConnectTherapistView(APIView):
    """
    POST /api/user/connect-therapist/
    Body: { "invite_code": "THERA-XXXX" }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ConnectTherapistSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data['invite_code'].upper()
        user = request.user

        # Validate the code
        try:
            link = TherapistPatientLink.objects.get(invite_code=code)
        except TherapistPatientLink.DoesNotExist:
            return Response({"error": "Invalid invite code."}, status=status.HTTP_404_NOT_FOUND)

        if link.therapist == user:
            return Response({"error": "You cannot link with your own invite code."}, status=status.HTTP_400_BAD_REQUEST)

        if link.is_expired:
            link.status = 'expired'
            link.save(update_fields=['status'])
            return Response({"error": "This invite code has expired."}, status=status.HTTP_410_GONE)

        if link.status == 'active':
            return Response({"error": "This invite code has already been used."}, status=status.HTTP_400_BAD_REQUEST)

        if link.status not in ('pending',):
            return Response({"error": f"Code cannot be used (status: {link.status})."}, status=status.HTTP_400_BAD_REQUEST)

        # Connect the user
        link.user = user
        link.status = 'active'
        link.save(update_fields=['user', 'status'])

        return Response({
            "message": "Connected to therapist successfully.",
            "therapist_name": link.therapist.name,
            "user": UserSerializer(user).data
        })


# ─────────────────────────────────────────


# ─────────────────────────────────────────
# THERAPIST FLOW
# ─────────────────────────────────────────

class TherapistVerifyView(APIView):
    """POST /api/therapist/verify/ — Submit license for verification."""
    permission_classes = [IsTherapist]

    def post(self, request):
        profile, _ = TherapistProfile.objects.get_or_create(
            user=request.user,
            defaults={'license_number': request.data.get('license_number', '')}
        )
        serializer = TherapistProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "message": "Verification request submitted.",
            "status": profile.verification_status,
            "profile": TherapistProfileSerializer(profile).data,
        })


class TherapistProfileView(APIView):
    """POST/GET /api/therapist/profile/"""
    permission_classes = [IsTherapist]

    def get(self, request):
        profile, _ = TherapistProfile.objects.get_or_create(
            user=request.user,
            defaults={'license_number': f"PENDING-{request.user.id}"}
        )
        return Response(TherapistProfileSerializer(profile).data)

    def post(self, request):
        profile, _ = TherapistProfile.objects.get_or_create(
            user=request.user,
            defaults={'license_number': request.data.get('license_number', f"PENDING-{request.user.id}")}
        )
        serializer = TherapistProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Mark user onboarding as complete
        user = request.user
        user.onboarding_complete = True
        user.save(update_fields=['onboarding_complete'])

        return Response({
            "profile": serializer.data,
            "user": UserSerializer(user).data
        })


class GenerateInviteView(APIView):
    """
    POST /api/therapist/generate-invite/
    Generates a unique, 48h-expiring invite code for a therapist.
    """
    permission_classes = [IsTherapist]

    def post(self, request):
        # Generate THERA-XXXX format code
        code = f"THERA-{uuid.uuid4().hex[:6].upper()}"
        expires_at = timezone.now() + timedelta(hours=48)

        link = TherapistPatientLink.objects.create(
            therapist=request.user,
            invite_code=code,
            status='pending',
            expires_at=expires_at,
        )

        return Response({
            "invite_code": code,
            "expires_at": expires_at.isoformat(),
            "expires_in": "48h",
            "link_id": link.id,
        }, status=status.HTTP_201_CREATED)


class TherapistDashboardView(APIView):
    """GET /api/therapist/dashboard/"""
    permission_classes = [IsTherapist]

    def get(self, request):
        from assessments.models import Assessment
        from therapy.models import MoodLog

        links = TherapistPatientLink.objects.filter(
            therapist=request.user, status='active'
        ).select_related('user')

        patients = []
        for link in links:
            patient = link.user
            if not patient:
                continue

            last_mood = MoodLog.objects.filter(user=patient).first()
            last_assessment = Assessment.objects.filter(user=patient).first()

            patients.append({
                "patient_id": patient.id,
                "name": patient.name,
                "email": patient.email,
                "role": patient.role,
                "last_mood_score": last_mood.mood_score if last_mood else None,
                "primary_condition": last_assessment.condition if last_assessment else None,
                "severity": last_assessment.severity if last_assessment else None,
                "latest_assessment_date": last_assessment.created_at if last_assessment else None,
            })

        active_invites = TherapistPatientLink.objects.filter(
            therapist=request.user, status='pending'
        ).count()

        return Response({
            "therapist_name": request.user.name,
            "total_patients": len(patients),
            "active_invites_pending": active_invites,
            "linked_patients": patients,
        })


# ─────────────────────────────────────────
# THERAPIST — Patient Detail
# ─────────────────────────────────────────

class PatientDetailView(APIView):
    """GET /api/therapist/patient/<patient_id>/"""
    permission_classes = [IsTherapist]

    def get(self, request, patient_id):
        from assessments.models import Assessment
        from therapy.models import MoodLog, ChatMessage
        from analytics.models import Streak

        # Ensure this therapist is linked to the patient
        link = TherapistPatientLink.objects.filter(
            therapist=request.user, user_id=patient_id, status='active'
        ).first()
        if not link:
            return Response({'error': 'Patient not found or not linked to you.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            patient = link.user
            moods = MoodLog.objects.filter(user=patient).order_by('-created_at')[:20]
            assessments = Assessment.objects.filter(user=patient).order_by('-created_at')[:10]
            streak, _ = Streak.objects.get_or_create(user=patient)
            tasks = TherapistTask.objects.filter(patient=patient).order_by('-created_at')
            
            # New onboarding/profile data
            from assessments.models import UserCognitiveProfile, UserResponse
            from games.models import GameSession
            cognitive_profile, _ = UserCognitiveProfile.objects.get_or_create(user=patient)
            game_sessions = GameSession.objects.filter(user=patient).order_by('-created_at')[:20]
            responses = UserResponse.objects.filter(user=patient).select_related('question')
        except Exception as e:
            print(f"Error fetching detail data: {e}")
            return Response({'error': f'Clinical data error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'patient': {
                'id': patient.id,
                'name': patient.name,
                'email': patient.email,
                'age_group': getattr(patient, 'age_group', None) or '—',
                'goals': getattr(patient, 'goals', []) or [],
                'special_needs': getattr(patient, 'special_needs', []) or [],
                'onboarding_complete': patient.onboarding_complete,
                'primary_condition': getattr(patient.user_profile, 'primary_condition', 'Stable'),
            },
            'cognitive_profile': {
                'condition': cognitive_profile.condition,
                'focus_score': cognitive_profile.focus_score,
                'stress_score': cognitive_profile.stress_score,
                'memory_score': cognitive_profile.memory_score,
                'sensory_preference': cognitive_profile.sensory_preference,
                'stimulation_preference': cognitive_profile.stimulation_preference,
            },
            'questionnaire_summary': [
                {'category': r.question.category, 'answer': r.answer_text}
                for r in responses[:15]
            ],
            'game_activity': [
                {
                    'game': s.game.name,
                    'score': s.score,
                    'improvement': s.improvement,
                    'date': s.created_at
                } for s in game_sessions
            ],
            'streak': {
                'current': getattr(streak, 'current_streak', 0),
                'longest': getattr(streak, 'longest_streak', 0),
            },
            'mood_logs': [
                {'score': m.mood_score, 'note': m.note, 'date': m.created_at}
                for m in moods
            ],
            'assessments': [
                {'condition': a.condition, 'score': a.score, 'severity': a.severity, 'date': a.created_at}
                for a in assessments
            ],
            'tasks': [
                {
                    'id': t.id,
                    'title': t.title,
                    'description': t.description,
                    'due_date': t.due_date,
                    'status': t.status,
                    'created_at': t.created_at,
                    'completed_at': t.completed_at
                } for t in tasks
            ],
            'notes': [
                {
                    'id': n.id,
                    'title': n.title,
                    'content': n.content,
                    'session_date': n.session_date,
                    'is_private': n.is_private,
                    'created_at': n.created_at
                } for n in SessionNotes.objects.filter(therapist=request.user, patient=patient)
            ],
            'linked_since': link.created_at,
        })




class UpdatePatientConditionView(APIView):
    """POST /api/therapist/update-condition/"""
    permission_classes = [IsTherapist]

    def post(self, request):
        patient_id = request.data.get('patient_id')
        condition = request.data.get('condition')
        if not patient_id or not condition:
            return Response({"error": "patient_id and condition required."}, status=400)
        
        link = TherapistPatientLink.objects.filter(
            therapist=request.user, user_id=patient_id, status='active'
        ).first()
        if not link:
            return Response({"error": "Patient not linked to you."}, status=403)
            
        profile = link.user.user_profile
        profile.primary_condition = condition
        profile.save(update_fields=['primary_condition', 'updated_at'])
        
        return Response({"message": f"Patient condition updated to {condition}."})


# ─────────────────────────────────────────
# ADMIN VIEWS
# ─────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]


class AdminStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        from django.db.models import Avg
        from games.models import Progress
        from therapy.models import MoodLog
        import datetime

        users_count = User.objects.count()
        sessions_count = Progress.objects.count()
        today = timezone.now().date()
        today_active = Progress.objects.filter(created_at__date=today).values('user').distinct().count()
        last_7_days = timezone.now() - datetime.timedelta(days=7)
        avg_mood = MoodLog.objects.filter(created_at__gte=last_7_days).aggregate(avg=Avg('mood_score'))['avg'] or 0

        return Response({
            "total_users": users_count,
            "total_sessions": sessions_count,
            "today_active": today_active,
            "avg_mood_7d": round(float(avg_mood), 1),
            "therapist_links_active": TherapistPatientLink.objects.filter(status='active').count(),
        })


# ─────────────────────────────────────────
# TASKS & NOTIFICATIONS VIEWS
# ─────────────────────────────────────────

from .models import TherapistTask, Notification

class AssignTaskView(APIView):
    """POST /api/therapist/assign-task/"""
    permission_classes = [IsTherapist]

    def post(self, request):
        patient_id = request.data.get('patient_id')
        title = request.data.get('title')
        description = request.data.get('description', '')
        due_date = request.data.get('due_date')

        if not patient_id or not title:
            return Response({"error": "Patient ID and title are required."}, status=400)

        # Verify link exists
        link = TherapistPatientLink.objects.filter(
            therapist=request.user, user_id=patient_id, status='active'
        ).first()

        if not link:
            return Response({"error": "Patient not found or not linked to you."}, status=404)

        task = TherapistTask.objects.create(
            therapist=request.user,
            patient_id=patient_id,
            title=title,
            description=description,
            due_date=due_date
        )

        # Create notification for patient
        Notification.objects.create(
            user_id=patient_id,
            title="New Task Assigned",
            message=f"Dr. {request.user.name} has assigned you a new task: {title}",
            link="/dashboard"
        )

        return Response({
            "message": "Task assigned successfully.",
            "task_id": task.id
        }, status=201)

class UserTaskListView(APIView):
    """GET /api/user/tasks/"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        tasks = TherapistTask.objects.filter(patient=request.user).order_by('status', '-created_at')
        return Response([{
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "due_date": t.due_date,
            "status": t.status,
            "therapist_name": t.therapist.name,
            "created_at": t.created_at
        } for t in tasks])

class UpdateTaskStatusView(APIView):
    """PATCH /api/user/tasks/<id>/"""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            task = TherapistTask.objects.get(pk=pk)
        except TherapistTask.DoesNotExist:
            return Response({"error": "Task not found."}, status=404)

        # Only patient can complete, or therapist can update
        if task.patient != request.user and task.therapist != request.user:
            return Response({"error": "Forbidden."}, status=403)

        new_status = request.data.get('status')
        if new_status not in ['pending', 'completed', 'overdue']:
            return Response({"error": "Invalid status."}, status=400)

        task.status = new_status
        if new_status == 'completed':
            task.completed_at = timezone.now()
        task.save(update_fields=['status', 'completed_at'])

        # Create notification for therapist if completed by patient
        if new_status == 'completed' and request.user == task.patient:
            Notification.objects.create(
                user=task.therapist,
                title="Task Completed",
                message=f"{task.patient.name} has completed the task: {task.title}",
                link="/dashboard"
            )

        return Response({"message": "Task updated.", "status": task.status})

class NotificationListView(APIView):
    """GET /api/notifications/"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notifs = Notification.objects.filter(user=request.user).order_by('-created_at')[:50]
        return Response([{
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at,
            "link": n.link
        } for n in notifs])

class MarkNotificationReadView(APIView):
    """PATCH /api/notifications/<id>/read/"""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            notif = Notification.objects.get(pk=pk, user=request.user)
            notif.is_read = True
            notif.save(update_fields=['is_read'])
            return Response({"message": "Marked as read."})
        except Notification.DoesNotExist:
            return Response({"error": "Not found."}, status=404)


# ─────────────────────────────────────────
# GOALS (Individual users)
# ─────────────────────────────────────────

class GoalView(APIView):
    """GET / POST /api/user/goals-list/ — Create and list goals for the current user."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from analytics.models import Goal
        goals = Goal.objects.filter(user=request.user)
        return Response([{
            'id': g.id, 'title': g.title, 'description': g.description,
            'category': g.category, 'target_date': g.target_date,
            'is_completed': g.is_completed, 'completed_at': g.completed_at,
            'created_at': g.created_at,
        } for g in goals])

    def post(self, request):
        from analytics.models import Goal
        title = request.data.get('title')
        if not title:
            return Response({"error": "Title is required."}, status=400)
        goal = Goal.objects.create(
            user=request.user,
            title=title,
            description=request.data.get('description', ''),
            category=request.data.get('category', 'mental'),
            target_date=request.data.get('target_date'),
        )
        return Response({'id': goal.id, 'title': goal.title, 'message': 'Goal created!'}, status=201)


class GoalDetailView(APIView):
    """PATCH /DELETE /api/user/goals-list/<pk>/ — Update or delete a specific goal."""
    permission_classes = [permissions.IsAuthenticated]

    def _get_goal(self, pk, user):
        from analytics.models import Goal
        try:
            return Goal.objects.get(pk=pk, user=user)
        except Goal.DoesNotExist:
            return None

    def patch(self, request, pk):
        from django.utils import timezone
        goal = self._get_goal(pk, request.user)
        if not goal:
            return Response({"error": "Goal not found."}, status=404)
        for field in ['title', 'description', 'category', 'target_date', 'is_completed']:
            if field in request.data:
                setattr(goal, field, request.data[field])
        if request.data.get('is_completed') and not goal.completed_at:
            goal.completed_at = timezone.now()
        goal.save()
        return Response({"message": "Goal updated.", "id": goal.id})

    def delete(self, request, pk):
        goal = self._get_goal(pk, request.user)
        if not goal:
            return Response({"error": "Goal not found."}, status=404)
        goal.delete()
        return Response({"message": "Goal deleted."}, status=204)


# ─────────────────────────────────────────
# SESSION NOTES (Therapist-only)
# ─────────────────────────────────────────

class SessionNotesView(APIView):
    """GET / POST /api/therapist/notes/<patient_id>/"""
    permission_classes = [IsTherapist]

    def _verify_link(self, therapist, patient_id):
        return TherapistPatientLink.objects.filter(
            therapist=therapist, user_id=patient_id, status='active'
        ).exists()

    def get(self, request, patient_id):
        if not self._verify_link(request.user, patient_id):
            return Response({"error": "Patient not linked to you."}, status=403)
        from .models import SessionNotes
        notes = SessionNotes.objects.filter(therapist=request.user, patient_id=patient_id)
        return Response([{
            'id': n.id, 'title': n.title, 'content': n.content,
            'tags': n.tags, 'session_date': n.session_date,
            'is_private': n.is_private, 'created_at': n.created_at,
            'updated_at': n.updated_at,
        } for n in notes])

    def post(self, request, patient_id):
        if not self._verify_link(request.user, patient_id):
            return Response({"error": "Patient not linked to you."}, status=403)
        from .models import SessionNotes
        title = request.data.get('title')
        content = request.data.get('content')
        session_date = request.data.get('session_date')
        if not all([title, content, session_date]):
            return Response({"error": "title, content, session_date are required."}, status=400)
        note = SessionNotes.objects.create(
            therapist=request.user,
            patient_id=patient_id,
            title=title,
            content=content,
            tags=request.data.get('tags', []),
            session_date=session_date,
            is_private=request.data.get('is_private', True),
        )
        # Notify patient only for shared notes
        if not note.is_private:
            Notification.objects.create(
                user_id=patient_id,
                title="New Session Note",
                message=f"Dr. {request.user.name} has shared a session note with you.",
                link="/dashboard"
            )
        return Response({'id': note.id, 'message': 'Note saved.'}, status=201)


class SessionNoteDetailView(APIView):
    """PATCH / DELETE /api/therapist/notes/note/<pk>/"""
    permission_classes = [IsTherapist]

    def _get_note(self, pk, therapist):
        from .models import SessionNotes
        try:
            return SessionNotes.objects.get(pk=pk, therapist=therapist)
        except SessionNotes.DoesNotExist:
            return None

    def patch(self, request, pk):
        note = self._get_note(pk, request.user)
        if not note:
            return Response({"error": "Note not found."}, status=404)
        for field in ['title', 'content', 'tags', 'session_date', 'is_private']:
            if field in request.data:
                setattr(note, field, request.data[field])
        note.save()
        return Response({"message": "Note updated."})

    def delete(self, request, pk):
        note = self._get_note(pk, request.user)
        if not note:
            return Response({"error": "Note not found."}, status=404)
        note.delete()
        return Response({"message": "Note deleted."}, status=204)


# ─────────────────────────────────────────
# THERAPIST ANALYTICS
# ─────────────────────────────────────────

class TherapistAnalyticsView(APIView):
    """GET /api/therapist/analytics/ — Aggregate trends across all linked patients."""
    permission_classes = [IsTherapist]

    def get(self, request):
        from therapy.models import MoodLog
        from assessments.models import Assessment

        links = TherapistPatientLink.objects.filter(
            therapist=request.user, status='active'
        ).select_related('user')

        patient_ids = [link.user_id for link in links if link.user_id]
        total_patients = len(patient_ids)

        # Mood trend (avg per patient)
        mood_data = []
        for pid in patient_ids:
            logs = MoodLog.objects.filter(user_id=pid).order_by('-created_at')[:7]
            if logs:
                avg = sum(l.mood_score for l in logs) / len(logs)
                mood_data.append({'patient_id': pid, 'avg_mood': round(avg, 1), 'logs': len(logs)})

        # Assessment severity breakdown
        severity_counts = {}
        for pid in patient_ids:
            latest = Assessment.objects.filter(user_id=pid).order_by('-created_at').first()
            if latest:
                severity_counts[latest.severity] = severity_counts.get(latest.severity, 0) + 1

        # Crisis risk patients (severe depression)
        crisis_risk = Assessment.objects.filter(
            user_id__in=patient_ids,
            condition='depression',
            severity__in=['severe', 'moderately_severe']
        ).values_list('user_id', flat=True).distinct()

        crisis_patients = []
        for pid in crisis_risk:
            link = next((l for l in links if l.user_id == pid), None)
            if link and link.user:
                crisis_patients.append({'patient_id': pid, 'name': link.user.name})

        return Response({
            'total_patients': total_patients,
            'mood_trends': mood_data,
            'severity_breakdown': severity_counts,
            'high_risk_patients': crisis_patients,
            'total_high_risk': len(crisis_patients),
        })
