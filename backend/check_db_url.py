import dj_database_url
url = 'postgresql://postgres:Nishi@123@localhost:5432/mindveda'
config = dj_database_url.parse(url)
print(f"USER: {config.get('USER')}")
print(f"PASS: {config.get('PASSWORD')}")
print(f"HOST: {config.get('HOST')}")
print(f"PORT: {config.get('PORT')}")
