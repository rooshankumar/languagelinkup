import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  type: 'text' | 'emoji' | 'voice' | 'file';
  file_url?: string;
  file_type?: string;
}

interface Partner {
  id: string;
  username: string;
  profile_picture?: string;
  native_language: string;
  is_online: boolean;
  last_seen?: string;
}

export default function Chat() {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }
        setCurrentUserId(session.user.id);

        // Fetch conversation details
        const { data: conversationData, error: conversationError } = await supabase
          .from('conversations')
          .select('*')
          .or(`user1_id.eq.${chatId},user2_id.eq.${chatId}`)
          .single();

        if (conversationError) throw conversationError;

        // Fetch partner details
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', chatId)
          .single();

        if (userError) throw userError;
        setPartner(userData);

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationData.id)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;
        setMessages(messagesData || []);
        setIsLoading(false);

      } catch (error: any) {
        console.error('Error setting up chat:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat. Please try again.',
          variant: 'destructive',
        });
        navigate('/chats');
      }
    };

    fetchInitialData();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${chatId}`,
      }, handleNewMessage)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chatId, navigate]);

  const handleNewMessage = (payload: any) => {
    const newMessage = payload.new;
    setMessages((prev) => [...prev, newMessage]);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content: string, type: 'text' | 'emoji' | 'voice' | 'file' = 'text', fileUrl?: string, fileType?: string) => {
    if (!content.trim() && type === 'text') return;

    try {
      const { data: message, error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: chatId,
            sender_id: currentUserId,
            content,
            type,
            file_url: fileUrl,
            file_type: fileType,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setNewMessage('');
      setShowEmojiPicker(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || !partner) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto relative">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar src={partner.profile_picture} alt={partner.username} />
          <div>
            <h2 className="font-semibold">{partner.username}</h2>
            <p className="text-sm text-muted-foreground">
              {partner.is_online ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender_id === currentUserId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.type === 'text' && <p>{message.content}</p>}
              {message.type === 'emoji' && <p className="text-4xl">{message.content}</p>}
              {message.type === 'file' && (
                <a
                  href={message.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {message.content}
                </a>
              )}
              <span className="text-xs opacity-70 mt-1 block">
                {format(new Date(message.created_at), 'HH:mm')}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex items-end space-x-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(newMessage);
              }
            }}
          />
          <Button
            onClick={() => sendMessage(newMessage)}
            disabled={!newMessage.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}