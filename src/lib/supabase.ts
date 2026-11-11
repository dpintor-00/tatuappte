import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string, viteKey: string, fallback: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
    return import.meta.env[viteKey];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return fallback;
};

const supabaseUrl = getEnvVar(
  'SUPABASE_URL',
  'VITE_SUPABASE_URL',
  'https://kgkrhrxsztbzbwlcwtvt.supabase.co'
);

const supabaseAnonKey = getEnvVar(
  'SUPABASE_ANON_KEY',
  'VITE_SUPABASE_ANON_KEY',
  ''
);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-supabase-anon-key')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;
