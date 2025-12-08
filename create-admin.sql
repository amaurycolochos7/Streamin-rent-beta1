-- Crear usuario administrador personalizado
-- Ejecuta esto en Supabase SQL Editor

-- Primero, elimina el usuario admin por defecto si existe
DELETE FROM users WHERE username = 'admin';

-- Crear tu usuario administrador
INSERT INTO users (username, password, full_name, role, currency)
VALUES (
    'Jomoponse1',
    '$2a$10$YourHashedPasswordWillGoHere',  -- Se reemplazará con el hash real
    'Administrador Principal',
    'admin',
    'MXN$'
);

-- Verificar que se creó
SELECT username, full_name, role FROM users WHERE role = 'admin';
