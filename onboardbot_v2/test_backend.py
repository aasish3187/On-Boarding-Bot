import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_backend():
    print("--- Starting Backend Verification Tests ---")
    
    # 1. Signup test user
    print("\n1. Testing Signup Endpoint...")
    signup_payload = {
        "email": "test_user@luminasystems.com",
        "password": "SecurePassword123",
        "name": "Alice Developer",
        "role": "employee",
        "department": "Engineering"
    }
    try:
        response = requests.post(f"{BASE_URL}/api/auth/signup", json=signup_payload)
        print(f"Signup Response Status: {response.status_code}")
        print(f"Signup Response JSON: {response.json()}")
    except Exception as e:
        print(f"Signup failed: {e}")
        sys.exit(1)

    # 2. Login test user
    print("\n2. Testing Login Endpoint...")
    login_payload = {
        "username": "test_user@luminasystems.com",
        "password": "SecurePassword123"
    }
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", data=login_payload)
        print(f"Login Response Status: {response.status_code}")
        login_data = response.json()
        print(f"Login Response JSON: {login_data}")
        token = login_data.get("access_token")
        if not token:
            print("Failed to retrieve token from login response.")
            sys.exit(1)
    except Exception as e:
        print(f"Login failed: {e}")
        sys.exit(1)

    # 3. Test Bot Chat (Conversational / Greeting)
    headers = {"Authorization": f"Bearer {token}"}
    print("\n3. Testing Bot Chat - Conversational query...")
    chat_payload = {"message": "Hello Prism, I am excited to join Lumina Systems!"}
    try:
        response = requests.post(f"{BASE_URL}/api/bot/chat", json=chat_payload, headers=headers)
        print(f"Chat Response Status: {response.status_code}")
        print(f"Chat Response JSON: {response.json()}")
    except Exception as e:
        print(f"Conversational Chat failed: {e}")

    # 4. Test Bot Chat (Knowledge RAG - Core hours / Leave Policy)
    print("\n4. Testing Bot Chat - Policy/Knowledge RAG query...")
    chat_payload = {"message": "What are the core working hours at Lumina Systems?"}
    try:
        response = requests.post(f"{BASE_URL}/api/bot/chat", json=chat_payload, headers=headers)
        print(f"Chat Response Status: {response.status_code}")
        print(f"Chat Response JSON: {response.json()}")
    except Exception as e:
        print(f"Knowledge RAG Chat failed: {e}")

    # 5. Test Bot Chat (IT Provisioning)
    print("\n5. Testing Bot Chat - IT Provisioning query...")
    chat_payload = {"message": "Please set up my Slack account."}
    try:
        response = requests.post(f"{BASE_URL}/api/bot/chat", json=chat_payload, headers=headers)
        print(f"Chat Response Status: {response.status_code}")
        print(f"Chat Response JSON: {response.json()}")
    except Exception as e:
        print(f"IT Provisioning Chat failed: {e}")

if __name__ == "__main__":
    test_backend()
