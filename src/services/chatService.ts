import { supabase } from '@/lib/supabaseClient';

export const chatService = {
  async createConversation(user1_id: string, user2_id: string) {
    // Check for existing conversation first
    const { data: existingConv, error: checkError } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(user1_id.eq.${user1_id},user2_id.eq.${user2_id}),and(user1_id.eq.${user2_id},user2_id.eq.${user1_id})`)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    if (existingConv) return existingConv;

    // Create new conversation if none exists
    const { data, error } = await supabase
      .from('conversations')
      .insert([{ 
        user1_id, 
        user2_id, 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getConversation(user1_id: string, user2_id: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(user1_id.eq.${user1_id},user2_id.eq.${user2_id}),and(user1_id.eq.${user2_id},user2_id.eq.${user1_id})`)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getUserConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, user1:user1_id(*), user2:user2_id(*)')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
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

  subscribeToConversation(conversationId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, callback)
      .subscribe();
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