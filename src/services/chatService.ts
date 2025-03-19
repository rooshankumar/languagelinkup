
import { supabase } from '@/lib/supabaseClient';
import type { Chat, ChatMessage } from '@/types/chat';

export const chatService = {
  async getChatDetails(chatId: string): Promise<Chat | null> {
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

      if (error) {
        console.error('Error fetching chat:', error);
        return null;
      }

      if (!chatData) return null;

      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

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
      console.error('Error in getChatDetails:', error);
      return null;
    }
  },

  async getMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getMessages:', error);
      return [];
    }
  },

  async createChat(userId: string, partnerId: string): Promise<string | null> {
    try {
      const { data: existingChat, error: checkError } = await supabase
        .from('chats')
        .select('id')
        .or(`and(user1_id.eq.${userId},user2_id.eq.${partnerId}),and(user1_id.eq.${partnerId},user2_id.eq.${userId})`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing chat:', checkError);
        return null;
      }

      if (existingChat) return existingChat.id;

      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert([
          { user1_id: userId, user2_id: partnerId }
        ])
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating chat:', createError);
        return null;
      }

      return newChat?.id || null;
    } catch (error) {
      console.error('Error in createChat:', error);
      return null;
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
