import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ziukcuryinytxyisflso.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdWtjdXJ5aW55dHh5aXNmbHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTE1NzEsImV4cCI6MjEwMjQ2NzU3MX0.68slTyMqY3xVpKc1lAt4yIQ3otonQiPC-UhznwIWQCQ',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdWtjdXJ5aW55dHh5aXNmbHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTE1NzEsImV4cCI6MjEwMjQ2NzU3MX0.68slTyMqY3xVpKc1lAt4yIQ3otonQiPC-UhznwIWQCQ',
  }
};

export default nextConfig;
