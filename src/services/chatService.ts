
import { supabase } from '@/integrations/supabase/client';
import type { Chat, ChatMessage } from '@/types/chat';

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  type?: 'text' | 'voice' | 'attachment';
  attachment_url?: string;
}

export const chatService = {
  sendMessage: async (chatId: string, content: string, type: 'text' | 'voice' | 'attachment' = 'text', attachmentUrl?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content: content,
          content_type: type,
          attachment_url: attachmentUrl,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  getChatDetails: async (chatId: string) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        throw new Error('User not authenticated');
      }

      if (!chatId) {
        throw new Error('Chat ID is missing');
      }

      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          messages:chat_messages(*),
          user1:users!chats_user1_id_fkey (id, username, profile_picture, is_online, last_active),
          user2:users!chats_user2_id_fkey (id, username, profile_picture, is_online, last_active)
        `)
        .eq('id', chatId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Chat not found');

      const partner = data.user1_id === session.user.id ? data.user2 : data.user1;
      if (!partner) throw new Error('Chat partner not found');

      return {
        id: data.id,
        partner,
        messages: data.messages || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error in getChatDetails:', error);
      throw error;
    }
  },

  findOrCreateChat: async (partnerId: string) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        throw new Error('User not authenticated');
      }

      const userId = session.user.id;

      // Check if chat exists
      const { data: existingChat, error: checkError } = await supabase
        .from('chats')
        .select('id')
        .or(`and(user1_id.eq.${userId},user2_id.eq.${partnerId}),and(user1_id.eq.${partnerId},user2_id.eq.${userId})`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error('Failed to check existing chat');
      }

      if (existingChat) {
        console.log('Found existing chat:', existingChat.id);
        return existingChat;
      }

      // Create new chat if none exists
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert({
          user1_id: userId,
          user2_id: partnerId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (createError) {
        throw new Error('Failed to create new chat');
      }

      console.log('Created new chat:', newChat.id);
      return newChat;
    } catch (error) {
      console.error('Chat error:', error);
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
  },

  async markChatAsRead(chatId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_read_status')
        .upsert([
          { chat_id: chatId, user_id: userId, last_read_at: new Date().toISOString() }
        ]);

      if (error) {
        console.error('Error marking chat as read:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in markChatAsRead:', error);
      return false;
    }
  }
};
import { supabase } from '@/lib/supabaseClient'
import { Message, ContentType } from '@/types/supabase'

export const chatService = {
  async sendMessage(chatId: string, content: string, contentType: ContentType = 'text') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: user.id,
        content,
        content_type: contentType
      })
      .select('*, profile:profiles(*)')
      .single()

    if (error) throw error
    return data
  },

  async uploadAttachment(file: File) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { data, error } = await supabase.storage
      .from('attachments')
      .upload(filePath, file)

    if (error) throw error
    return data
  },

  subscribeToChat(chatId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        callback
      )
      .subscribe()
  }
}
