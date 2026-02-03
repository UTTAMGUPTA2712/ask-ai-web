# 🚀 Quick Setup Guide

## Step 1: Set Up Supabase Database

1. **Go to your Supabase project dashboard**
   - URL: https://ixlszspganfmmbqxhxtz.supabase.co

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and paste the entire contents** of `/scripts/setup-database.sql` into the editor

4. **Run the script** by clicking "RUN" or pressing `Ctrl+Enter`

This will create:
- ✅ `users` table
- ✅ `chats` table
- ✅ `messages` table
- ✅ `custom_gpts` table
- ✅ Indexes for performance
- ✅ Row Level Security policies

## Step 2: Configure Google OAuth (Already Done)

Since you mentioned Google OAuth is already integrated from your end, this step is complete! ✅

**Verify your settings:**
1. Go to Authentication → Providers → Google
2. Ensure it's enabled and configured
3. Check that your redirect URLs include:
   - `http://localhost:3000/auth/callback` (dev)
   - Your production URL + `/auth/callback`

## Step 3: Start the Application

The application is already running! Access it at:
- **Local**: http://localhost:3000
- **Production**: https://nextgen-aichat.preview.emergentagent.com

## ✨ Features Ready to Use

### For All Users (Guests + Authenticated)
- ✅ Chat with AI (Groq's llama-3.3-70b-versatile)
- ✅ Markdown support in messages
- ✅ Code syntax highlighting
- ✅ Chat history (saved by IP for guests)

### For Authenticated Users Only
- ✅ Google OAuth login
- ✅ Email/Password login
- ✅ Persistent chat history across devices
- ✅ Create custom GPTs with system prompts
- ✅ Switch between different AI personalities

## 🧪 Testing the Application

### Test Guest Mode
1. Open the app without signing in
2. Type a message and send
3. Verify you get an AI response
4. Chat should be saved and visible in the sidebar

### Test Authentication
1. Click "Sign In" button
2. Try both:
   - **Google OAuth**: Click "Sign in with Google"
   - **Email/Password**: Create an account in the "Sign Up" tab

### Test Custom GPTs (Authenticated Users)
1. Sign in
2. Click "New Custom GPT" button
3. Create a GPT, e.g.:
   - Name: "Python Tutor"
   - Description: "Helps with Python programming"
   - System Prompt: "You are an expert Python tutor. Help users learn Python with clear explanations and code examples."
4. Select the new GPT from the sidebar
5. Start a chat and verify it responds according to the custom prompt

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check if tables were created successfully
# Go to Supabase → Table Editor and verify all 4 tables exist
```

### Google OAuth Not Working
1. Verify Google provider is enabled in Supabase
2. Check redirect URLs are correct
3. Ensure Google Client ID and Secret are valid

### AI Not Responding
```bash
# Check Groq API key is valid
# View logs:
tail -f /var/log/supervisor/nextjs.out.log
```

### Application Errors
```bash
# Restart the server
sudo supervisorctl restart nextjs

# Check logs
tail -f /var/log/supervisor/nextjs.out.log
```

## 📊 Database Schema Reference

### users
```sql
id UUID PRIMARY KEY
email TEXT UNIQUE NOT NULL
name TEXT
password TEXT  -- Plain text (DEMO ONLY - NOT SECURE)
google_id TEXT
created_at TIMESTAMP
```

### chats
```sql
id UUID PRIMARY KEY
user_id UUID (nullable - for guests)
guest_ip TEXT (nullable - for guests)
title TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

### messages
```sql
id UUID PRIMARY KEY
chat_id UUID
role TEXT ('user' or 'assistant')
content TEXT
created_at TIMESTAMP
```

### custom_gpts
```sql
id UUID PRIMARY KEY
user_id UUID
name TEXT
description TEXT
system_prompt TEXT
created_at TIMESTAMP
```

## 🎯 Next Steps

1. ✅ Run the SQL script in Supabase SQL Editor
2. ✅ Test the application with guest mode
3. ✅ Test authentication (Google + Email/Password)
4. ✅ Create and test a custom GPT
5. ✅ Verify chat history persists

## 📝 Notes

- **Security Warning**: This is a DEMO application. Passwords are stored as plain text. In production, ALWAYS hash passwords!
- **Guest Mode**: Uses IP address to track chats for non-authenticated users
- **Google Users**: Automatically get a default password "Password123" when first signing in
- **Rate Limits**: No rate limiting implemented - add this for production use

## 🆘 Need Help?

If you encounter any issues:
1. Check the logs: `tail -f /var/log/supervisor/nextjs.out.log`
2. Verify all environment variables are set in `.env`
3. Ensure Supabase tables are created correctly
4. Test API endpoints individually using curl

## 🎉 You're All Set!

Once the database is set up, your AI Chat application is ready to use! Start chatting with AI and creating custom GPTs!
