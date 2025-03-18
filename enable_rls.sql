
-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to avatars
CREATE POLICY "Give public access to avatars"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'avatars' );

-- Allow authenticated users to upload avatars
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

-- Allow users to update their own avatars
CREATE POLICY "Allow users to update their avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' );

-- Allow users to delete their own avatars
CREATE POLICY "Allow users to delete their avatars"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'avatars' );
-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Allow users to create conversations
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT
  WITH CHECK (auth.uid() IN (user1_id, user2_id));

-- Allow users to view their own conversations
CREATE POLICY "Users can view their own conversations" ON conversations FOR SELECT
  USING (auth.uid() IN (user1_id, user2_id));

-- Allow users to read conversations they're part of
CREATE POLICY "Users can read their own conversations" ON conversations FOR SELECT
  USING (auth.uid() IN (user1_id, user2_id));

-- Allow users to update their own conversations
CREATE POLICY "Users can update their own conversations" ON conversations FOR UPDATE
  USING (auth.uid() IN (user1_id, user2_id))
  WITH CHECK (auth.uid() IN (user1_id, user2_id));
