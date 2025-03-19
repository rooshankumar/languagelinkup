import { supabase } from '../lib/supabaseClient';

export const chatService = {
  getChatDetails: async (chatId: string) => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    if (error) throw error;
    return data;
  },

  getMessages: async (chatId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  subscribeToMessages: (chatId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`chat-${chatId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, callback)
      .subscribe();
  },
  subscribeToTyping: (conversationId: string, callback: (payload: any) => void) => {
    return supabase
      .from(`typing_status`)
      .on('UPDATE', callback)
      .eq('conversation_id', conversationId)
      .subscribe();
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

  async sendMessage(conversationId: string, senderId: string, content: string, type: MessageType = 'text', fileUrl?: string, fileType?: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        type,
        file_url: fileUrl,
        file_type: fileType,
        is_read: false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
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

  async markAsRead(conversationId: string, userId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);

    if (error) throw error;
  },

  async updateTypingStatus(conversationId: string, userId: string, isTyping: boolean) {
    await supabase
      .from('typing_status')
      .update({ is_typing: isTyping, last_typed: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);
  }
};