
-- Add foreign key constraint between chat_messages and chats
ALTER TABLE chat_messages
ADD CONSTRAINT fk_chat_messages_chat
FOREIGN KEY (chat_id) REFERENCES chats(id);

-- Add indexes for better performance
CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX idx_chats_user1_id ON chats(user1_id);
CREATE INDEX idx_chats_user2_id ON chats(user2_id);
