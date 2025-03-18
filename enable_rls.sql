
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
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

-- RLS Policies
CREATE POLICY "Users can see their own chats"
ON public.chats
FOR SELECT
TO authenticated
USING (
  auth.uid() = user1_id OR 
  auth.uid() = user2_id
);

CREATE POLICY "Users can see messages in their chats"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  chat_id IN (
    SELECT id FROM public.chats 
    WHERE user1_id = auth.uid() OR user2_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in their chats"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  chat_id IN (
    SELECT id FROM public.chats 
    WHERE user1_id = auth.uid() OR user2_id = auth.uid()
  )
);
