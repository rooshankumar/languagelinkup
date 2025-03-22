
-- Add foreign key constraint between chat_messages and chats
ALTER TABLE chat_messages
ADD CONSTRAINT fk_chat_messages_chat
FOREIGN KEY (chat_id) REFERENCES chats(id)
ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
