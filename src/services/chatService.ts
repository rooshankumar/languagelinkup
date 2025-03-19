import { supabase } from '@/lib/supabaseClient';
import { Chat, Message } from '@/types/chat';

export const chatService = {
  async getChatDetails(chatId: string) {
    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .select(`
        *,
        user1:users!chats_user1_id_fkey (id, username, profile_picture, is_online, last_active),
        user2:users!chats_user2_id_fkey (id, username, profile_picture, is_online, last_active)
      `)
      .eq('id', chatId)
      .single();

    if (chatError) throw chatError;

    const currentUserId = (await supabase.auth.getUser()).data.user?.id;
    const partner = chatData.user1.id === currentUserId ? chatData.user2 : chatData.user1;

    return {
      id: chatData.id,
      partner
    };
  },

  async getMessages(chatId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async sendMessage(chatId: string, senderId: string, content: string, type = 'text', attachmentUrl?: string) {
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

    const { error: updateError } = await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);

    if (updateError) throw updateError;
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