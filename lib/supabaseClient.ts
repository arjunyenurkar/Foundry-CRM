import { createClient } from '@supabase/supabase-js';

// Strictly uses variables from .env.local:
// 1. NEXT_PUBLIC_SUPABASE_URL
// 2. SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY
// 3. SUPABASE_SERVICE_ROLE_KEY

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing from .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Service role client for server-side admin tasks
 */
export const getServiceSupabase = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in .env.local');
  }
  return createClient(supabaseUrl, serviceKey);
};
