import os
import django
import bcrypt
from django.contrib.auth import authenticate

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindveda_project.settings')
django.setup()

from accounts.models import User

email = 'bcrypt_test@example.com'
password = 'password123'
raw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
django_hash = f"bcrypt${raw_hash}"

User.objects.filter(email=email).delete()
user = User.objects.create(email=email, name='Bcrypt Tester', password=django_hash)

print(f"Testing authenticate with hash: {django_hash}")
auth_user = authenticate(email=email, password=password)
print(f"Auth Result: {auth_user}")
