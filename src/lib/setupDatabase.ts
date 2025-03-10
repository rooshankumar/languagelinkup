
import { supabase } from './supabaseClient';

export async function setupDatabase() {
  console.log('Setting up database tables...');
  
  try {
    // Create user_languages table if it doesn't exist
    const { error: userLanguagesError } = await supabase.sql`
      CREATE TABLE IF NOT EXISTS user_languages (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id),
        native_language VARCHAR(10) NOT NULL,
        learning_language VARCHAR(10) NOT NULL,
        proficiency_level VARCHAR(20) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );
    `;
    
    if (userLanguagesError) {
      console.error('Failed to create user_languages table:', userLanguagesError);
    } else {
      console.log('user_languages table is ready');
    }
    
    return !userLanguagesError;
  } catch (error) {
    console.error('Database setup failed:', error);
    return false;
  }
}
