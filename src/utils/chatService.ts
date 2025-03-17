import { supabase } from '@/lib/supabaseClient';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const chatService = {
  async getConversation(conversationId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) throw error;
    return data;
  },

  async createConversation(user1Id: string, user2Id: string) {
    try {
      // Check for existing conversation with direct equals comparison
      const { data: existingConv, error: checkError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user1_id', user1Id)
        .eq('user2_id', user2Id)
        .maybeSingle();

      if (checkError) throw checkError;

      // If no conversation found, check the reverse order
      if (!existingConv) {
        const { data: reverseConv, error: reverseError } = await supabase
          .from('conversations')
          .select('*')
          .eq('user1_id', user2Id)
          .eq('user2_id', user1Id)
          .maybeSingle();

        if (reverseError) throw reverseError;
        if (reverseConv) return { data: reverseConv, error: null };
      } else {
        return { data: existingConv, error: null };
      }

      // If no existing conversation found, create a new one
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          user1_id: user1Id,
          user2_id: user2Id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Detailed create error:', {
          message: createError.message,
          details: createError.details,
          hint: createError.hint,
          code: createError.code
        });
        throw createError;
      }

      return { data: newConv, error: null };
    } catch (error: any) {
      console.error('Error in createConversation:', error);
      return { data: null, error };
    }
  },

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content,
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },
  async markAsRead(messageIds: string[]) {
    return await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', messageIds);
  },

  subscribeToConversation(conversationId: string, callback: (message: Message) => void) {
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
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  }
};