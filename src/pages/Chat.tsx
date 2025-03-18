import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
  const [isLoading, setIsLoading] = useState(true);
  const [partner, setPartner] = useState<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const userId = user?.id;

  const fetchChatDetails = async (chatId: string) => {
    try {
      const chatDetails = await chatService.getChatDetails(chatId);
      if (!chatDetails) throw new Error('Chat not found');
      const partner = chatDetails.user1.id === userId ? chatDetails.user2 : chatDetails.user1;
      return { ...chatDetails, partner };
    } catch (error) {
      console.error('Error fetching chat details:', error);
      throw error;
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const messages = await chatService.getMessages(chatId);
      if (messages) setMessages(messages);
      return messages || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!chatId) return;
      try {
        const [chatDetails, messages] = await Promise.all([
          fetchChatDetails(chatId),
          fetchMessages(chatId),
        ]);

        setPartner(chatDetails.partner);
        setMessages(messages);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat history',
          variant: 'destructive',
        });
        navigate('/chats');
      }
    };

    fetchInitialData();

    const subscription = chatService.subscribeToMessages(chatId, handleNewMessage);

    if (chatId && userId) {
      chatService.markAsRead(chatId, userId);
    }

    return () => {
      subscription.unsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId, navigate, userId]);

  const handleNewMessage = (newMessage: Message) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { publicUrl } = await chatService.uploadFile(file, filePath);
      await sendMessage('attachment', file.name, publicUrl);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || !partner) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto relative">
      <div className="flex items-center p-4 border-b">
        <Avatar src={partner.profile_picture} fallback={partner.username[0]} />
        <div className="ml-4">
          <h2 className="font-semibold">{partner.username}</h2>
          <p className="text-sm text-gray-500">
            {partner.is_online ? 'Online' : `Last seen ${format(new Date(partner.last_active || Date.now()), 'PP')}`}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.sender_id === user?.id
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
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => {
              setNewMessage((prev) => prev + emoji.native);
              setShowEmojiPicker(false);
            }}
          />
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
