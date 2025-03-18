import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        const userId = session.user.id;
        setCurrentUserId(userId);

        // Fetch all conversations, partners, and messages in one query
        const { data: conversations, error: conversationsError } = await supabase
          .from('conversations')
          .select(
            `
              id,
              user1_id,
              user2_id,
              updated_at,
              messages(
                id, sender_id, content, created_at, is_read
              ),
              partner:users!conversations_user1_id_fkey(
                id, username, profile_picture, native_language, is_online
              )
            `
          )
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
          .order('updated_at', { ascending: false });

        if (conversationsError) {
          throw conversationsError;
        }

        const formattedChats = conversations.map((conv) => {
          const partner = conv.partner;
          if (!partner) return null;

          // Get latest message
          const latestMessage =
            conv.messages.length > 0
              ? conv.messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
              : null;

          let lastMessage = {
            text: 'Start a conversation',
            timestamp: new Date(),
            isRead: true,
            senderId: '',
          };

          let unreadCount = 0;

          if (latestMessage) {
            lastMessage = {
              text: latestMessage.content || '',
              timestamp: new Date(latestMessage.created_at),
              isRead: latestMessage.is_read,
              senderId: latestMessage.sender_id,
            };

            unreadCount = conv.messages.filter(
              (m) => m.sender_id !== userId && !m.is_read
            ).length;
          }

          return {
            id: conv.id,
            partner: {
              id: partner.id,
              name: partner.username,
              avatar: partner.profile_picture,
              language: partner.native_language,
              online: partner.is_online,
            },
            lastMessage,
            unreadCount,
          };
        });

        setChats(formattedChats.filter((chat) => chat !== null) as ChatPreview[]);
      } catch (error: any) {
        console.error('Error fetching chats:', error);
        toast({
          title: 'Failed to load chats',
          description: error.message || 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndChats();

    // Subscribe to real-time updates for new messages
    const subscription = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          fetchUserAndChats(); // Refresh chat list when a new message arrives
        }
      )
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

  const filteredChats = chats.filter((chat) =>
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
                <img
                  src={chat.partner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.partner.name)}`}
                  alt={chat.partner.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium">{chat.partner.name}</h3>
                    <span className="text-xs text-muted-foreground">{formatTime(chat.lastMessage.timestamp)}</span>
                  </div>
                  <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                    {chat.lastMessage.senderId === currentUserId ? 'You: ' : ''}
                    {chat.lastMessage.text}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center p-4 text-muted-foreground">No conversations found.</p>
        )}
      </div>
    </div>
  );
};

export default ChatList;
