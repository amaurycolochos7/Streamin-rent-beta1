import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function runMigration() {
    console.log('🔄 Running migration: Add phone_number column...');

    try {
        // Note: This requires using the service role key for DDL operations
        // The anon key doesn't have permissions to alter tables
        console.log('\n⚠️  IMPORTANT: You need to run this SQL manually in Supabase SQL Editor:');
        console.log('\nALTER TABLE rentals ADD COLUMN IF NOT EXISTS phone_number TEXT;\n');
        console.log('Steps:');
        console.log('1. Go to https://supabase.com/dashboard');
        console.log('2. Select your StreamRent project');
        console.log('3. Click "SQL Editor" in the left menu');
        console.log('4. Paste the SQL above');
        console.log('5. Click "Run"\n');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    }
}

runMigration();
