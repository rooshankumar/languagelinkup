
export interface Chat {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'voice' | 'attachment';
  attachment_url?: string;
  created_at: string;
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
