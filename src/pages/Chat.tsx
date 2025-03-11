import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/Button';
import { Send, ArrowLeft, Paperclip, Smile, MoreVertical, Phone, Video } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch messages and conversation data
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
            console.log('Found user, checking for existing conversation');
            // Check if conversation already exists
            // Fixed query using proper supabase filter syntax
            const { data: existingConv, error: checkError } = await supabase
              .from('conversations')
              .select('id')
              .or(`user1_id.eq.${userId},user2_id.eq.${chatId}`)
              .or(`user1_id.eq.${chatId},user2_id.eq.${userId}`)
              .maybeSingle();
              
            console.log('Conversation check results:', existingConv, checkError);

            if (checkError) {
              console.error('Error checking for existing conversation:', checkError);
              toast({
                title: "Couldn't load conversation",
                description: "There was an error loading this conversation.",
                variant: "destructive",
              });
              navigate('/chats');
              return;
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
              .insert({
                user1_id: userId,
                user2_id: chatId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
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

        // Get messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('id, sender_id, content, message, created_at, is_read, conversation_id')
          .eq('conversation_id', chatId)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          toast({
            title: "Couldn't load messages",
            description: "There was an error loading your conversation.",
            variant: "destructive",
          });
          return;
        }

        console.log('Messages data:', messagesData);

        // Mark unread messages as read
        const unreadMessages = messagesData.filter(
          msg => msg.sender_id !== userId && !msg.is_read
        );

        if (unreadMessages.length > 0) {
          await Promise.all(unreadMessages.map(msg => 
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', msg.id)
          ));
        }

        // Format messages for display
        const formattedMessages = messagesData.map(msg => ({
          id: msg.id,
          senderId: msg.sender_id,
          text: msg.content || msg.message || '', // Handle both content and message fields
          timestamp: new Date(msg.created_at),
          isRead: msg.is_read
        }));

        setMessages(formattedMessages);
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

    // Set up real-time message subscription
    if (chatId) {
      const subscription = supabase
        .channel(`chat:${chatId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${chatId}`
        }, async (payload) => {
          const newMsg = payload.new;

          // If this is from the partner, mark as read
          if (newMsg.sender_id !== currentUserId) {
            await supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMsg.id);
          }

          // Add to messages
          setMessages(prev => [...prev, {
            id: newMsg.id,
            senderId: newMsg.sender_id,
            text: newMsg.message || '', // Changed from content to message
            timestamp: new Date(newMsg.created_at),
            isRead: newMsg.sender_id === currentUserId ? false : true
          }]);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [chatId, navigate, currentUserId]);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || !currentUserId) return;

    try {
      // Insert message to database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: chatId,
          sender_id: currentUserId,
          message: newMessage, // Changed from content to message
          is_read: false
        })
        .select();

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

      // Clear message input
      setNewMessage('');

      // Simulate partner typing for demo purposes
      // In a real app, you might use a separate channel for typing indicators
      if (partner?.online) {
        setTimeout(() => setIsTyping(true), 1000);
        setTimeout(() => setIsTyping(false), 3500);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Couldn't send message",
        description: error.message || "Please try again",
        variant: "destructive",
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
        {messages.length > 0 ? (
          <>
            {/* Date separator for first message */}
            <div className="flex justify-center">
              <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                {formatDate(messages[0]?.timestamp || new Date())}
              </span>
            </div>

            {messages.map((message, index) => {
              const isCurrentUser = message.senderId === currentUserId;
              const showDateSeparator = index > 0 && 
                formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

              return (
                <React.Fragment key={message.id}>
                  {showDateSeparator && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                  )}

                  <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    {!isCurrentUser && (
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
                      className={`max-w-[75%] rounded-lg p-3 ${
                        isCurrentUser
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-card rounded-bl-none'
                      }`}
                    >
                      <p className="break-words">{message.text}</p>
                      <p className={`text-xs mt-1 text-right ${isCurrentUser ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </>
        ) : (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm">Start a conversation with {partner.name}</p>
            </div>
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start">
            <img 
              src={partner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&background=random`}
              alt={partner.name}
              className="h-8 w-8 rounded-full mr-2 self-end object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&background=random`;
              }}
            />
            <div className="bg-card rounded-lg rounded-bl-none p-3 max-w-[75%]">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '600ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t flex items-end bg-card">
        <button 
          type="button"
          className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <div className="flex-1 mx-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full p-3 bg-muted/30 border-0 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[2.5rem] max-h-[8rem]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
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

          <Button 
            type="submit" 
            className="rounded-full px-3 h-10 w-10"
            disabled={!newMessage.trim()}
            icon={<Send className="h-4 w-4" />}
            aria-label="Send message"
          />
        </div>
      </form>
    </div>
  );
};

export default Chat;