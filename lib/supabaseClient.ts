import { createClient } from '@supabase/supabase-js';

// Fallback values direct from your .env.local in case Next.js Turbopack client bundler strips non-prefixed env vars
const DEFAULT_URL = 'https://ziukcuryinytxyisflso.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdWtjdXJ5aW55dHh5aXNmbHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTE1NzEsImV4cCI6MjEwMjQ2NzU3MX0.68slTyMqY3xVpKc1lAt4yIQ3otonQiPC-UhznwIWQCQ';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Service role client for server-side API routes
 */
export const getServiceSupabase = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdWtjdXJ5aW55dHh5aXNmbHNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg5MTU3MSwiZXhwIjoyMTAyNDY3NTcxfQ.bX8NkMBXAxrY3GgSL7ASX6QxD0MQDqqkZ1QHffbPSSQ';
  return createClient(supabaseUrl, serviceKey);
};
