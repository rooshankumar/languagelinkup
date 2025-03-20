import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { ChatPreview } from '@/types/chat';

interface ChatPreview {
  id: string;
  partner: {
    id: string;
    username: string;
    profilePicture: string | null;
    isOnline: boolean;
  };
  lastMessage: {
    content: string | null;
    timestamp: string;
  } | null;
  updatedAt: string;
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

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        const userId = session.user.id;
        setCurrentUserId(userId);

        // Fetch chats and their latest messages
        const { data: chats, error: chatsError } = await supabase
          .from('chats')
          .select(`
            id,
            user1_id,
            user2_id,
            updated_at,
            chat_messages (
              id, sender_id, content, created_at
            ),
            user1:users!chats_user1_id_fkey (
              id, username, profile_picture, is_online
            ),
            user2:users!chats_user2_id_fkey (
              id, username, profile_picture, is_online
            )
          `)
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
          .order('updated_at', { ascending: false });

        if (chatsError) throw chatsError;

        if (chats) {
          const formattedChats = chats.map((chat) => {
            const partner = chat.user1_id === userId ? chat.user2 : chat.user1;
            const latestMessage = chat.chat_messages?.[0];

            return {
              id: chat.id,
              partner: {
                id: partner.id,
                username: partner.username,
                profilePicture: partner.profile_picture 
                  ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${partner.profile_picture}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.username || "User")}&background=random`,
                isOnline: partner.is_online,
              },
              lastMessage: latestMessage
                ? {
                    content: latestMessage.content,
                    timestamp: latestMessage.created_at,
                  }
                : null,
              updatedAt: chat.updated_at,
            };
          });

          setChats(formattedChats);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndChats();
  }, [navigate]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
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
    chat.partner.username.toLowerCase().includes(searchTerm.toLowerCase())
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
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
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

      <div className="divide-y">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className="p-4 hover:bg-muted/50 cursor-pointer"
              onClick={() => navigate(`/chat/${chat.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={chat.partner.profilePicture || '/placeholder.svg'}
                    alt={chat.partner.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {chat.partner.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{chat.partner.username}</h3>
                  {chat.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage.content}
                    </p>
                  )}
                </div>
                {chat.lastMessage && (
                  <div className="text-xs text-muted-foreground">
                    {formatTime(chat.lastMessage.timestamp)}
                  </div>
                )}
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