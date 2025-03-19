
export interface ChatUser {
  id: string;
  username: string;
  profile_picture?: string;
  is_online: boolean;
  last_active: string;
}

export interface Chat {
  id: string;
  createdAt: string;
  updatedAt: string;
  partner: ChatUser | null;
}

export interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  chat_id: string;
  type: 'text' | 'voice' | 'attachment';
  attachment_url?: string;
}
