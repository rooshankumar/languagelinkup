
export type MessageType = 'text' | 'emoji' | 'file' | 'gif';

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  content_type: MessageType;
  created_at: string;
  attachment_url?: string;
}

export interface Chat {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
  chat_messages?: ChatMessage[];
}
