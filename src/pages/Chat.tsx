import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, ArrowLeft, Paperclip, Smile, MoreVertical, Phone, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chatService, type ChatMessage } from '@/services/chatService';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
}

interface Partner {
  id: string;
  name: string;
  avatar: string | null;
  language: string;
  online: boolean;
  lastActive: Date;
}

const Chat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);


  useEffect(() => {
    const fetchChatData = async () => {
      try {
        if (!chatId) {
          navigate('/chats');
          return;
        }

        setIsLoading(true);

        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        const userId = session.user.id;
        setCurrentUserId(userId);

        // Get conversation
        let conversation;
        let convError;

        // First, check if chatId is a valid UUID (conversation ID)
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isUUID = uuidPattern.test(chatId);

        if (isUUID) {
          // Try to fetch conversation by ID
          const { data, error } = await supabase
            .from('conversations')
            .select('id, user1_id, user2_id')
            .eq('id', chatId)
            .single();

          conversation = data;
          convError = error;
        }

        if (!isUUID || convError) {
          console.log('Looking up as user ID instead of conversation ID');

          // Check if this is a user ID rather than a conversation ID
          const { data: userCheck } = await supabase
            .from('users')
            .select('id')
            .eq('id', chatId)
            .single();

          if (userCheck) {
            const otherUserId = chatId;
            console.log('Found user, checking for existing conversation');
            // Check if conversation already exists
            console.log('Checking for existing conversation between', userId, 'and', otherUserId);
            const { data: existingConv, error: checkError } = await supabase
              .from('conversations')
              .select('id, created_at')
              .or(`and(user1_id.eq.${userId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${userId})`)
              .single();

            if (checkError) {
              console.error('Error checking for existing conversation:', checkError);
              throw new Error(`Failed to check existing conversation: ${checkError.message}`);
            }

            if (existingConv) {
              console.log('Existing conversation found:', existingConv);
              // Conversation already exists, redirect to it
              navigate(`/chat/${existingConv.id}`, { replace: true });
              return existingConv;
            }

            console.log('Creating new conversation');
            // This is a user ID, create a conversation
            const { data: newConversation, error: createError } = await supabase
              .from('conversations')
              .insert([{
                user1_id: userId,
                user2_id: chatId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }])
              .select('id, user1_id, user2_id')
              .single();

            if (createError) {
              console.error('Error creating conversation:', createError);
              toast({
                title: "Couldn't create conversation",
                description: "There was an error starting this chat.",
                variant: "destructive",
              });
              navigate('/chats');
              return;
            }

            // Update URL to use conversation ID
            navigate(`/chat/${newConversation.id}`, { replace: true });
            return newConversation;
          } else {
            toast({
              title: "Chat not found",
              description: "This conversation doesn't exist or you don't have access to it.",
              variant: "destructive",
            });
            navigate('/chats');
            return;
          }
        }

        // Determine partner ID
        const partnerId = conversation.user1_id === userId ? conversation.user2_id : conversation.user1_id;

        // Get partner info
        const { data: partnerData, error: partnerError } = await supabase
          .from('users')
          .select('id, username, profile_picture, native_language, learning_language, is_online, last_active')
          .eq('id', partnerId)
          .single();

        if (partnerError) {
          console.error('Error fetching partner:', partnerError);
          toast({
            title: "Couldn't load partner info",
            description: "There was an error loading your chat partner's information.",
            variant: "destructive",
          });
          navigate('/chats');
          return;
        }

        setPartner({
          id: partnerData.id,
          name: partnerData.username,
          avatar: partnerData.profile_picture,
          language: partnerData.native_language,
          online: partnerData.is_online,
          lastActive: new Date(partnerData.last_active || Date.now())
        });


      } catch (error: any) {
        console.error('Error in chat setup:', error);
        toast({
          title: "Error loading chat",
          description: error.message || "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatData();

    // Subscribe to new messages using the new chatService
    if (chatId) {
      const subscription = chatService.subscribeToMessages(chatId, (message) => {
          setMessages(prev => [...prev, message]);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [chatId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || !currentUserId) return;

    try {
      await chatService.sendMessage(chatId, currentUserId!, newMessage); //Fixed the receiver ID and sender ID
      setNewMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }

  // If no partner is found
  if (!partner) {
    return null;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/chats')}
            className="mr-3 text-muted-foreground hover:text-foreground rounded-full p-2 hover:bg-muted transition-colors"
            aria-label="Back to chats"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center">
            <div className="relative">
              <img
                src={partner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&background=random`}
                alt={partner.name}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&background=random`;
                }}
              />
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${partner.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </div>

            <div className="ml-3">
              <h2 className="font-semibold">{partner.name}</h2>
              <p className="text-xs text-muted-foreground">
                {partner.online
                  ? 'Online now'
                  : `Last active ${
                      partner.lastActive.toDateString() === new Date().toDateString()
                        ? 'today at ' + formatTime(partner.lastActive)
                        : formatDate(partner.lastActive)
                    }`
                }
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-muted transition-colors" aria-label="Audio call">
            <Phone className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-muted transition-colors" aria-label="Video call">
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-muted transition-colors" aria-label="More options">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            {!message.senderId === currentUserId && (
              <img
                src={partner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&background=random`}
                alt={partner.name}
                className="h-8 w-8 rounded-full mr-2 self-end object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&background=random`;
                }}
              />
            )}
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === currentUserId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="break-words">{message.text}</p>
              <p className={`text-xs mt-1 text-right ${message.senderId === currentUserId ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSend} className="p-4 border-t flex items-end bg-card">
        <button
          type="button"
          className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <div className="flex-1 mx-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full p-3 bg-muted/30 border-0 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[2.5rem] max-h-[8rem]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            rows={1}
          />
        </div>

        <div className="flex items-center">
          <button
            type="button"
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors mr-2"
          >
            <Smile className="h-5 w-5" />
          </button>

          <Button type="submit" className="rounded-full px-3 h-10 w-10" disabled={!newMessage.trim()} icon={<Send className="h-4 w-4" />} aria-label="Send message" />
        </div>
      </form>
    </div>
  );
};

export default Chat;