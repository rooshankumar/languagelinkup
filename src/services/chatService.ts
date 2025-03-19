
import { supabase } from '../lib/supabaseClient';

export const chatService = {
  async getChats(userId: string) {
    const { data, error } = await supabase
      .from('chats')
      .select(`
        id, user1_id, user2_id, updated_at,
        chat_messages (id, sender_id, content, created_at, content_type, attachment_url),
        user1:users!chats_user1_id_fkey (id, username, profile_picture, is_online, last_active),
        user2:users!chats_user2_id_fkey (id, username, profile_picture, is_online, last_active)
      `)
      .or(`user1_id.eq.${userId}, user2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async sendMessage(chatId: string, senderId: string, content: string, contentType = 'text', attachmentUrl = null) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        content,
        content_type: contentType,
        attachment_url: attachmentUrl
      })
      .select('*')
      .single();

    if (error) throw error;
    
    // Update chat's updated_at timestamp
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);

    return data;
  },

  listenToChat(chatId: string, callback: (payload: any) => void) {
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

  async markMessageAsSeen(messageId: string, userId: string) {
    const { error } = await supabase
      .from('message_receipts')
      .upsert({
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

  listenToUserStatus(callback: (payload: any) => void) {
    return supabase
      .channel('user_status')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: 'is_online=eq.true'
      }, callback)
      .subscribe();
  }
};
