import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { chatService } from '@/services/chatService';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  type: 'text' | 'voice' | 'attachment';
  attachment_url?: string;
}

export default function Chat() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatDetails, setChatDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const userId = user?.id;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (!chatId) return;

        const [chatData, messagesData] = await Promise.all([
          chatService.getChatDetails(chatId),
          chatService.getMessages(chatId)
        ]);

        setChatDetails(chatData);
        setMessages(messagesData);

        const subscription = chatService.subscribeToMessages(chatId, (payload) => {
          if (payload.new) {
            setMessages(prev => [...prev, payload.new]);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (err: any) {
        setError(err.message);
        toast({
          title: 'Error',
          description: 'Failed to load chat history',
          variant: 'destructive',
        });
        navigate('/chats');
      }
    };

    fetchInitialData();
  }, [chatId, navigate]);

  const sendMessage = async (type: 'text' | 'voice' | 'attachment', content: string, attachmentUrl?: string) => {
    if (!user || !chatId) return;

    try {
      await chatService.sendMessage(chatId, user.id, content, type, attachmentUrl);
      setNewMessage('');
      setShowEmojiPicker(false);
    } catch (error) {
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
  if (!chatDetails || !user) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto relative">
      <div className="flex items-center p-4 border-b">
        <Avatar src={chatDetails.partner.profile_picture} fallback={chatDetails.partner.username[0]} />
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
                  {message.type === 'voice' ? (
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
        <Button onClick={() => sendMessage('text', newMessage)}>Send</Button>
      </div>
    </div>
  );
}