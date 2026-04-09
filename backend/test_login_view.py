import os
import django
from rest_framework.test import APIClient

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindveda_project.settings')
django.setup()

from accounts.models import User

# Setup user
email = 'view_test@example.com'
password = 'password123'
User.objects.filter(email=email).delete()
User.objects.create_user(email=email, name='View Tester', password=password)

client = APIClient()
data = {
    'email': email,
    'password': password
}

print("--- Testing POST /api/auth/login/ ---")
response = client.post('/api/auth/login/', data, format='json')
print(f"Status Code: {response.status_code}")
if response.status_code == 500:
    print("Detected 500 Error!")
    # In some test environments, you can't easily see the traceback here 
    # unless you look at the response content if DEBUG is True
    print(response.content.decode()[:500])
else:
    print(f"Response data: {response.data}")
