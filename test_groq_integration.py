#!/usr/bin/env python3
"""
Test Groq AI Integration
"""

import requests
import json
import os

def test_groq_api_key():
    """Test if Groq API key is working"""
    print("🔍 Testing Groq API Integration...")
    
    # Read API key from .env file
    groq_api_key = None
    try:
        with open('/app/.env', 'r') as f:
            for line in f:
                if line.startswith('GROQ_API_KEY='):
                    groq_api_key = line.split('=', 1)[1].strip()
                    break
    except Exception as e:
        print(f"❌ Could not read .env file: {e}")
        return False
    
    if not groq_api_key:
        print("❌ GROQ_API_KEY not found in .env file")
        return False
    
    # Test Groq API directly
    try:
        headers = {
            "Authorization": f"Bearer {groq_api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say hello in one word."}
            ],
            "temperature": 0.7,
            "max_tokens": 10
        }
        
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if "choices" in result and len(result["choices"]) > 0:
                message = result["choices"][0]["message"]["content"]
                print(f"✅ Groq API is working! Response: {message}")
                return True
            else:
                print(f"❌ Unexpected Groq API response format: {result}")
                return False
        else:
            print(f"❌ Groq API error: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception testing Groq API: {str(e)}")
        return False

if __name__ == "__main__":
    test_groq_api_key()