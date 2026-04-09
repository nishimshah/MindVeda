import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindveda_project.settings')
django.setup()

from accounts.models import User

# Check a migrated user
user = User.objects.exclude(email__contains='test').first()
if user:
    print(f"User: {user.email}")
    print(f"Hash: {user.password}")
    
    # Try to verify a known password if we can... 
    # But we don't know their password.
else:
    print("No non-test users found.")
