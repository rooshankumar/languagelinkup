
-- Drop existing constraints if they exist
ALTER TABLE chats DROP CONSTRAINT IF EXISTS chats_user1_id_fkey;
ALTER TABLE chats DROP CONSTRAINT IF EXISTS chats_user2_id_fkey;
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_chat_id_fkey;
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_id_fkey;

-- Add correct foreign keys for chats
ALTER TABLE chats 
ADD CONSTRAINT fk_chats_user1 FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE chats 
ADD CONSTRAINT fk_chats_user2 FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add correct foreign keys for chat_messages
ALTER TABLE chat_messages
ADD CONSTRAINT fk_chat_messages_chat FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE;

ALTER TABLE chat_messages
ADD CONSTRAINT fk_chat_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chats_user1_id ON chats(user1_id);
CREATE INDEX IF NOT EXISTS idx_chats_user2_id ON chats(user2_id);
