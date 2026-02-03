-- Migration to adapt existing schema for AI Chat app
-- This will NOT delete any existing data

-- 1. Add guest_ip column to chats table (for guest mode support)
ALTER TABLE public.chats 
ADD COLUMN IF NOT EXISTS guest_ip TEXT;

-- 2. Make user_id nullable in chats (to support guest users)
ALTER TABLE public.chats 
ALTER COLUMN user_id DROP NOT NULL;

-- 3. Add updated_at to chats if it doesn't exist
ALTER TABLE public.chats 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 4. Update existing chats to have updated_at value if NULL
UPDATE public.chats 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- 5. Add name column to profiles if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS name TEXT;

-- 6. Add google_id to profiles if it doesn't exist (for OAuth tracking)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS google_id TEXT;

-- 7. Add created_at to profiles if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 8. Update custom_gpts to reference profiles via auth.users if needed
-- (Already correct in your schema)

-- 9. Create index for guest_ip lookups
CREATE INDEX IF NOT EXISTS idx_chats_guest_ip ON public.chats(guest_ip);

-- 10. Create index for user_id lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);

-- 11. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_gpts_user_id ON public.custom_gpts(user_id);

-- 12. Add a trigger to auto-update the updated_at column on chats
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_chats_updated_at ON public.chats;
CREATE TRIGGER update_chats_updated_at 
    BEFORE UPDATE ON public.chats 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 13. Ensure RLS policies exist (if you want to use service role, these can be permissive)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_gpts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Enable all for service role" ON public.profiles;
DROP POLICY IF EXISTS "Enable all for service role" ON public.chats;
DROP POLICY IF EXISTS "Enable all for service role" ON public.messages;
DROP POLICY IF EXISTS "Enable all for service role" ON public.custom_gpts;

-- Create permissive policies for service role (your backend uses service role key)
CREATE POLICY "Enable all for service role" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON public.chats FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON public.messages FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON public.custom_gpts FOR ALL USING (true);

-- Note: If you want user-specific RLS policies, you can add them later
-- For now, we're using permissive policies since the backend uses service role key
