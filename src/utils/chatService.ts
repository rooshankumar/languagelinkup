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
      // Check for existing chat
      const { data: existingChat, error: checkError } = await supabase
        .from('chats')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // Not found error
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
    } catch (error: any) {
      console.error('Chat error:', error);
      throw error;
    }
  },

  markAsRead: async (messageIds: string[]) => {
    if (!messageIds.length) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .in('id', messageIds);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw new Error('Failed to mark messages as read');
    }
  }
};
