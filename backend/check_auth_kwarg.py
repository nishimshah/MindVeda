import os
import django
from django.contrib.auth import authenticate

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindveda_project.settings')
django.setup()

from accounts.models import User

email = 'login_test@example.com'
password = 'password123'

print("--- Testing authenticate(email=...) ---")
user1 = authenticate(email=email, password=password)
print(f"Result with email kwarg: {user1}")

print("--- Testing authenticate(username=...) ---")
user2 = authenticate(username=email, password=password)
print(f"Result with username kwarg: {user2}")
