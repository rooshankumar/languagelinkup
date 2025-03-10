/**
 * Environment variables helper for Vite
 * Safely access environment variables with fallbacks
 */

export const env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string,

  // Add other environment variables as needed
};

/**
 * Validates the required environment variables are present
 * @returns An object with validation results
 */
export const validateEnv = () => {
  const requiredVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error(`Missing environment variables: ${missingVars.join(', ')}`);
    console.error('Please check your .env file');
    return { valid: false, missingVars };
  }

  console.log('Environment variables validated successfully');
  return { valid: true, missingVars: [] };
};