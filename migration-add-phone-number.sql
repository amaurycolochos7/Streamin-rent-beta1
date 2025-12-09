-- Add phone_number column to rentals table
-- Run this in Supabase SQL Editor

ALTER TABLE rentals 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Success notification
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE '📱 Added phone_number column to rentals table';
END $$;
