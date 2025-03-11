
-- SQL script to add new columns to the users table

-- Add date of birth column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dob DATE;

-- Add profile picture column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create or replace policy for users to insert their own data
CREATE OR REPLACE POLICY "Users can insert their own data" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create or replace policy for users to update their own data
CREATE OR REPLACE POLICY "Users can update their own data" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- Create or replace policy for users to select any data
CREATE OR REPLACE POLICY "Users can view all profiles" 
  ON public.users FOR SELECT 
  USING (true);

-- Create storage bucket for user uploads if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user_uploads', 'user_uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Grant access for authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Grant access for everyone to view uploaded files
CREATE POLICY "Everyone can view uploaded files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user_uploads');
