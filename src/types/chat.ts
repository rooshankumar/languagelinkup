
export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  content_type: 'text' | 'image' | 'file' | 'emoji';
  created_at: string;
  attachment_url?: string;
}

export interface ChatUser {
  id: string;
  username: string;
  profile_picture: string;
  is_online: boolean;
  last_active: string;
}

export interface Chat {
  id: string;
  user1_id: string;
  user2_id: string;
  updated_at: string;
  chat_messages: Message[];
  user1: ChatUser;
  user2: ChatUser;
}

export interface MessageReceipt {
  id: string;
  message_id: string;
  user_id: string;
  seen_at: string;
}
