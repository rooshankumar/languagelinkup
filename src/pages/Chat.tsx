
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { chatService } from '@/services/chatService';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  content_type: 'text' | 'voice' | 'attachment';
  attachment_url?: string;
}

export default function Chat() {
  const { id: chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatDetails, setChatDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const userId = user?.id;

  useEffect(() => {
    if (!chatId) {
      setError('Chat ID is missing');
      return;
    }

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        if (payload.new.sender_id !== user?.id) {
          setMessages(current => [...current, payload.new as Message]);
        }
      })
      .subscribe();

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const details = await chatService.getChatDetails(chatId);
        setChatDetails(details);
        setMessages(details.messages);
      } catch (err: any) {
        console.error('Error fetching chat:', err);
        setError(err.message || 'Failed to load chat');
        if (err.message?.includes('not authenticated')) {
          navigate('/login');
        } else if(err.message === 'Invalid user ID or partner ID.'){
          toast({
            title: 'Error',
            description: 'Invalid user ID or partner ID.',
            variant: 'destructive',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [chatId, navigate, toast, user?.id]);

  const sendMessage = async (type: 'text' | 'voice' | 'attachment' = 'text', content: string = newMessage, attachmentUrl?: string) => {
    if (!user || !chatId) return;

    const tempMessage = {
      id: crypto.randomUUID(),
      chat_id: chatId,
      sender_id: user.id,
      content,
      content_type: type,
      attachment_url: attachmentUrl,
      created_at: new Date().toISOString()
    };

    // Optimistic update
    setMessages(current => [...current, tempMessage]);
    setNewMessage('');
    setShowEmojiPicker(false);

    try {
      const sentMessage = await chatService.sendMessage(chatId, content, type, attachmentUrl);
      // Replace temp message with real one
      setMessages(current => 
        current.map(msg => msg.id === tempMessage.id ? sentMessage : msg)
      );
    } catch (error) {
      // Remove temp message on error
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
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto relative">
      <div className="flex items-center p-4 border-b">
        <Avatar>
          <AvatarImage src={chatDetails.partner.profile_picture} />
          <AvatarFallback>{chatDetails.partner.username[0]}</AvatarFallback>
        </Avatar>
        <div className="ml-4">
          <h2 className="font-semibold">{chatDetails.partner.username}</h2>
          <p className="text-sm text-gray-500">
            {chatDetails.partner.is_online ? 'Online' : `Last seen ${format(new Date(chatDetails.partner.last_active || Date.now()), 'PP')}`}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.sender_id === userId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="break-words">{message.content}</p>
              {message.attachment_url && (
                <div className="mt-2">
                  {message.content_type === 'voice' ? (
                    <audio controls src={message.attachment_url} className="w-full" />
                  ) : (
                    <a
                      href={message.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      View Attachment
                    </a>
                  )}
                </div>
              )}
              <span className="text-xs opacity-70 mt-1 block">
                {format(new Date(message.created_at || Date.now()), 'p')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4">
          <Picker data={data} onEmojiSelect={handleEmojiSelect} />
        </div>
      )}

      <div className="p-4 border-t flex gap-2">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button onClick={() => sendMessage()}>Send</Button>
      </div>
    </div>
  );
}
