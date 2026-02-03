-- Migration script to add starred_gpt_ids to users table
-- Run this in Supabase SQL Editor if you already have the database set up

-- Add starred_gpt_ids column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'starred_gpt_ids'
  ) THEN
    ALTER TABLE users ADD COLUMN starred_gpt_ids TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Update existing users to have empty array if null
UPDATE users SET starred_gpt_ids = '{}' WHERE starred_gpt_ids IS NULL;
