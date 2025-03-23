-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all profiles"
ON public.users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create chat tables if they don't exist
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user1_id UUID REFERENCES public.users(id) NOT NULL,
  user2_id UUID REFERENCES public.users(id) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  attachment_url TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS chats_user1_id_idx ON public.chats(user1_id);
CREATE INDEX IF NOT EXISTS chats_user2_id_idx ON public.chats(user2_id);
CREATE INDEX IF NOT EXISTS chat_messages_chat_id_idx ON public.chat_messages(chat_id);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can see their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can see messages in their chats" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages in their chats" ON public.chat_messages;

-- Allow authenticated users to read their own chat messages
CREATE POLICY "Users can read chat messages"
ON public.chat_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE id = chat_messages.chat_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- Allow authenticated users to insert chat messages in their chats
CREATE POLICY "Users can insert chat messages"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE id = chat_messages.chat_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- RLS Policies
CREATE POLICY "Users can see their own chats"
ON public.chats
FOR ALL
TO authenticated
USING (
  auth.uid() = user1_id OR 
  auth.uid() = user2_id
);


-- Enable RLS
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to avatars bucket
CREATE POLICY "Public Access to Avatars" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars' AND owner IS NOT NULL
  );