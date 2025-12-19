-- ================================================
-- StreamRent Database Schema - COMPLETE VERSION
-- Con soporte para Combos
-- ================================================
-- Ejecuta este SQL completo en tu nuevo proyecto de Supabase
-- Panel de Supabase > SQL Editor > New Query > Pegar > Run

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. USERS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    currency TEXT DEFAULT '$',
    subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_duration_months INTEGER DEFAULT 1,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 2. RENTALS TABLE (con soporte para Combos)
-- ================================================
CREATE TABLE IF NOT EXISTS rentals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rental_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Customer info
    customer_name TEXT NOT NULL,
    phone_number TEXT,
    
    -- Platform info
    platform TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('full', 'profile', 'combo')),
    profile_name TEXT,
    
    -- Account credentials (for single accounts)
    account_email TEXT NOT NULL,
    account_password TEXT NOT NULL,
    
    -- Pricing
    price DECIMAL(10, 2) NOT NULL,
    
    -- Dates
    duration INTEGER NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Notes
    notes TEXT,
    
    -- ===== COMBO FIELDS =====
    is_combo BOOLEAN DEFAULT FALSE,
    pricing_type TEXT DEFAULT 'total' CHECK (pricing_type IN ('total', 'individual')),
    combo_price DECIMAL(10, 2),
    accounts JSONB DEFAULT '[]'::jsonb,
    -- accounts stores array of: {platform, profileName, accountEmail, accountPassword, price}
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 3. REPLACEMENTS TABLE (Reposiciones de cuentas)
-- ================================================
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

-- ================================================
-- 4. CUSTOM PLATFORMS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS custom_platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- INDEXES for better performance
-- ================================================
CREATE INDEX IF NOT EXISTS idx_rentals_user_id ON rentals(user_id);
CREATE INDEX IF NOT EXISTS idx_rentals_rental_id ON rentals(rental_id);
CREATE INDEX IF NOT EXISTS idx_rentals_expiration ON rentals(expiration_date);
CREATE INDEX IF NOT EXISTS idx_rentals_customer ON rentals(customer_name);
CREATE INDEX IF NOT EXISTS idx_rentals_is_combo ON rentals(is_combo);
CREATE INDEX IF NOT EXISTS idx_replacements_rental_id ON replacements(rental_id);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE replacements ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_platforms ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update users" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can delete users" ON users FOR DELETE USING (true);

-- Rentals policies
CREATE POLICY "Users can read rentals" ON rentals FOR SELECT USING (true);
CREATE POLICY "Users can insert rentals" ON rentals FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update rentals" ON rentals FOR UPDATE USING (true);
CREATE POLICY "Users can delete rentals" ON rentals FOR DELETE USING (true);

-- Replacements policies
CREATE POLICY "Users can read replacements" ON replacements FOR SELECT USING (true);
CREATE POLICY "Users can insert replacements" ON replacements FOR INSERT WITH CHECK (true);

-- Custom platforms policies
CREATE POLICY "Anyone can read platforms" ON custom_platforms FOR SELECT USING (true);
CREATE POLICY "Anyone can insert platforms" ON custom_platforms FOR INSERT WITH CHECK (true);

-- ================================================
-- TRIGGERS
-- ================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rentals_updated_at
    BEFORE UPDATE ON rentals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate subscription_end_date
CREATE OR REPLACE FUNCTION calculate_subscription_end_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subscription_start_date IS NOT NULL AND NEW.subscription_duration_months IS NOT NULL THEN
        NEW.subscription_end_date = NEW.subscription_start_date + (NEW.subscription_duration_months || ' months')::interval;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calc_subscription_end
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION calculate_subscription_end_date();

-- ================================================
-- DEFAULT ADMIN USER
-- ================================================
-- Usuario: admin
-- Contraseña: admin123 (CAMBIAR EN PRODUCCIÓN)
INSERT INTO users (username, password, full_name, role, currency)
VALUES (
    'admin',
    'admin123',
    'Administrador',
    'admin',
    'MXN$'
) ON CONFLICT (username) DO NOTHING;

-- ================================================
-- SUCCESS MESSAGE
-- ================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ¡Base de datos creada exitosamente!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tablas creadas:';
    RAISE NOTICE '   - users (usuarios)';
    RAISE NOTICE '   - rentals (rentas con soporte combo)';
    RAISE NOTICE '   - replacements (reposiciones)';
    RAISE NOTICE '   - custom_platforms (plataformas personalizadas)';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Usuario admin creado:';
    RAISE NOTICE '   Usuario: admin';
    RAISE NOTICE '   Contraseña: admin123';
    RAISE NOTICE '';
    RAISE NOTICE '⚡ Ahora conecta tu proyecto con las credenciales de Supabase';
END $$;
