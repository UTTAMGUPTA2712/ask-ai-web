#!/usr/bin/env python3
"""
Backend API Testing for AI Chat Application
Tests all API endpoints including health check, authentication, chat functionality, and custom GPTs
"""

import requests
import json
import uuid
import os
from datetime import datetime

# Get base URL from environment
BASE_URL = "https://nextgen-aichat.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

def print_test_result(test_name, success, details=""):
    """Print formatted test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if details:
        print(f"   Details: {details}")
    print()

def test_health_check():
    """Test GET /api - Health check endpoint"""
    print("🔍 Testing Health Check API...")
    try:
        response = requests.get(f"{API_BASE}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and data["message"] == "AI Chat API":
                print_test_result("Health Check API", True, f"Response: {data}")
                return True
            else:
                print_test_result("Health Check API", False, f"Unexpected response: {data}")
                return False
        else:
            print_test_result("Health Check API", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("Health Check API", False, f"Exception: {str(e)}")
        return False

def test_user_signup():
    """Test POST /api/auth/signup - User registration"""
    print("🔍 Testing User Signup API...")
    try:
        # Generate unique user data
        user_id = str(uuid.uuid4())
        test_user = {
            "id": user_id,
            "email": f"testuser_{user_id[:8]}@example.com",
            "name": f"Test User {user_id[:8]}",
            "password": "testpassword123"
        }
        
        response = requests.post(
            f"{API_BASE}/auth/signup",
            json=test_user,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if "user" in data:
                print_test_result("User Signup API", True, f"User created: {data['user']['email']}")
                return True, test_user
            else:
                print_test_result("User Signup API", False, f"No user in response: {data}")
                return False, None
        else:
            # This might fail if Supabase tables don't exist - that's expected
            error_msg = response.text
            if "relation" in error_msg.lower() and "does not exist" in error_msg.lower():
                print_test_result("User Signup API", False, "Expected failure: Supabase database tables don't exist yet")
            else:
                print_test_result("User Signup API", False, f"Status: {response.status_code}, Response: {error_msg}")
            return False, None
            
    except Exception as e:
        print_test_result("User Signup API", False, f"Exception: {str(e)}")
        return False, None

def test_chat_guest_mode():
    """Test POST /api/chat - Chat without authentication (guest mode)"""
    print("🔍 Testing Chat API - Guest Mode...")
    try:
        chat_data = {
            "message": "Hello, this is a test message from a guest user. Can you respond?",
        }
        
        response = requests.post(
            f"{API_BASE}/chat",
            json=chat_data,
            headers={"Content-Type": "application/json"},
            timeout=30  # Groq API might take some time
        )
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "chatId" in data:
                print_test_result("Chat API - Guest Mode", True, f"AI Response: {data['message'][:100]}...")
                return True, data.get("chatId")
            else:
                print_test_result("Chat API - Guest Mode", False, f"Missing required fields: {data}")
                return False, None
        else:
            error_msg = response.text
            if "relation" in error_msg.lower() and "does not exist" in error_msg.lower():
                print_test_result("Chat API - Guest Mode", False, "Expected failure: Supabase database tables don't exist yet")
            else:
                print_test_result("Chat API - Guest Mode", False, f"Status: {response.status_code}, Response: {error_msg}")
            return False, None
            
    except Exception as e:
        print_test_result("Chat API - Guest Mode", False, f"Exception: {str(e)}")
        return False, None

def test_chat_authenticated_mode():
    """Test POST /api/chat - Chat with authentication"""
    print("🔍 Testing Chat API - Authenticated Mode...")
    try:
        # Use a dummy auth token for testing
        chat_data = {
            "message": "Hello, this is a test message from an authenticated user. Can you respond?",
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer dummy_token_for_testing"
        }
        
        response = requests.post(
            f"{API_BASE}/chat",
            json=chat_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "chatId" in data:
                print_test_result("Chat API - Authenticated Mode", True, f"AI Response: {data['message'][:100]}...")
                return True, data.get("chatId")
            else:
                print_test_result("Chat API - Authenticated Mode", False, f"Missing required fields: {data}")
                return False, None
        else:
            # This will likely fail with invalid token, but we're testing the endpoint structure
            error_msg = response.text
            if "relation" in error_msg.lower() and "does not exist" in error_msg.lower():
                print_test_result("Chat API - Authenticated Mode", False, "Expected failure: Supabase database tables don't exist yet")
            elif response.status_code == 500:
                print_test_result("Chat API - Authenticated Mode", False, f"Server error (expected with dummy token): {error_msg}")
            else:
                print_test_result("Chat API - Authenticated Mode", False, f"Status: {response.status_code}, Response: {error_msg}")
            return False, None
            
    except Exception as e:
        print_test_result("Chat API - Authenticated Mode", False, f"Exception: {str(e)}")
        return False, None

def test_get_chats_guest():
    """Test GET /api/chats - Get chats for guest user"""
    print("🔍 Testing Get Chats API - Guest Mode...")
    try:
        response = requests.get(f"{API_BASE}/chats", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "chats" in data:
                print_test_result("Get Chats API - Guest Mode", True, f"Found {len(data['chats'])} chats")
                return True
            else:
                print_test_result("Get Chats API - Guest Mode", False, f"No chats field in response: {data}")
                return False
        else:
            error_msg = response.text
            if "relation" in error_msg.lower() and "does not exist" in error_msg.lower():
                print_test_result("Get Chats API - Guest Mode", False, "Expected failure: Supabase database tables don't exist yet")
            else:
                print_test_result("Get Chats API - Guest Mode", False, f"Status: {response.status_code}, Response: {error_msg}")
            return False
            
    except Exception as e:
        print_test_result("Get Chats API - Guest Mode", False, f"Exception: {str(e)}")
        return False

def test_get_chats_authenticated():
    """Test GET /api/chats - Get chats for authenticated user"""
    print("🔍 Testing Get Chats API - Authenticated Mode...")
    try:
        headers = {"Authorization": "Bearer dummy_token_for_testing"}
        response = requests.get(f"{API_BASE}/chats", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "chats" in data:
                print_test_result("Get Chats API - Authenticated Mode", True, f"Found {len(data['chats'])} chats")
                return True
            else:
                print_test_result("Get Chats API - Authenticated Mode", False, f"No chats field in response: {data}")
                return False
        else:
            error_msg = response.text
            if "relation" in error_msg.lower() and "does not exist" in error_msg.lower():
                print_test_result("Get Chats API - Authenticated Mode", False, "Expected failure: Supabase database tables don't exist yet")
            else:
                print_test_result("Get Chats API - Authenticated Mode", False, f"Status: {response.status_code}, Response: {error_msg}")
            return False
            
    except Exception as e:
        print_test_result("Get Chats API - Authenticated Mode", False, f"Exception: {str(e)}")
        return False

def test_get_chat_messages(chat_id=None):
    """Test GET /api/chats/:id/messages - Get messages for a chat"""
    print("🔍 Testing Get Chat Messages API...")
    try:
        # Use a dummy chat ID if none provided
        test_chat_id = chat_id or str(uuid.uuid4())
        
        response = requests.get(f"{API_BASE}/chats/{test_chat_id}/messages", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "messages" in data:
                print_test_result("Get Chat Messages API", True, f"Found {len(data['messages'])} messages")
                return True
            else:
                print_test_result("Get Chat Messages API", False, f"No messages field in response: {data}")
                return False
        else:
            error_msg = response.text
            if "relation" in error_msg.lower() and "does not exist" in error_msg.lower():
                print_test_result("Get Chat Messages API", False, "Expected failure: Supabase database tables don't exist yet")
            else:
                print_test_result("Get Chat Messages API", False, f"Status: {response.status_code}, Response: {error_msg}")
            return False
            
    except Exception as e:
        print_test_result("Get Chat Messages API", False, f"Exception: {str(e)}")
        return False

def test_create_custom_gpt():
    """Test POST /api/custom-gpts - Create custom GPT"""
    print("🔍 Testing Create Custom GPT API...")
    try:
        custom_gpt_data = {
            "name": "Test Assistant",
            "description": "A test custom GPT assistant",
            "system_prompt": "You are a helpful test assistant. Always respond with enthusiasm and include the word 'test' in your responses."
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer dummy_token_for_testing"
        }
        
        response = requests.post(
            f"{API_BASE}/custom-gpts",
            json=custom_gpt_data,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if "customGPT" in data:
                print_test_result("Create Custom GPT API", True, f"Created: {data['customGPT']['name']}")
                return True
            else:
                print_test_result("Create Custom GPT API", False, f"No customGPT in response: {data}")
                return False
        elif response.status_code == 401:
            print_test_result("Create Custom GPT API", True, "Correctly returned 401 for invalid auth token")
            return True
        else:
            error_msg = response.text
            if "relation" in error_msg.lower() and "does not exist" in error_msg.lower():
                print_test_result("Create Custom GPT API", False, "Expected failure: Supabase database tables don't exist yet")
            else:
                print_test_result("Create Custom GPT API", False, f"Status: {response.status_code}, Response: {error_msg}")
            return False
            
    except Exception as e:
        print_test_result("Create Custom GPT API", False, f"Exception: {str(e)}")
        return False

def test_get_custom_gpts():
    """Test GET /api/custom-gpts - Get user's custom GPTs"""
    print("🔍 Testing Get Custom GPTs API...")
    try:
        headers = {"Authorization": "Bearer dummy_token_for_testing"}
        response = requests.get(f"{API_BASE}/custom-gpts", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "customGPTs" in data:
                print_test_result("Get Custom GPTs API", True, f"Found {len(data['customGPTs'])} custom GPTs")
                return True
            else:
                print_test_result("Get Custom GPTs API", False, f"No customGPTs field in response: {data}")
                return False
        else:
            error_msg = response.text
            if "relation" in error_msg.lower() and "does not exist" in error_msg.lower():
                print_test_result("Get Custom GPTs API", False, "Expected failure: Supabase database tables don't exist yet")
            else:
                print_test_result("Get Custom GPTs API", False, f"Status: {response.status_code}, Response: {error_msg}")
            return False
            
    except Exception as e:
        print_test_result("Get Custom GPTs API", False, f"Exception: {str(e)}")
        return False

def test_create_custom_gpt_no_auth():
    """Test POST /api/custom-gpts without authentication - should return 401"""
    print("🔍 Testing Create Custom GPT API - No Auth...")
    try:
        custom_gpt_data = {
            "name": "Test Assistant",
            "description": "A test custom GPT assistant",
            "system_prompt": "You are a helpful test assistant."
        }
        
        response = requests.post(
            f"{API_BASE}/custom-gpts",
            json=custom_gpt_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 401:
            print_test_result("Create Custom GPT API - No Auth", True, "Correctly returned 401 Unauthorized")
            return True
        else:
            print_test_result("Create Custom GPT API - No Auth", False, f"Expected 401, got {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_test_result("Create Custom GPT API - No Auth", False, f"Exception: {str(e)}")
        return False

def main():
    """Run all backend API tests"""
    print("🚀 Starting AI Chat Application Backend API Tests")
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"🔗 API Base: {API_BASE}")
    print("=" * 60)
    
    results = {}
    chat_id = None
    
    # Test all endpoints
    results["health_check"] = test_health_check()
    results["user_signup"], _ = test_user_signup()
    results["chat_guest"], chat_id = test_chat_guest_mode()
    results["chat_auth"], _ = test_chat_authenticated_mode()
    results["get_chats_guest"] = test_get_chats_guest()
    results["get_chats_auth"] = test_get_chats_authenticated()
    results["get_messages"] = test_get_chat_messages(chat_id)
    results["create_custom_gpt"] = test_create_custom_gpt()
    results["get_custom_gpts"] = test_get_custom_gpts()
    results["create_custom_gpt_no_auth"] = test_create_custom_gpt_no_auth()
    
    # Summary
    print("=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name.replace('_', ' ').title()}")
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 All tests passed!")
    else:
        print("⚠️  Some tests failed - this may be expected if Supabase database tables don't exist yet")
    
    return results

if __name__ == "__main__":
    main()