import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://czubndssgwedqqzlsazn.supabase.co'; // Replace with your actual Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6dWJuZHNzZ3dlZHFxemxzYXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1OTU1MzksImV4cCI6MjA1NzE3MTUzOX0.yZDlA181ESw0_zLM-pY3Eu3gkaneQawkm_u7_PtkQRo'; // Replace with your actual Anon Key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,  // Ensures session is stored between reloads
    autoRefreshToken: true, // Auto-refreshes session when needed
    detectSessionInUrl: true, // Detects if session is in URL
  },
});

// 🔍 **Debugging: Check if Supabase is initializing correctly**
console.log("Supabase client initialized:", supabase);


