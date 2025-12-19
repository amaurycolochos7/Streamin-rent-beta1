-- Migration: Add combo support to rentals table
-- Run this in your Supabase SQL Editor

-- Add combo-related columns to rentals table
ALTER TABLE rentals 
ADD COLUMN IF NOT EXISTS is_combo BOOLEAN DEFAULT FALSE;

ALTER TABLE rentals 
ADD COLUMN IF NOT EXISTS pricing_type TEXT DEFAULT 'total' CHECK (pricing_type IN ('total', 'individual'));

ALTER TABLE rentals 
ADD COLUMN IF NOT EXISTS combo_price DECIMAL(10, 2);

-- Add accounts column as JSONB to store array of accounts for combos
ALTER TABLE rentals 
ADD COLUMN IF NOT EXISTS accounts JSONB DEFAULT '[]'::jsonb;

-- Add phone number column if not exists
ALTER TABLE rentals 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Make account_type accept 'combo' as well
ALTER TABLE rentals 
DROP CONSTRAINT IF EXISTS rentals_account_type_check;

ALTER TABLE rentals 
ADD CONSTRAINT rentals_account_type_check 
CHECK (account_type IN ('full', 'profile', 'combo'));

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Combo support added to rentals table!';
    RAISE NOTICE '📦 New columns: is_combo, pricing_type, combo_price, accounts';
END $$;
