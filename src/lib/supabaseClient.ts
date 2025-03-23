import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// ✅ Single Supabase client initialization
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,  // Keeps the user logged in
    autoRefreshToken: true, // Refreshes session automatically
    detectSessionInUrl: true, // Handles OAuth redirects correctly
    flowType: 'pkce', // PKCE for better security
  },
});
