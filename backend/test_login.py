import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindveda_project.settings')
django.setup()

from accounts.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.serializers import UserSerializer

# Ensure a test user exists
email = 'login_test@example.com'
password = 'password123'
User.objects.filter(email=email).delete()
user = User.objects.create_user(email=email, name='Login Tester', password=password)

print("--- Testing Authenticate ---")
auth_user = authenticate(email=email, password=password)
if auth_user:
    print(f"Authenticated: {auth_user.email}")
    try:
        print("--- Testing Token Generation ---")
        refresh = RefreshToken.for_user(auth_user)
        print(f"Token: {str(refresh.access_token)[:20]}...")
        
        print("--- Testing Serialization ---")
        data = UserSerializer(auth_user).data
        print(f"Serialized Data: {data.keys()}")
    except Exception as e:
        print(f"Error during Login flow: {e}")
        import traceback
        traceback.print_exc()
else:
    print("Authentication FAILED")
