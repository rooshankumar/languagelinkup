
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
import { Smile, Paperclip, Mic, Send, X } from 'lucide-react';

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
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

        const [chatDetails, messages] = await Promise.all([
          fetchChatDetails(chatId),
          fetchMessages(chatId),
        ]);

        setPartner(chatDetails);
        setMessages(messages);
        setIsLoading(false);

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
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat. Please try again.',
          variant: 'destructive',
        });
      }
    };

    fetchInitialData();
  }, [chatId, navigate]);

  const handleNewMessage = (payload: any) => {
    const newMessage = payload.new;
    setMessages((prev) => [...prev, newMessage]);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Error',
        description: 'Failed to start recording. Please check your microphone permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    return new Promise<Blob>((resolve) => {
      mediaRecorderRef.current!.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        resolve(audioBlob);
      };
      mediaRecorderRef.current!.stop();
      setIsRecording(false);
    });
  };

  const handleFileUpload = async (file: File) => {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = `chat_attachments/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from('chat_files')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          },
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('chat_files')
        .getPublicUrl(filePath);

      await sendMessage(file.name, 'file', publicUrl, file.type);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleVoiceMessage = async () => {
    if (isRecording) {
      const audioBlob = await stopRecording();
      const fileName = `voice-${Date.now()}.webm`;
      await handleFileUpload(new File([audioBlob], fileName, { type: 'audio/webm' }));
    } else {
      startRecording();
    }
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

  if (isLoading || !partner) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto relative">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-4">
          <Avatar src={partner.profile_picture} fallback={partner.username[0]} />
          <div>
            <h2 className="font-semibold">{partner.username}</h2>
            <p className="text-sm text-muted-foreground">
              {partner.is_online ? 'Online' : 'Offline'}
            </p>
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
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender_id === currentUserId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.type === 'text' && <p>{message.content}</p>}
              {message.type === 'emoji' && <p className="text-4xl">{message.content}</p>}
              {message.type === 'file' && message.file_type?.startsWith('audio') && (
                <audio controls src={message.file_url} className="max-w-full" />
              )}
              {message.type === 'file' && !message.file_type?.startsWith('audio') && (
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

      {uploadProgress > 0 && (
        <div className="p-2">
          <Progress value={uploadProgress} />
        </div>
      )}

      <div className="p-4 border-t">
        {showEmojiPicker && (
          <div className="absolute bottom-24 right-4">
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                className="absolute -top-2 -right-2"
                onClick={() => setShowEmojiPicker(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <Picker
                data={data}
                onEmojiSelect={(emoji: any) => {
                  sendMessage(emoji.native, 'emoji');
                }}
              />
            </div>
          </div>
        )}

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
          <div className="flex flex-col space-y-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleVoiceMessage}
              className={isRecording ? 'animate-pulse text-red-500' : ''}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={() => sendMessage(newMessage)}
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />
      </div>
    </div>
  );
}
