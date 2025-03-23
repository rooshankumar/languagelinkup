
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS last_sign_in TIMESTAMP WITH TIME ZONE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_username_idx ON public.users(username);
CREATE INDEX IF NOT EXISTS users_google_id_idx ON public.users(google_id);
