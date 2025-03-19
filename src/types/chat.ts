
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
  content_type: string;
  attachment_url?: string;
}

export interface ChatPreview {
  id: string;
  partner: {
    id: string;
    username: string;
    profilePicture: string | null;
    isOnline: boolean;
  };
  lastMessage: {
    content: string | null;
    timestamp: string;
  } | null;
  updatedAt: string;
}
