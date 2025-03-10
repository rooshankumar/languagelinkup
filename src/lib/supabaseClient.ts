
import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, fallback to hardcoded values otherwise
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://czubndssgwedqqzlsazn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6dWJuZHNzZ3dlZHFxemxzYXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1OTU1MzksImV4cCI6MjA1NzE3MTUzOX0.yZDlA181ESw0_zLM-pY3Eu3gkaneQawkm_u7_PtkQRo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
