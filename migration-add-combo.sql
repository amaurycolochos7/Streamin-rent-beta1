-- ================================================
-- MIGRACIÓN: Agregar soporte de Combos a tabla rentals
-- ================================================
-- Ejecuta esto en Supabase SQL Editor si ya tienes las tablas creadas

-- 1. Agregar columnas de combo a rentals
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS is_combo BOOLEAN DEFAULT FALSE;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS pricing_type TEXT DEFAULT 'total';
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS combo_price DECIMAL(10, 2);
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS accounts JSONB DEFAULT '[]'::jsonb;

-- 2. Agregar constraint de pricing_type si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'rentals_pricing_type_check'
    ) THEN
        ALTER TABLE rentals ADD CONSTRAINT rentals_pricing_type_check 
            CHECK (pricing_type IN ('total', 'individual'));
    END IF;
END $$;

-- 3. Agregar 'combo' como opción válida en account_type si no está
-- Primero eliminar el constraint viejo y recrear con 'combo'
ALTER TABLE rentals DROP CONSTRAINT IF EXISTS rentals_account_type_check;
ALTER TABLE rentals ADD CONSTRAINT rentals_account_type_check 
    CHECK (account_type IN ('full', 'profile', 'combo'));

-- 4. Agregar updated_at si no existe
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Crear índices faltantes
CREATE INDEX IF NOT EXISTS idx_rentals_is_combo ON rentals(is_combo);
CREATE INDEX IF NOT EXISTS idx_rentals_user_id ON rentals(user_id);
CREATE INDEX IF NOT EXISTS idx_rentals_rental_id ON rentals(rental_id);
CREATE INDEX IF NOT EXISTS idx_rentals_expiration ON rentals(expiration_date);
CREATE INDEX IF NOT EXISTS idx_rentals_customer ON rentals(customer_name);

-- 6. Crear/actualizar trigger de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_rentals_updated_at ON rentals;
CREATE TRIGGER update_rentals_updated_at
    BEFORE UPDATE ON rentals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Asegurar trigger de subscription_end_date
CREATE OR REPLACE FUNCTION calculate_subscription_end_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subscription_start_date IS NOT NULL AND NEW.subscription_duration_months IS NOT NULL THEN
        NEW.subscription_end_date = NEW.subscription_start_date + (NEW.subscription_duration_months || ' months')::interval;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_calc_subscription_end ON users;
CREATE TRIGGER auto_calc_subscription_end
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION calculate_subscription_end_date();

-- ✅ Listo
DO $$
BEGIN
    RAISE NOTICE '✅ Migración completada exitosamente!';
    RAISE NOTICE '   - Columnas de combo agregadas a rentals';
    RAISE NOTICE '   - Índices creados';
    RAISE NOTICE '   - Triggers actualizados';
END $$;
