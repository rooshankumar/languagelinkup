
import { createClient } from '@supabase/supabase-js';

// Get environment variables 
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key available:", !!supabaseAnonKey);

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
