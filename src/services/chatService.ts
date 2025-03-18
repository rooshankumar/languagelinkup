import { supabase } from '@/lib/supabaseClient';
import { Message, MessageType } from '@/types/chat';

export const chatService = {
  async sendMessage(chatId: string, senderId: string, content: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        content,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createConversation(user1_id: string, user2_id: string) {
    const { data: existingChat, error: checkError } = await supabase
      .from('chats')
      .select('*')
      .or(`and(user1_id.eq.${user1_id},user2_id.eq.${user2_id}),and(user1_id.eq.${user2_id},user2_id.eq.${user1_id})`)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingChat) return existingChat;

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
  subscribeToTyping: (conversationId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`typing:${conversationId}`)
      .on('presence', { event: 'sync' }, callback)
      .subscribe();
  },
  async uploadFile(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(path, file);

    if (error) throw error;
    return data;
  },

  async getFileUrl(path: string) {
    const { data } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  async addReaction(messageId: string, userId: string, emoji: string) {
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

  async markAsRead(messageIds: string[]) {
    if (!messageIds.length) return;

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', messageIds);

    if (error) throw error;
  },

  async updateTypingStatus(conversationId: string, userId: string, isTyping: boolean) {
    await supabase.channel(`typing:${conversationId}`).track({
      user_id: userId,
      conversation_id: conversationId,
      is_typing: isTyping,
      last_typed: new Date().toISOString()
    });
  }
};