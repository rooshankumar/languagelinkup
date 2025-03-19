
-- Add foreign key constraints for chats table
ALTER TABLE chats
ADD CONSTRAINT fk_chats_user1 FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_chats_user2 FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add foreign key constraint for chat_messages
ALTER TABLE chat_messages
ADD CONSTRAINT fk_chat_messages_chat FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chats_user1_id ON chats(user1_id);
CREATE INDEX IF NOT EXISTS idx_chats_user2_id ON chats(user2_id);
