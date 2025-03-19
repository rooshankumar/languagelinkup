import { supabase } from '@/lib/supabaseClient';
import { Chat, ChatMessage } from '@/types/chat';

export const chatService = {
  async getChats(userId: string) {
    const { data, error } = await supabase
      .from('chats')
      .select(`
        id,
        user1_id,
        user2_id,
        updated_at,
        chat_messages!fk_chat_messages_chat (
          id, sender_id, content, content_type, created_at, attachment_url
        ),
        user1:users!fk_chats_user1 (
          id, username, profile_picture, is_online, last_active
        ),
        user2:users!fk_chats_user2 (
          id, username, profile_picture, is_online, last_active
        )
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getChatMessages(chatId: string, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        id,
        chat_id,
        sender_id,
        content,
        content_type,
        created_at,
        attachment_url,
        sender:users!chat_messages_sender_id_fkey (
          id,
          username,
          profile_picture
        )
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  },

  async sendMessage(chatId: string, senderId: string, content: string, contentType: string = 'text', attachmentUrl?: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        content,
        content_type: contentType,
        attachment_url: attachmentUrl
      })
      .select()
      .single();

    if (error) throw error;
    return data;
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