
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
        chat_messages (
          id, sender_id, content, content_type, created_at, attachment_url
        ),
        user1:users!chats_user1_id_fkey (
          id, username, profile_picture, is_online, last_active
        ),
        user2:users!chats_user2_id_fkey (
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
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  },

  async sendMessage(chatId: string, senderId: string, content: string, contentType = 'text', attachmentUrl?: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        content,
        content_type: contentType,
        attachment_url: attachmentUrl,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Update chat's updated_at timestamp
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);

    return data;
  },

  async markMessageAsSeen(messageId: string, userId: string) {
    const { error } = await supabase
      .from('message_receipts')
      .insert({
        message_id: messageId,
        user_id: userId,
        seen_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  async setUserOnline(userId: string) {
    const { error } = await supabase
      .from('users')
      .update({
        is_online: true,
        last_active: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  },

  async setUserOffline(userId: string) {
    const { error } = await supabase
      .from('users')
      .update({
        is_online: false,
        last_active: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
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
  },

  subscribeToUserStatus(callback: (payload: any) => void) {
    return supabase
      .channel('users_presence')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: 'is_online=eq.true'
      }, callback)
      .subscribe();
  },

  async createChat(user1Id: string, user2Id: string) {
    const { data, error } = await supabase
      .from('chats')
      .insert({
        user1_id: user1Id,
        user2_id: user2Id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
