
import { createClient } from '@supabase/supabase-js';

// Get environment variables from import.meta.env (Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ensure URL is properly formatted with https://
const formattedUrl = supabaseUrl && !supabaseUrl.startsWith('https://') 
  ? `https://${supabaseUrl}` 
  : supabaseUrl;

// Validate URL before creating client
if (!formattedUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key. Check your .env file.');
}

// Create and export the Supabase client
export const supabase = createClient(
  formattedUrl || 'https://czubndssgwedqqzlsazn.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6dWJuZHNzZ3dlZHFxemxzYXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1OTU1MzksImV4cCI6MjA1NzE3MTUzOX0.yZDlA181ESw0_zLM-pY3Eu3gkaneQawkm_u7_PtkQRo'
);
