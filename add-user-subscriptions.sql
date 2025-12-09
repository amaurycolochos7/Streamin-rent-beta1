-- =====================================================
-- Migración: Suscripciones SOLO para Usuarios Regulares
-- =====================================================
-- Los ADMINISTRADORES NO tienen límite de tiempo
-- Solo los USUARIOS REGULARES tienen suscripción
-- =====================================================

-- Agregar campos de suscripción
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_duration_months INTEGER,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;

-- Función para calcular fecha de fin
CREATE OR REPLACE FUNCTION calculate_subscription_end_date(
    start_date TIMESTAMP WITH TIME ZONE,
    duration_months INTEGER
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN start_date + (duration_months || ' months')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Actualizar SOLO usuarios regulares existentes (12 meses)
-- Los administradores NO reciben suscripción
UPDATE users 
SET 
    subscription_start_date = NOW(),
    subscription_duration_months = 12,
    subscription_end_date = NOW() + INTERVAL '12 months'
WHERE role = 'user' AND subscription_end_date IS NULL;

-- Trigger para auto-calcular fecha fin (solo para usuarios regulares)
CREATE OR REPLACE FUNCTION update_subscription_end_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo calcular para usuarios regulares, no para admins
    IF NEW.role = 'user' AND NEW.subscription_start_date IS NOT NULL AND NEW.subscription_duration_months IS NOT NULL THEN
        NEW.subscription_end_date := NEW.subscription_start_date + (NEW.subscription_duration_months || ' months')::INTERVAL;
    ELSIF NEW.role = 'admin' THEN
        -- Admins no tienen suscripción
        NEW.subscription_start_date := NULL;
        NEW.subscription_duration_months := NULL;
        NEW.subscription_end_date := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subscription_end_date ON users;

CREATE TRIGGER trigger_update_subscription_end_date
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_end_date();
