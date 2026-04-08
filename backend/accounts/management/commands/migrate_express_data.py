from django.core.management.base import BaseCommand
from django.db import connection, transaction
from accounts.models import User
from therapy.models import MoodLog, ChatMessage
from games.models import Progress
from analytics.models import Streak

class Command(BaseCommand):
    help = 'Migrates data from original Express tables to new Django tables'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting data migration...'))
        
        try:
            with transaction.atomic():
                # 1. Migrate Users
                self.migrate_users()
                
                # 2. Migrate Mood Logs
                self.migrate_mood_logs()
                
                # 3. Migrate Chat Messages
                self.migrate_chat_messages()
                
                # 4. Migrate Progress
                self.migrate_progress()
                
                # 5. Migrate Streaks
                self.migrate_streaks()
                
                # 6. Reset Sequences
                self.reset_sequences()
                
            self.stdout.write(self.style.SUCCESS('✅ Data migration completed successfully!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Migration failed: {e}'))

    def migrate_users(self):
        self.stdout.write('Migrating Users...')
        with connection.cursor() as cursor:
            # Check if role column exists in the source table
            cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='role'")
            has_role = cursor.fetchone() is not None
            
            query = "SELECT id, name, email, password_hash, age_group, goals, special_needs, onboarding_complete, is_admin, accessibility_mode, created_at"
            if has_role:
                query = "SELECT id, name, email, password_hash, role, age_group, goals, special_needs, onboarding_complete, is_admin, accessibility_mode, created_at"
            
            cursor.execute(f"{query} FROM users")
            rows = cursor.fetchall()
            
            for row in rows:
                if has_role:
                    (u_id, u_name, u_email, u_hash, u_role, u_age, u_goals, u_spec, u_onb, u_admin, u_acc, u_created) = row
                else:
                    (u_id, u_name, u_email, u_hash, u_age, u_goals, u_spec, u_onb, u_admin, u_acc, u_created) = row
                    u_role = 'individual' # Default
                django_hash = f"bcrypt${u_hash}"
                
                user, created = User.objects.get_or_create(
                    id=u_id,
                    defaults={
                        'name': u_name,
                        'email': u_email,
                        'password': django_hash,
                        'role': u_role,
                        'age_group': u_age,
                        'goals': u_goals or [],
                        'special_needs': u_spec or [],
                        'onboarding_complete': u_onb,
                        'is_admin': u_admin,
                        'accessibility_mode': u_acc or 'none',
                        'date_joined': u_created,
                        'first_name': u_name.split(' ')[0],
                        'last_name': ' '.join(u_name.split(' ')[1:]) if ' ' in u_name else '',
                    }
                )

    def migrate_mood_logs(self):
        self.stdout.write('Migrating Mood Logs...')
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, user_id, mood_score, note, created_at FROM mood_logs")
            rows = cursor.fetchall()
            for row in rows:
                MoodLog.objects.get_or_create(
                    id=row[0],
                    defaults={
                        'user_id': row[1],
                        'mood_score': row[2],
                        'note': row[3],
                        'created_at': row[4]
                    }
                )

    def migrate_chat_messages(self):
        self.stdout.write('Migrating Chat Messages...')
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, user_id, role, content, sentiment, created_at FROM chat_messages")
            rows = cursor.fetchall()
            for row in rows:
                ChatMessage.objects.get_or_create(
                    id=row[0],
                    defaults={
                        'user_id': row[1],
                        'role': row[2],
                        'content': row[3],
                        'sentiment': row[4],
                        'created_at': row[5]
                    }
                )

    def migrate_progress(self):
        self.stdout.write('Migrating Progress...')
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, user_id, activity_type, game_name, score, duration_seconds, difficulty, created_at FROM progress")
            rows = cursor.fetchall()
            for row in rows:
                Progress.objects.get_or_create(
                    id=row[0],
                    defaults={
                        'user_id': row[1],
                        'activity_type': row[2],
                        'game_name': row[3],
                        'score': row[4],
                        'duration_seconds': row[5],
                        'difficulty': row[6],
                        'created_at': row[7]
                    }
                )

    def migrate_streaks(self):
        self.stdout.write('Migrating Streaks...')
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, user_id, current_streak, longest_streak, last_active FROM streaks")
            rows = cursor.fetchall()
            for row in rows:
                Streak.objects.get_or_create(
                    id=row[0],
                    defaults={
                        'user_id': row[1],
                        'current_streak': row[2],
                        'longest_streak': row[3],
                        'last_active': row[4]
                    }
                )

    def reset_sequences(self):
        self.stdout.write('Resetting DB Sequences...')
        with connection.cursor() as cursor:
            tables = [
                'accounts_user', 'therapy_moodlog', 'therapy_chatmessage', 
                'games_progress', 'analytics_streak'
            ]
            for table in tables:
                cursor.execute(f"SELECT setval('{table}_id_seq', (SELECT MAX(id) FROM {table}))")
