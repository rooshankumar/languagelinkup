import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Smile, Paperclip, Mic } from 'lucide-react';
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);


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


  const handleVoiceRecord = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(audioBlob);

        // Upload voice message
        if (chatId) {
          try {
            const path = `chat-attachments/${chatId}/${Date.now()}_voice.webm`;
            const { data, error } = await supabase.storage
              .from('chat-attachments')
              .upload(path, audioBlob);

            if (error) throw error;

            const { data: { publicUrl }, error: urlError } = supabase.storage
              .from('chat-attachments')
              .getPublicUrl(path);

            if (urlError) throw urlError;

            await supabase.from('messages').insert({
              conversation_id: chatId,
              sender_id: currentUserId,
              content: 'Voice message',
              type: 'voice',
              file_url: publicUrl,
              file_type: 'audio/webm'
            });
          } catch (error) {
            console.error('Error uploading voice message:', error);
            toast({
              title: 'Error',
              description: 'Failed to send voice message',
              variant: 'destructive',
            });
          }
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Error',
        description: 'Could not access microphone',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !chatId) return;

    try {
      setIsUploadingFile(true);
      const path = `chat-attachments/${chatId}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(path, file);

      if (error) throw error;

      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(path);

      if (urlError) throw urlError;

      await supabase.from('messages').insert({
        conversation_id: chatId,
        sender_id: currentUserId,
        content: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        file_url: publicUrl,
        file_type: file.type
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingFile(false);
      event.target.value = '';
    }
  };

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
        <div className="flex gap-2 relative">
          {showEmojiPicker && (
            <div className="absolute bottom-full mb-2">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-4 w-4" />
          </Button>
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="resize-none"
            rows={1}
          />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVoiceRecord}
            className={isRecording ? 'text-red-500' : ''}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button onClick={sendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
            accept="image/*,video/*,audio/*,application/pdf"
          />
        </div>
      </div>
    </div>
  );
}