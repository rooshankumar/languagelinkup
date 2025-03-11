import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MessageCircle } from 'lucide-react';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

interface ChatPreview {
  id: string;
  partner: {
    id: string;
    name: string;
    avatar: string | null;
    language: string;
    online: boolean;
  };
  lastMessage: {
    text: string;
    timestamp: Date;
    isRead: boolean;
    senderId: string;
  };
  unreadCount: number;
}

const ChatList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndChats = async () => {
      try {
        setIsLoading(true);

        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        const userId = session.user.id;
        setCurrentUserId(userId);

        // Fetch conversations for this user
        const { data: conversations, error: conversationsError } = await supabase
          .from('conversations')
          .select(`
            id,
            user1_id,
            user2_id
          `)
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
          .order('updated_at', { ascending: false });

        if (conversationsError) {
          throw conversationsError;
        }

        // Process each conversation to get the partner user info
        const chatPromises = conversations.map(async (conv) => {
          // Determine the partner's ID
          const partnerId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;

          // Get partner user data
          const { data: partnerData, error: partnerError } = await supabase
            .from('users')
            .select('id, username, profile_picture, native_language, is_online')
            .eq('id', partnerId)
            .maybeSingle();

          if (partnerError || !partnerData) {
            console.error('Error fetching partner data for conversation', conv.id, ':', partnerError);
            return null;
          }

          // Get messages for this conversation separately
          const { data: messageData, error: messageError } = await supabase
            .from('messages')
            .select('id, sender_id, content, created_at, is_read')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(10);

          if (messageError) {
            console.error('Error fetching messages:', messageError);
          }

          // Get latest message
          let lastMessage = {
            text: 'Start a conversation',
            timestamp: new Date(),
            isRead: true,
            senderId: ''
          };

          let unreadCount = 0;

          if (messageData && messageData.length > 0) {
            const latestMessage = messageData[0];
            lastMessage = {
              text: latestMessage.content || '',
              timestamp: new Date(latestMessage.created_at),
              isRead: latestMessage.is_read,
              senderId: latestMessage.sender_id
            };

            // Count unread messages
            unreadCount = messageData.filter(m => 
              m.sender_id !== userId && !m.is_read
            ).length;
          }

          return {
            id: conv.id,
            partner: {
              id: partnerData.id,
              name: partnerData.username,
              avatar: partnerData.profile_picture,
              language: partnerData.native_language,
              online: partnerData.is_online
            },
            lastMessage,
            unreadCount
          };
        });

        // Resolve all promises
        const chatResults = await Promise.all(chatPromises);
        const validChats = chatResults.filter(chat => chat !== null) as ChatPreview[];
        setChats(validChats);
      } catch (error: any) {
        console.error('Error fetching chats:', error);
        toast({
          title: 'Failed to load chats',
          description: error.message || 'Please try again later',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndChats();

    // Subscribe to realtime updates for new messages
    const subscription = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        // Refresh the chat list when a new message is received
        fetchUserAndChats();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date >= today) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date >= yesterday) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.partner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto h-full flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto h-full">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Button 
            onClick={() => navigate('/community')}
            icon={<Plus className="h-4 w-4" />}
            size="sm"
          >
            New Chat
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-10rem)]">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className="p-4 border-b hover:bg-muted/30 cursor-pointer transition-colors"
            >
              <div className="flex items-start">
                <div className="relative">
                  <img 
                    src={chat.partner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.partner.name)}&background=random`}
                    alt={chat.partner.name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.partner.name)}&background=random`;
                    }}
                  />
                  {chat.partner.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>

                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium">{chat.partner.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(chat.lastMessage.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-sm truncate ${!chat.lastMessage.isRead && chat.lastMessage.senderId !== currentUserId ? 'font-medium' : 'text-muted-foreground'}`}>
                      {chat.lastMessage.senderId === currentUserId ? 'You: ' : ''}
                      {chat.lastMessage.text}
                    </p>

                    {chat.unreadCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    Speaking {chat.partner.language}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 p-4">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No messages found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm 
                ? `No chats matching "${searchTerm}"`
                : "You haven't started any conversations yet"}
            </p>
            <Button 
              onClick={() => navigate('/community')}
              icon={<Plus className="h-4 w-4" />}
            >
              Find Language Partners
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

const ChatList = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUser(data.user);
        return data.user.id;
      }
      return null;
    };

    const fetchConversations = async (userId) => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Get all conversations where the current user is involved
        const { data: conversationsData, error } = await supabase
          .from('conversations')
          .select(`
            *,
            user1:user1_id (id, username, profile_picture, is_online),
            user2:user2_id (id, username, profile_picture, is_online),
            messages!messages_conversation_id_fkey (
              id, 
              content, 
              created_at, 
              sender_id, 
              is_read
            )
          `)
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        // Process conversations to get the other user and last message
        const processedConversations = await Promise.all(conversationsData.map(conv => {
          // Determine which user is the other person in the conversation
          const otherUser = conv.user1_id === userId ? conv.user2 : conv.user1;
          
          // Sort messages by created_at to get the latest
          const sortedMessages = conv.messages.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          
          // Get the most recent message
          const lastMessage = sortedMessages.length > 0 ? sortedMessages[0] : null;
          
          // Count unread messages
          const unreadCount = sortedMessages.filter(
            m => m.sender_id !== userId && !m.is_read
          ).length;
          
          return {
            ...conv,
            otherUser,
            lastMessage,
            unreadCount
          };
        }));

        setConversations(processedConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your conversations',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    const initialize = async () => {
      const userId = await fetchCurrentUser();
      if (userId) {
        await fetchConversations(userId);
        
        // Set up real-time subscription for messages
        const messagesSubscription = supabase
          .channel('messages-changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'messages'
            }, 
            () => {
              // Refresh conversations when a message changes
              fetchConversations(userId);
            }
          )
          .subscribe();
          
        return () => {
          supabase.removeChannel(messagesSubscription);
        };
      } else {
        navigate('/auth');
      }
    };

    initialize();
  }, [navigate]);

  const handleConversationClick = (conversationId) => {
    navigate(`/chat/${conversationId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20">Loading conversations...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      {conversations.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No conversations yet.</p>
          <p>Get started by visiting the <span 
            className="text-primary cursor-pointer" 
            onClick={() => navigate('/community')}
          >
            Community
          </span> page and starting a chat with another user.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                conversation.unreadCount > 0 ? 'bg-muted/30' : ''
              }`}
              onClick={() => handleConversationClick(conversation.id)}
            >
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={conversation.otherUser?.profile_picture} />
                  <AvatarFallback>{conversation.otherUser?.username?.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium truncate">{conversation.otherUser?.username}</h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate max-w-[240px]">
                      {conversation.lastMessage 
                        ? `${conversation.lastMessage.sender_id === currentUser?.id ? 'You: ' : ''}${conversation.lastMessage.content}` 
                        : 'No messages yet'}
                    </p>
                    
                    {conversation.unreadCount > 0 && (
                      <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;
