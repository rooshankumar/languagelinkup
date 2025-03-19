
import { supabase } from '@/lib/supabaseClient';
import type { Chat, ChatMessage } from '@/types/chat';

export const chatService = {
  async getChatDetails(chatId: string): Promise<Chat> {
    try {
      const { data: chatData, error } = await supabase
        .from('chats')
        .select(`
          id,
          created_at,
          updated_at,
          user1_id,
          user2_id,
          users!chats_user1_id_fkey (
            id, 
            username,
            profile_picture,
            is_online,
            last_active
          ),
          users!chats_user2_id_fkey (
            id,
            username,
            profile_picture,
            is_online,
            last_active
          )
        `)
        .eq('id', chatId)
        .single();

      if (error) throw error;
      if (!chatData) throw new Error('Chat not found');

      const currentUserId = (await supabase.auth.getUser()).data.user?.id;
      const partner = chatData.user1_id === currentUserId 
        ? chatData.users.find(u => u.id === chatData.user2_id)
        : chatData.users.find(u => u.id === chatData.user1_id);

      return {
        id: chatData.id,
        createdAt: chatData.created_at,
        updatedAt: chatData.updated_at,
        partner: partner || null
      };
    } catch (error) {
      console.error('Error getting chat details:', error);
      throw error;
    }
  },

  async getMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          chat_id,
          type,
          attachment_url
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },

  async sendMessage(
    chatId: string, 
    senderId: string, 
    content: string, 
    type: 'text' | 'voice' | 'attachment' = 'text',
    attachmentUrl?: string
  ): Promise<void> {
    try {
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: senderId,
          content,
          type,
          attachment_url: attachmentUrl
        });

      if (messageError) throw messageError;

      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  subscribeToMessages(chatId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_id=eq.${chatId}`
      }, callback)
      .subscribe();
  }
};
