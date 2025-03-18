import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Smile, Paperclip, Mic, ChevronDown, Check, CheckCheck } from 'lucide-react';
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
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  type?: 'text' | 'voice' | 'image' | 'file';
  file_url?: string;
  file_type?: string;
  reactions?: { [key: string]: string[] };
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

  const fetchChatDetails = async (chatId: string) => {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user1:user1_id(id, username, profile_picture, native_language, is_online, last_seen),
        user2:user2_id(id, username, profile_picture, native_language, is_online, last_seen)
      `)
      .eq('id', chatId)
      .single();

    if (error) throw error;

    const otherUser = data.user1_id === currentUserId ? data.user2 : data.user1;
    setPartner(otherUser);
    return data;
  };


  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }
        setCurrentUserId(session.user.id);

        if (!chatId) return;

        // Subscribe to new messages
        const subscription = supabase
          .channel(`chat:${chatId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${chatId}`,
          }, handleNewMessage)
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${chatId}`,
          }, handleMessageUpdate)
          .subscribe();

        // Fetch chat details and messages
        const [chatDetails, messages] = await Promise.all([
          fetchChatDetails(chatId),
          fetchMessages(chatId),
        ]);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up chat:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat',
          variant: 'destructive',
        });
      }
    };

    fetchInitialData();
  }, [chatId, navigate]);

  const handleNewMessage = (payload: any) => {
    const newMessage = payload.new;
    setMessages(prev => [...prev, newMessage]);
    playNotificationSound();
    scrollToBottom();
  };

  const handleMessageUpdate = (payload: any) => {
    const updatedMessage = payload.new;
    setMessages(prev =>
      prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
    );
  };

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(console.error);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
  };

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId || !currentUserId) return;

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: chatId,
        sender_id: currentUserId,
        content: newMessage,
        type: 'text',
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !chatId) return;

    try {
      setUploadProgress(0);
      const path = `chat-attachments/${chatId}/${Date.now()}_${file.name}`;

      // Upload file with progress tracking
      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(path, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          },
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(path);

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
      setUploadProgress(0);
      if (event.target) event.target.value = '';
    }
  };

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

        try {
          const path = `chat-attachments/${chatId}/${Date.now()}_voice.webm`;
          const { data, error } = await supabase.storage
            .from('chat-attachments')
            .upload(path, audioBlob);

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('chat-attachments')
            .getPublicUrl(path);

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

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      // Emit typing status to other users
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Emit stopped typing status
    }, 3000);
  };

  const fetchMessages = async (chatId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', chatId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  };


  if (!partner) return null;

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col relative">
      <div className="sticky top-0 z-10 bg-background border-b p-2 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {partner && (
          <div className="flex items-center gap-2">
            <Avatar src={partner.profile_picture || ''} fallback={partner.username?.[0]} />
            <div>
              <p className="font-medium">{partner.username}</p>
              <p className="text-xs text-muted-foreground">{partner.is_online ? 'Online' : 'Offline'}</p>
            </div>
          </div>
        )}
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex flex-col max-w-[70%] ${message.sender_id === currentUserId ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-lg p-3 ${
                message.sender_id === currentUserId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}>
                {message.type === 'voice' ? (
                  <audio src={message.file_url} controls className="w-full" />
                ) : message.type === 'image' ? (
                  <img src={message.file_url} alt="Image" className="max-w-full rounded" />
                ) : message.type === 'file' ? (
                  <a href={message.file_url} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-2 text-blue-500 hover:underline">
                    <Paperclip className="h-4 w-4" />
                    {message.content}
                  </a>
                ) : (
                  <p>{message.content}</p>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <span>
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {message.sender_id === currentUserId && (
                  message.is_read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-20 right-4 rounded-full shadow-lg"
          onClick={scrollToBottom}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}

      {uploadProgress > 0 && (
        <div className="px-4 py-2">
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      <div className="p-4 border-t bg-background">
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4">
            <Picker data={data} onEmojiSelect={handleEmojiSelect} />
          </div>
        )}

        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,video/*,application/pdf"
          />

          <Textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className="min-h-[40px] max-h-[120px]"
            rows={1}
          />

          {newMessage.trim() ? (
            <Button size="icon" onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant={isRecording ? 'destructive' : 'default'}
              size="icon"
              onClick={handleVoiceRecord}
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}