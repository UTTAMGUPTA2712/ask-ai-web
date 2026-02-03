-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT, -- Plain text as per requirement (NOT SECURE - DEMO ONLY)
  google_id TEXT,
  starred_gpt_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guest_ip TEXT,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custom_gpts table
CREATE TABLE IF NOT EXISTS custom_gpts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_guest_ip ON chats(guest_ip);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_custom_gpts_user_id ON custom_gpts(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_gpts_public ON custom_gpts(is_public);

-- Enable Row Level Security (RLS) - Optional for demo
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_gpts ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing service role to bypass for simplicity)
CREATE POLICY IF NOT EXISTS "Enable all for service role" ON users FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Enable all for service role" ON chats FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Enable all for service role" ON messages FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Enable all for service role" ON custom_gpts FOR ALL USING (true);
