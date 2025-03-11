import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create the Supabase client singleton
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Debug function to check auth status
export const checkAuthStatus = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Auth error:', error.message);
    return null;
  }
  return data.session;
};