import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://pfzxtfttmpicpurvgsnf.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cXYGVFB9STQaoiXM7lulpg_MwjMf6GU';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL ou chave anon não configurada. Verifique o arquivo .env');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    }
  }
);
