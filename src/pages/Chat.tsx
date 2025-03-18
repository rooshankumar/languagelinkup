import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { chatService } from '@/services/chatService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
}

interface Partner {
  id: string;
  username: string;
  profile_picture?: string;
  native_language: string;
  is_online: boolean;
}

export default function Chat() {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        if (!chatId) {
          navigate('/chats');
          return;
        }

        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        const userId = session.user.id;
        setCurrentUserId(userId);

        // Fetch conversation and partner details
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('*, user1:user1_id(*), user2:user2_id(*)')
          .eq('id', chatId)
          .maybeSingle();

        if (convError) throw convError;
        if (!conversation) {
          toast({ title: "Chat not found", variant: "destructive" });
          navigate('/chats');
          return;
        }

        // Set partner data
        const partner = conversation.user1.id === userId ? conversation.user2 : conversation.user1;
        setPartner({
          id: partner.id,
          username: partner.username,
          profile_picture: partner.profile_picture,
          native_language: partner.native_language,
          is_online: partner.is_online
        });

        // Fetch messages
        const { data: messages, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', chatId)
          .order('created_at');

        if (msgError) throw msgError;
        setMessages(messages || []);

        // Subscribe to new messages
        const subscription = chatService.subscribeToMessages(chatId, (payload) => {
          const newMessage = payload.new;
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error: any) {
        console.error('Error loading chat:', error);
        toast({
          title: "Error loading chat",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatData();
  }, [chatId, navigate]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !chatId) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: chatId,
          sender_id: currentUserId,
          content: newMessage.trim(),
          created_at: new Date().toISOString(),
          is_read: false
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }

  if (!partner) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto">
      <div className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/chats')}
            className="mr-3 text-muted-foreground hover:text-foreground rounded-full p-2 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Avatar src={partner.profile_picture} fallback={partner.username[0]} />
          <div className="ml-3">
            <h3 className="font-medium">{partner.username}</h3>
            <p className="text-sm text-muted-foreground">{partner.native_language}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.sender_id === currentUserId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="break-words">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="resize-none"
            rows={1}
          />
          <Button onClick={sendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}