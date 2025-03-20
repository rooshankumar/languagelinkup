import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { chatService } from '@/services/chatService';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Image as ImageIcon, Smile, Send, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  content_type: 'text' | 'image' | 'voice';
  attachment_url?: string;
  status: 'sending' | 'sent' | 'delivered' | 'seen';
}

export default function Chat() {
  const { id: chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatDetails, setChatDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const userId = user?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!chatId) {
      setError('Chat ID is missing');
      return;
    }

    const setupSubscription = () => {
      const subscription = supabase
        .channel(`chat:${chatId}`);

      subscription
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            subscription.track({ user_id: user?.id, is_typing: false });
          }
        });

      subscription.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        if (newMessage.sender_id !== user?.id) {
          setMessages(current => [...current, newMessage]);
          updateMessageStatus(newMessage.id, 'seen');
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const presenceState = subscription.presenceState();
        const partnerState = Object.values(presenceState).find((state: any) => 
          state.user_id !== user?.id
        );
        setPartnerIsTyping(partnerState?.is_typing || false);
      })
      .subscribe();
    };

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const details = await chatService.getChatDetails(chatId);
        setChatDetails(details);
        setMessages(details.messages.map((msg: Message) => ({
          ...msg,
          status: msg.sender_id === user?.id ? 'seen' : msg.status
        })));
      } catch (err: any) {
        console.error('Error fetching chat:', err);
        setError(err.message || 'Failed to load chat');
        if (err.message?.includes('not authenticated')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    setupSubscription();
    fetchInitialData();
    return () => {
      // Unsubscribe from the subscription
      supabase.channel(`chat:${chatId}`).unsubscribe();
    };
  }, [chatId, navigate, toast, user?.id]);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      supabase.channel(`chat:${chatId}`).track({ user_id: user?.id, is_typing: true });
      setTimeout(() => {
        setIsTyping(false);
        supabase.channel(`chat:${chatId}`).track({ user_id: user?.id, is_typing: false });
      }, 2000);
    }
  };

  const updateMessageStatus = async (messageId: string, status: Message['status']) => {
    try {
      await chatService.updateMessageStatus(messageId, status);
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(`${chatId}/${Date.now()}-${file.name}`, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(uploadData.path);

      await sendMessage('image', file.name, publicUrl);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async (type: 'text' | 'image' = 'text', content: string = newMessage, attachmentUrl?: string) => {
    if ((!content && !attachmentUrl) || !user || !chatId) return;

    const tempMessage = {
      id: crypto.randomUUID(),
      chat_id: chatId,
      sender_id: user.id,
      content,
      content_type: type,
      attachment_url: attachmentUrl,
      created_at: new Date().toISOString(),
      status: 'sending' as const
    };

    setMessages(current => [...current, tempMessage]);
    setNewMessage('');
    setShowEmojiPicker(false);

    try {
      const sentMessage = await chatService.sendMessage(chatId, content, type, attachmentUrl);
      setMessages(current => 
        current.map(msg => msg.id === tempMessage.id ? { ...sentMessage, status: 'sent' } : msg)
      );
    } catch (error) {
      setMessages(current => current.filter(msg => msg.id !== tempMessage.id));
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  if (error) return <div>Error: {error}</div>;
  if (loading || !chatDetails || !user) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto relative bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <Avatar>
            <AvatarImage 
              src={chatDetails.partner.profile_picture 
                ? supabase.storage.from('avatars').getPublicUrl(chatDetails.partner.profile_picture).data.publicUrl
                : null
              } 
            />
            <AvatarFallback>{chatDetails.partner.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <h2 className="font-semibold">{chatDetails.partner.username}</h2>
            <p className="text-sm text-muted-foreground">
              {partnerIsTyping ? 'Typing...' : (
                chatDetails.partner.is_online ? 'Online' : 
                `Last seen ${formatDistanceToNow(new Date(chatDetails.partner.last_active || Date.now()), { addSuffix: true })}`
              )}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.sender_id === userId
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.content_type === 'image' ? (
                  <img
                    src={message.attachment_url}
                    alt="Shared image"
                    className="rounded-lg max-w-full h-auto"
                    loading="lazy"
                  />
                ) : (
                  <p className="break-words">{message.content}</p>
                )}
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-xs opacity-70">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                  {message.sender_id === userId && (
                    <span className="text-xs">
                      {message.status === 'sending' && '🕒'}
                      {message.status === 'sent' && '✓'}
                      {message.status === 'delivered' && '✓✓'}
                      {message.status === 'seen' && '✓✓✓'}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4">
          <Picker data={data} onEmojiSelect={handleEmojiSelect} theme={theme} />
        </div>
      )}

      <div className="p-4 border-t">
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 min-h-[44px] max-h-[200px]"
            rows={1}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!newMessage.trim()}
            size="icon"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}