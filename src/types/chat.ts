
export type MessageType = 'text' | 'emoji' | 'voice' | 'file' | 'gif';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: MessageType;
  file_url?: string;
  file_type?: string;
  reactions?: MessageReaction[];
  is_read: boolean;
  created_at: string;
}

export interface MessageReaction {
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface TypingStatus {
  user_id: string;
  conversation_id: string;
  is_typing: boolean;
  last_typed: string;
}
