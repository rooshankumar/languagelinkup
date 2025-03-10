
/**
 * Environment variables helper for Vite
 * Safely access environment variables with fallbacks
 */

export const env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  
  // Add other environment variables as needed
};

// Validate required environment variables
export const validateEnv = () => {
  const missingVars = [];
  
  if (!env.SUPABASE_URL) missingVars.push('VITE_SUPABASE_URL');
  if (!env.SUPABASE_ANON_KEY) missingVars.push('VITE_SUPABASE_ANON_KEY');
  
  if (missingVars.length > 0) {
    console.error(`Missing environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
};
