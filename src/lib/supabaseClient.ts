
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://czubndssgwedqqzlsazn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6dWJuZHNzZ3dlZHFxemxzYXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1OTU1MzksImV4cCI6MjA1NzE3MTUzOX0.yZDlA181ESw0_zLM-pY3Eu3gkaneQawkm_u7_PtkQRo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
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

// Console log for debugging
console.log("Supabase client initialized:", supabase);
