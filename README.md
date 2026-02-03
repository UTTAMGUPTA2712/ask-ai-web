# AI Chat Application

A ChatGPT-like chat application with custom GPTs, built with Next.js, Supabase, and Groq AI.

## Features

- 🤖 **AI-Powered Chat**: Powered by Groq's llama-3.3-70b-versatile model
- 👤 **Authentication**: Google OAuth + Email/Password via Supabase
- 🎭 **Custom GPTs**: Create and save custom AI personalities with system prompts
- 💬 **Chat History**: Persistent chat history across sessions
- 🌐 **Guest Mode**: Non-authenticated users can chat (history saved by IP)
- 🎨 **Clean UI**: Perplexity-style minimalist interface
- 📱 **Responsive**: Works on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: Zustand
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq API (llama-3.3-70b-versatile)
- **Markdown**: React Markdown with syntax highlighting

## Prerequisites

1. Node.js 18+ and Yarn
2. Supabase account and project
3. Groq API key

## Setup Instructions

### 1. Install Dependencies

```bash
yarn install
```

### 2. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `/scripts/setup-database.sql`

This will create the following tables:
- `users` - User accounts
- `chats` - Chat sessions
- `messages` - Chat messages
- `custom_gpts` - Custom GPT configurations

### 3. Configure Google OAuth in Supabase

1. Go to Authentication > Providers in Supabase dashboard
2. Enable Google provider
3. Add your Google OAuth credentials
4. Add authorized redirect URLs:
   - `http://localhost:3000/auth/callback` (for development)
   - Your production URL + `/auth/callback`

### 4. Environment Variables

The `.env` file is already configured with:

```env
# Groq API
GROQ_API_KEY=XXXX

# Supabase
NEXT_PUBLIC_SUPABASE_URL=XXX
NEXT_PUBLIC_SUPABASE_ANON_KEY=XXX...
SUPABASE_SERVICE_ROLE_KEY=XXX...
```

### 5. Run the Application

```bash
yarn dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
/app
├── app/
│   ├── api/
│   │   └── [[...path]]/
│   │       └── route.js          # All API endpoints
│   ├── auth/
│   │   └── callback/
│   │       └── page.js            # OAuth callback handler
│   ├── page.js                    # Main page
│   ├── layout.js                  # Root layout
│   └── globals.css                # Global styles
├── components/
│   ├── AuthModal.jsx              # Login/Signup modal
│   ├── ChatInterface.jsx          # Main chat interface
│   ├── ChatMessage.jsx            # Message component with markdown
│   ├── CustomGPTModal.jsx         # Create custom GPT modal
│   ├── Sidebar.jsx                # Sidebar with chat history
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── supabase/
│   │   ├── client.js              # Supabase client (browser)
│   │   └── server.js              # Supabase admin (server)
│   ├── store/
│   │   └── useStore.js            # Zustand state management
│   └── utils/
│       └── getClientIP.js         # IP extraction utility
└── scripts/
    └── setup-database.sql         # Database schema
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create user account

### Chat
- `POST /api/chat` - Send message and get AI response
- `GET /api/chats` - Get user's chat history
- `GET /api/chats/:id/messages` - Get messages for a chat

### Custom GPTs
- `POST /api/custom-gpts` - Create custom GPT
- `GET /api/custom-gpts` - Get user's custom GPTs

## How It Works

### Authentication Flow

1. **Google OAuth**:
   - User clicks "Sign in with Google"
   - Redirected to Google for authentication
   - On success, redirected to `/auth/callback`
   - User record created with default password "Password123"

2. **Email/Password**:
   - User signs up with email and password
   - Password stored as plain text (⚠️ DEMO ONLY - NOT SECURE)
   - User can sign in with credentials

### Chat Flow

1. User types a message and clicks send
2. Message saved to database
3. Request sent to Groq API with:
   - System prompt (default or from selected custom GPT)
   - Previous messages for context
   - Current message
4. AI response received and saved
5. UI updated with response

### Guest Mode

- Non-authenticated users can chat
- Chat history saved using client IP address
- Limited features (can't create custom GPTs)

### Custom GPTs

- Authenticated users can create custom GPTs
- Each GPT has:
  - Name
  - Description (optional)
  - System prompt
- Selected GPT's system prompt used for all messages in that chat

## Database Schema

### users
- `id` (UUID) - Primary key, matches Supabase Auth user ID
- `email` (TEXT) - User email
- `name` (TEXT) - User name
- `password` (TEXT) - Plain text password (DEMO ONLY)
- `google_id` (TEXT) - Google OAuth ID
- `created_at` (TIMESTAMP)

### chats
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users (nullable for guests)
- `guest_ip` (TEXT) - IP address for guest users
- `title` (TEXT) - Chat title
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### messages
- `id` (UUID) - Primary key
- `chat_id` (UUID) - Foreign key to chats
- `role` (TEXT) - 'user' or 'assistant'
- `content` (TEXT) - Message content
- `created_at` (TIMESTAMP)

### custom_gpts
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `name` (TEXT) - GPT name
- `description` (TEXT) - GPT description
- `system_prompt` (TEXT) - System prompt
- `created_at` (TIMESTAMP)

## Security Notes

⚠️ **IMPORTANT**: This is a DEMO application with intentional security issues:

1. **Plain Text Passwords**: Passwords are stored as plain text in the database. In production, ALWAYS hash passwords using bcrypt or similar.

2. **Row Level Security**: While RLS is enabled, policies allow all operations. In production, implement proper RLS policies.

3. **Rate Limiting**: No rate limiting implemented. Add rate limiting for production.

4. **Input Validation**: Minimal input validation. Add comprehensive validation for production.

## Customization

### Change AI Model

Edit `/app/app/api/[[...path]]/route.js`:

```javascript
const MODEL_NAME = 'llama-3.3-70b-versatile'; // Change this
```

### Modify UI Theme

Edit `/app/app/globals.css` to change colors and theme.

### Add More Features

- Implement streaming responses for real-time typing
- Add image generation capabilities
- Implement file uploads
- Add search functionality
- Implement chat sharing

## Troubleshooting

### "Failed to connect to Supabase"
- Check your Supabase URL and keys in `.env`
- Ensure your Supabase project is active

### "Groq API error"
- Verify your Groq API key
- Check API rate limits
- Ensure model name is correct

### "Google login not working"
- Verify Google OAuth is configured in Supabase
- Check redirect URLs are correct
- Ensure Google credentials are valid

### Database errors
- Run the SQL setup script in Supabase SQL Editor
- Check table names match the schema
- Verify RLS policies are not blocking operations

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
