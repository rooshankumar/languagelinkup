
import { supabase } from '@/lib/supabaseClient';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message: string;
  last_message_time: string;
}

export const chatService = {
  async sendMessage(conversationId: string, receiverId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    return await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      receiver_id: receiverId,
      content,
      is_read: false
    }).select().single();
  },

  subscribeToMessages(conversationId: string, onMessage: (message: ChatMessage) => void) {
    return supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => onMessage(payload.new as ChatMessage)
      )
      .subscribe();
  },

  async getConversationMessages(conversationId: string) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    return data;
  },

  async createConversation(otherUserId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    return await supabase
      .from('conversations')
      .insert({
        user1_id: user.id,
        user2_id: otherUserId
      })
      .select()
      .single();
  }
};
