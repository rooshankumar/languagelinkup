import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env file');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
supabase.auth.getSession().then(({ data }) => {
  console.log("Supabase connection status:", data.session ? "Active session found" : "No active session");
}).catch(err => {
  console.error("Error connecting to Supabase:", err.message);
});