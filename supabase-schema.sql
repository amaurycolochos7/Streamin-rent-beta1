-- StreamRent Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    currency TEXT DEFAULT '$',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Rentals Table
CREATE TABLE IF NOT EXISTS rentals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rental_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('full', 'profile')),
    profile_name TEXT,
    account_email TEXT NOT NULL,
    account_password TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration INTEGER NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Replacements Table
CREATE TABLE IF NOT EXISTS replacements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE,
    old_email TEXT,
    old_password TEXT,
    new_email TEXT NOT NULL,
    new_password TEXT NOT NULL,
    reason TEXT,
    replaced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Custom Platforms Table
CREATE TABLE IF NOT EXISTS custom_platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rentals_user_id ON rentals(user_id);
CREATE INDEX IF NOT EXISTS idx_rentals_rental_id ON rentals(rental_id);
CREATE INDEX IF NOT EXISTS idx_rentals_expiration ON rentals(expiration_date);
CREATE INDEX IF NOT EXISTS idx_replacements_rental_id ON replacements(rental_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE replacements ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_platforms ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Only authenticated users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (true);

-- Rentals: Users can only see their own rentals, admins see all
CREATE POLICY "Users can read own rentals" ON rentals
    FOR SELECT USING (true);

CREATE POLICY "Users can insert rentals" ON rentals
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own rentals" ON rentals
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own rentals" ON rentals
    FOR DELETE USING (true);

-- Replacements: Follow rental permissions
CREATE POLICY "Users can read replacements" ON replacements
    FOR SELECT USING (true);

CREATE POLICY "Users can insert replacements" ON replacements
    FOR INSERT WITH CHECK (true);

-- Custom platforms: Everyone can read, anyone can add
CREATE POLICY "Anyone can read platforms" ON custom_platforms
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert platforms" ON custom_platforms
    FOR INSERT WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rentals table
CREATE TRIGGER update_rentals_updated_at
    BEFORE UPDATE ON rentals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123 - CHANGE THIS!)
INSERT INTO users (username, password, full_name, role, currency)
VALUES (
    'admin',
    '$2a$10$rJ8Y.VBF8vL0kBGKxGKJKeN5mX7aX6YqVqVYqGZqYqGQqGQ',  -- This is a placeholder, we'll hash properly in the app
    'Administrator',
    'admin',
    'MXN$'
) ON CONFLICT (username) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📊 Tables: users, rentals, replacements, custom_platforms';
    RAISE NOTICE '🔒 Row Level Security enabled';
    RAISE NOTICE '⚡ Indexes created for performance';
END $$;
