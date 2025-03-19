
import { supabase } from '@/lib/supabaseClient';

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const chatService = {
  sendMessage: async (chatId: string, message: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content: message,
          is_read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw new Error('Failed to send message');
      }
      return { data, error: null };
    } catch (error) {
      console.error('Error sending message:', error);
      return { data: null, error };
    }
  },

  createOrGetChat: async (otherUserId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // Verify partner exists
      const { data: partnerData, error: partnerError } = await supabase
        .from('users')
        .select('id')
        .eq('id', otherUserId)
        .single();

      if (partnerError || !partnerData) {
        console.error('Partner not found:', otherUserId);
        throw new Error('Chat partner not found');
      }

      // Check for existing chat
      const { data: existingChat, error: checkError } = await supabase
        .from('chats')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error('Failed to check existing chat');
      }

      if (existingChat) {
        return existingChat;
      }

      // Create new chat
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert({
          user1_id: user.id,
          user2_id: otherUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        throw new Error('Failed to create new chat');
      }

      return newChat;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  },

  getChatDetails: async (chatId: string) => {
    try {
      // Validate auth state
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        console.error('Authentication error:', sessionError || 'No session found');
        throw new Error('User not authenticated');
      }

      // Validate chat ID
      if (!chatId) {
        console.error('Chat ID is missing');
        throw new Error('Chat ID is required');
      }

      // Fetch chat with participant details
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

      if (error) {
        console.error('Error fetching chat:', error);
        throw new Error('Failed to fetch chat details');
      }

      if (!data) {
        console.error('Chat not found:', chatId);
        throw new Error('Chat not found');
      }

      // Determine chat partner
      const partner = data.user1_id === session.user.id ? data.user2 : data.user1;
      if (!partner) {
        console.error('Chat partner not found');
        throw new Error('Chat partner not found');
      }

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
  }
};
