
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Log configuration for debugging
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key available:", !!supabaseAnonKey);

// Ensure URL has https:// prefix
const formattedUrl = supabaseUrl 
  ? supabaseUrl.startsWith('http') 
    ? supabaseUrl 
    : `https://${supabaseUrl}`
  : '';

// Create Supabase client
let supabase;

try {
  if (!formattedUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase URL or Anon Key');
  }
  
  console.log("Creating Supabase client with URL:", formattedUrl);
  supabase = createClient(formattedUrl, supabaseAnonKey);
  
  // Test connection
  supabase.auth.getSession().then(({ data }) => {
    console.log("Supabase client initialized", data.session ? "with active session" : "without active session");
  }).catch(err => {
    console.error("Error testing Supabase connection:", err);
  });
  
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
  // Provide a fallback client that will produce clear errors when used
  supabase = createClient(
    'https://placeholder.supabase.co', 
    'placeholder-key'
  );
}

export { supabase };
