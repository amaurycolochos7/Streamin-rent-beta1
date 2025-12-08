// Script para arreglar la contraseña del admin en Supabase
// Ejecuta: node fix-admin-password.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hyldfdiislwggfycoanz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5bGRmZGlpc2x3Z2dmeWNvYW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjc2MTUsImV4cCI6MjA4MDgwMzYxNX0.PNRwMj4AOHbPpTS-nkBMAulyZp-ZdwKZ63-Xpe4Kss8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAdminPassword() {
    console.log('🔧 Arreglando contraseña del administrador...');

    const correctPassword = 'Sm9tb3BvbnNl'; // Hash de "Jomoponse"

    try {
        // Intentar actualizar la contraseña
        const { data, error } = await supabase
            .from('users')
            .update({ password: correctPassword })
            .eq('username', 'Jomoponse1')
            .select();

        if (error) {
            console.error('❌ Error:', error.message);
            console.log('\n📝 Solución alternativa:');
            console.log('Ve a Supabase SQL Editor y ejecuta:');
            console.log('\nALTER TABLE users DISABLE ROW LEVEL SECURITY;');
            console.log(`UPDATE users SET password = '${correctPassword}' WHERE username = 'Jomoponse1';`);
            console.log('ALTER TABLE users ENABLE ROW LEVEL SECURITY;\n');
            return;
        }

        if (data && data.length > 0) {
            console.log('✅ ¡Contraseña actualizada correctamente!');
            console.log('\nAhora puedes hacer login con:');
            console.log('Usuario: Jomoponse1');
            console.log('Contraseña: Jomoponse\n');
        } else {
            console.log('⚠️  No se encontró el usuario Jomoponse1');
        }
    } catch (err) {
        console.error('❌ Error inesperado:', err);
    }
}

fixAdminPassword();
