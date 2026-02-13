import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '⚠️ EISC: Supabase no está configurado. Crea un archivo .env con:\n' +
        '   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co\n' +
        '   VITE_SUPABASE_ANON_KEY=tu-clave-anon\n' +
        '   La app funcionará en modo demo (datos en memoria).'
    );
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = () => !!supabase;
