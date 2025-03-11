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
            user2_id,
            messages:messages(
              id,
              sender_id,
              content,
              created_at,
              is_read
            )
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

          // Get partner details
          const { data: partnerData, error: partnerError } = await supabase
            .from('users')
            .select('id, username, profile_picture, native_language, is_online')
            .eq('id', partnerId)
            .single();

          if (partnerError) {
            console.error('Error fetching partner:', partnerError);
            return null;
          }

          // Get latest message
          let lastMessage = {
            text: 'Start a conversation',
            timestamp: new Date(),
            isRead: true,
            senderId: ''
          };

          let unreadCount = 0;

          if (conv.messages && conv.messages.length > 0) {
            // Sort messages by date (newest first)
            const sortedMessages = [...conv.messages].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            const latestMessage = sortedMessages[0];
            lastMessage = {
              text: latestMessage.content || '',
              timestamp: new Date(latestMessage.created_at),
              isRead: latestMessage.is_read,
              senderId: latestMessage.sender_id
            };

            // Count unread messages
            unreadCount = sortedMessages.filter(m => 
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