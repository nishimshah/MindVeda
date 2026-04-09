import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindveda_project.settings')
django.setup()

from accounts.serializers import LoginSerializer

data = {
    'email': 'login_test@example.com',
    'password': 'password123'
}

serializer = LoginSerializer(data=data)
if serializer.is_valid():
    user = serializer.validated_data
    print(f"Validated user type: {type(user)}")
    try:
        print(f"User role: {user.role}")
    except Exception as e:
        print(f"Error accessing role: {e}")
else:
    print(f"Serializer errors: {serializer.errors}")
