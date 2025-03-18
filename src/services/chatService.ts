
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
  last_message?: string;
  last_message_time?: string;
}

export const chatService = {
  async createConversation(user1Id: string, user2Id: string): Promise<Conversation> {
    try {
      // Check if conversation exists
      const { data: existingConv, error: checkError } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingConv) {
        return existingConv;
      }

      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert([
          {
            user1_id: user1Id,
            user2_id: user2Id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return newConversation;
    } catch (error: any) {
      console.error('Error in createConversation:', error);
      throw new Error(error.message || 'Failed to create conversation');
    }
  },

  async sendMessage(conversationId: string, receiverId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
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
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async markMessagesAsRead(conversationId: string, userId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  }
};
