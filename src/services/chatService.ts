import { supabase } from '@/lib/supabaseClient';
import type { Chat, ChatMessage } from '@/types/chat';
import { Message, ContentType } from '@/types/supabase';
import { toast } from '@/hooks/use-toast';

export interface SendMessageOptions {
  content: string;
  type: 'text' | 'voice' | 'attachment';
  attachment_url?: string;
}

const chatService = {
  async createChat(user1Id: string, user2Id: string) {
    try {
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert([
          { user1_id: user1Id, user2_id: user2Id }
        ])
        .select('id')
        .single();

      if (createError) {
        throw createError;
      }

      return newChat;
    } catch (error) {
      console.error('Create chat error:', error);
      return null;
    }
  },

  async findExistingChat(user1Id: string, user2Id: string) {
    try {
      const { data: existingChat, error } = await supabase
        .from('chats')
        .select('id')
        .or(`user1_id.eq.${user1Id},user2_id.eq.${user1Id}`)
        .or(`user1_id.eq.${user2Id},user2_id.eq.${user2Id}`)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return existingChat;
    } catch (error) {
      console.error('Find chat error:', error);
      return null;
    }
  },

  async findOrCreateChat(user1Id: string, user2Id: string): Promise<{id: string} | null> {
    try {
      if (!user1Id || !user2Id) {
        throw new Error('Both users are required');
      }

      const existingChat = await this.findExistingChat(user1Id, user2Id);
      if (existingChat) {
        return existingChat;
      }

      const newChat = await this.createChat(user1Id, user2Id);
      if (!newChat) {
        throw new Error('Failed to create chat');
      }

      return newChat;
    } catch (error) {
      console.error('Chat service error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create chat",
        variant: "destructive",
      });
      return null;
    }
  },
  async sendMessage(chatId: string, content: string, type: 'text' | 'voice' | 'attachment' = 'text', attachmentUrl?: string) {
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

  async getChatDetails(chatId: string) {
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
  async getChat(chatId: string) {
    const { data, error } = await supabase
      .from('chats')
      .select(`
        id,
        created_at,
        user1_id,
        user2_id,
        messages:chat_messages(
          id,
          content,
          created_at,
          sender_id
        )
      `)
      .eq('id', chatId)
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load chat messages.',
        variant: 'destructive',
      });
      throw error;
    }

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
  },

  async uploadAttachment(file: File) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);

    if (error) throw error;
    return data;
  }
};

export { chatService };