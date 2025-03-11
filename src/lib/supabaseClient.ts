
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
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Log initialization for debugging
console.log('Supabase client initialized:', {
  supabaseUrl,
  supabaseKey,
  // Include other non-sensitive details for debugging
  realtimeUrl: `${supabaseUrl}/realtime/v1`,
  authUrl: `${supabaseUrl}/auth/v1`,
  storageUrl: `${supabaseUrl}/storage/v1`,
  functionsUrl: `${supabaseUrl}/functions/v1`
});

export default supabase;
