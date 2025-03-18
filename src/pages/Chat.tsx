import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const userId = user?.id; //Added to access user id

  const fetchChatDetails = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:user1_id(id,username,profile_picture),
          user2:user2_id(id,username,profile_picture)
        `)
        .eq('id', chatId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Chat not found');
      const partner = data.user1.id === userId ? data.user2 : data.user1;
      return { ...data, partner };
    } catch (error) {
      console.error('Error fetching chat details:', error);
      throw error;
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', chatId)
        .order('created_at', { ascending: true });

      if (messageError) throw messageError;
      return messageData || [];
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

        setPartner(chatDetails.partner); // Use the partner object from the updated fetchChatDetails
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

    const subscription = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${chatId}` 
      }, handleNewMessage)
      .subscribe();

    return () => {
      subscription.unsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId, navigate, userId]); // Added userId to the dependency array

  const handleNewMessage = (payload: any) => {
    const newMessage = payload.new;
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const sendMessage = async (type: 'text' | 'voice' | 'attachment', content: string, attachmentUrl?: string) => {
    if (!user || !chatId) return;

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: chatId,
        sender_id: user.id,
        content,
        type,
        attachment_url: attachmentUrl,
      });

      if (error) throw error;
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

      const { error: uploadError, data } = await supabase.storage
        .from('chat_attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat_attachments')
        .getPublicUrl(filePath);

      await sendMessage('attachment', file.name, publicUrl);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);

        try {
          const fileName = `voice_${Date.now()}.webm`;
          const { error: uploadError, data } = await supabase.storage
            .from('voice_messages')
            .upload(`${user?.id}/${fileName}`, audioBlob);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('voice_messages')
            .getPublicUrl(`${user?.id}/${fileName}`);

          await sendMessage('voice', 'Voice message', publicUrl);
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to upload voice message',
            variant: 'destructive',
          });
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      const recordingInterval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      setTimeout(() => {
        clearInterval(recordingInterval);
        stopRecording();
      }, 60000); // Max 1 minute recording
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start recording',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
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
              {message.type === 'text' && <p>{message.content}</p>}
              {message.type === 'voice' && (
                <audio controls src={message.attachment_url} className="w-full" />
              )}
              {message.type === 'attachment' && (
                <a
                  href={message.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {message.content}
                </a>
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

      <div className="p-4 border-t">
        {isRecording && (
          <div className="mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Recording: {recordingTime}s</span>
            <Progress value={(recordingTime / 60) * 100} className="flex-1" />
            <Button variant="destructive" size="sm" onClick={stopRecording}>
              Stop
            </Button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />

          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (newMessage.trim()) {
                  sendMessage('text', newMessage);
                }
              }
            }}
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😊
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            📎
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
          >
            🎤
          </Button>

          <Button
            onClick={() => {
              if (newMessage.trim()) {
                sendMessage('text', newMessage);
              }
            }}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}