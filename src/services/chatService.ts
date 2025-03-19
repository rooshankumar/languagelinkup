import { supabase } from '@/lib/supabaseClient';
import type { Chat, ChatMessage } from '@/types/chat';

export const chatService = {
  /** ✅ Fetch chat details (returns existing chat or creates a new one) */
  async getChatDetails(userId: string | null, partnerId: string | null): Promise<Chat | null> {
    try {
      if (!userId || !partnerId) {
        console.error("❌ Invalid user ID or partner ID.");
        return null;
      }

      // 🔍 Check if chat exists between the users
      const { data: chatData, error: fetchError } = await supabase
        .from('chats')
        .select(`
          id,
          created_at,
          updated_at,
          user1_id,
          user2_id,
          user1:users!chats_user1_id_fkey (id, username, profile_picture, is_online, last_active),
          user2:users!chats_user2_id_fkey (id, username, profile_picture, is_online, last_active),
          chat_messages!chat_messages_chat_id_fkey (id, sender_id, content, created_at)
        `)
        .or(`(user1_id.eq.${userId}.and.user2_id.eq.${partnerId}), (user1_id.eq.${partnerId}.and.user2_id.eq.${userId})`)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching chat:', fetchError);
        return null;
      }

      if (chatData) {
        return {
          id: chatData.id,
          createdAt: chatData.created_at,
          updatedAt: chatData.updated_at,
          partner: chatData.user1_id === userId ? chatData.user2 : chatData.user1,
          messages: chatData.chat_messages || [],
        };
      }

      // 🆕 No chat found → Create a new one
      console.log("ℹ No chat found, creating a new one...");
      const newChatId = await chatService.createChat(userId, partnerId);
      if (!newChatId) return null;

      return {
        id: newChatId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        partner: null,
        messages: [],
      };
    } catch (error) {
      console.error('❌ Error in getChatDetails:', error);
      return null;
    }
  },

  /** ✅ Create a new chat if none exists */
  async createChat(userId: string, partnerId: string): Promise<string | null> {
    try {
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert([
          { 
            user1_id: userId, 
            user2_id: partnerId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select('id')
        .single();

      if (error) {
        console.error('❌ Error creating chat:', error);
        return null;
      }

      return newChat?.id || null;
    } catch (error) {
      console.error('❌ Error in createChat:', error);
      return null;
    }
  },

  /** ✅ Send a message in a chat */
  async sendMessage(chatId: string, senderId: string, content: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: senderId,
          content: content,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error sending message:', error);
        return false;
      }

      // ✅ Update chat timestamp
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

      return true;
    } catch (error) {
      console.error('❌ Error in sendMessage:', error);
      return false;
    }
  },

  /** ✅ Fetch all messages in a chat */
  async getMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getMessages:', error);
      return [];
    }
  },

  /** ✅ Live message subscription */
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

  /** ✅ Mark chat as read (updates last read timestamp for a user) */
  async markChatAsRead(chatId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_read_status')
        .upsert([
          { chat_id: chatId, user_id: userId, last_read_at: new Date().toISOString() }
        ]);

      if (error) {
        console.error('❌ Error marking chat as read:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('❌ Error in markChatAsRead:', error);
      return false;
    }
  }
};
