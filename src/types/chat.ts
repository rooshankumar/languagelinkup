
export interface Chat {
  id: string;
  created_at: string;
  updated_at: string;
  user1_id: string;
  user2_id: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}
