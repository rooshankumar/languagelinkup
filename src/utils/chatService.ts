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
      // First check if conversation exists using proper parameter substitution
      const { data: existingConv, error: checkError } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing conversation:', checkError);
        throw checkError;
      }

      if (existingConv) {
        console.log('Found existing conversation:', existingConv);
        return { data: existingConv, error: null };
      }

      console.log('Creating new conversation between', user1Id, 'and', user2Id);
      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          user1_id: user1Id,
          user2_id: user2Id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Conversation creation error:', error);
        if (error.code === 'PGRST204') {
          console.error('Policy violation - check RLS policies');
        }
        throw error;
      }

      console.log('Successfully created conversation:', data);

      return { data, error: null };
    } catch (error: any) {
      console.error('Error in createConversation:', error);
      return { data: null, error };
    }
  },

  async sendMessage(conversationId: string, content: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

    return await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
      })
      .select()
      .single();
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