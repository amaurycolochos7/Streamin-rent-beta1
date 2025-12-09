-- Fix for user creation error: Missing INSERT policy
-- Run this in Supabase SQL Editor

-- Drop old policy if exists and create new one
DROP POLICY IF EXISTS "Users can insert users" ON users;

CREATE POLICY "Users can insert users" ON users
    FOR INSERT WITH CHECK (true);

-- Add phone_number column to rentals
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Fixes applied successfully!';
    RAISE NOTICE '✅ Users can now be created';
    RAISE NOTICE '✅ Phone number field added to rentals';
END $$;
