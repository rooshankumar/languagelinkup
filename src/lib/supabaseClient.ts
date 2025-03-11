import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true
  }
});

// Log init for debugging
console.log('Supabase client initialized:', supabase);

// Debug function to check auth status
export const checkAuthStatus = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Auth error:', error.message);
    return null;
  }
  return data.session;
};