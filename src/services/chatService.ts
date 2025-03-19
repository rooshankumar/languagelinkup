import { supabase } from '@/lib/supabaseClient';
import { MessageType } from '@/types/chat';

export const chatService = {
  async getChats(userId: string) {
    const { data, error } = await supabase
      .from('chats')
      .select(`
        id,
        created_at,
        updated_at,
        user1_id,
        user2_id,
        chat_messages (
          id,
          content,
          content_type,
          created_at,
          sender_id
        )
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async sendMessage(chatId: string, senderId: string, content: string, contentType: MessageType = 'text') {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        content,
        content_type: contentType
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  subscribeToChat: (chatId: string, callback: (payload: any) => void) => {
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_id=eq.${chatId}`
      }, callback)
      .subscribe();

    return channel;
  },

  async markMessagesAsRead(messageIds: string[]) {
    if (!messageIds.length) return;

    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .in('id', messageIds);

    if (error) throw error;
  },
  async createConversation(user1_id: string, user2_id: string) {
    const { data: existingConv, error: checkError } = await supabase
      .from('chats')
      .select('*')
      .or(`(user1_id.eq.${user1_id},user2_id.eq.${user2_id}),(user1_id.eq.${user2_id},user2_id.eq.${user1_id})`)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingConv) return existingConv;

    const { data, error } = await supabase
      .from('chats')
      .insert({
        user1_id, 
        user2_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
    uploadFile: async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(path, file);

    if (error) throw error;
    return data;
  },

  getFileUrl: async (path: string) => {
    const { data } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(path);

    return data.publicUrl;
  },

  addReaction: async (messageId: string, userId: string, emoji: string) => {
    const { data, error } = await supabase
      .from('message_reactions')
      .insert([{
        message_id: messageId,
        user_id: userId,
        emoji,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  markAsRead: async (conversationId: string, userId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);

    if (error) throw error;
  },

  updateTypingStatus: async (conversationId: string, userId: string, isTyping: boolean) => {
    await supabase
      .from('typing_status')
      .update({ is_typing: isTyping, last_typed: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);
  }
};