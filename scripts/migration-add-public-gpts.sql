-- Migration script to add is_public field to existing custom_gpts table
-- Run this in Supabase SQL Editor if you already have the database set up

-- Add is_public column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'custom_gpts' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE custom_gpts ADD COLUMN is_public BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create index on is_public for better performance
CREATE INDEX IF NOT EXISTS idx_custom_gpts_public ON custom_gpts(is_public);

-- Update existing GPTs to be private by default
UPDATE custom_gpts SET is_public = false WHERE is_public IS NULL;
