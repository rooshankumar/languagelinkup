
-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Storage policies
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user_uploads');

CREATE POLICY "Allow authenticated users to update their files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'user_uploads' AND auth.uid() = owner);

CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'user_uploads');

-- Users policy
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read all profiles"
ON public.users
FOR SELECT
TO authenticated
USING (true);
