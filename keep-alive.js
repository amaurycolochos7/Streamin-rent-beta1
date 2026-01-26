/**
 * Supabase Keep-Alive Script
 * 
 * Este script hace un ping a la base de datos de Supabase cada cierto tiempo
 * para evitar que se pause por inactividad (7 días en el plan gratuito).
 * 
 * Opciones para ejecutar:
 * 1. Manualmente: node keep-alive.js
 * 2. Con cron job (Linux): 0 */6 * * * node / ruta / keep - alive.js
    * 3. Con Task Scheduler(Windows)
        * 4. Con un servicio gratuito como cron - job.org o GitHub Actions
            */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY deben estar configuradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function keepAlive() {
    const timestamp = new Date().toISOString();
    console.log(`\n🔄 [${timestamp}] Ejecutando keep-alive ping...`);

    try {
        // Hacer una consulta simple para mantener la base de datos activa
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .limit(1);

        if (error) {
            console.error('❌ Error en la consulta:', error.message);
            return false;
        }

        console.log('✅ Ping exitoso - Base de datos activa');
        console.log(`   URL: ${supabaseUrl}`);
        console.log(`   Registros verificados: ${data?.length || 0}`);
        return true;

    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        return false;
    }
}

// Ejecutar inmediatamente
keepAlive();

// Si quieres que se ejecute continuamente (cada 6 horas), descomenta esto:
// const SIX_HOURS = 6 * 60 * 60 * 1000;
// setInterval(keepAlive, SIX_HOURS);
// console.log('🔁 Keep-alive iniciado - ejecutándose cada 6 horas');
