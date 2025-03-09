
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import { Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// This would be replaced with actual auth state in a real implementation
const MOCK_USER = {
  id: '1',
  name: 'Current User',
  avatar: 'https://ui-avatars.com/api/?name=Current+User&background=random'
};

// Mock chat partner
const MOCK_PARTNER = {
  id: '2',
  name: 'Language Partner',
  avatar: 'https://ui-avatars.com/api/?name=Language+Partner&background=random',
  language: 'Spanish'
};

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: '2',
      text: '¡Hola! ¿Cómo estás?',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      senderId: '1',
      text: 'I\'m good! Still learning Spanish. How do you say "I want to practice my Spanish"?',
      timestamp: new Date(Date.now() - 1800000)
    },
    {
      id: '3',
      senderId: '2',
      text: 'You would say "Quiero practicar mi español"',
      timestamp: new Date(Date.now() - 900000)
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: MOCK_USER.id,
      text: newMessage,
      timestamp: new Date()
    };

    setMessages([...messages, message]);
    setNewMessage('');
    
    // In a real app, this is where you would send the message to your backend
    toast({
      title: "Message sent",
      description: "Your message has been delivered.",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-3xl mx-auto">
      {/* Chat header */}
      <div className="flex items-center p-4 border-b bg-background">
        <button 
          onClick={() => navigate('/')}
          className="mr-4 text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>
        <img
          src={MOCK_PARTNER.avatar}
          alt={MOCK_PARTNER.name}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <h2 className="font-semibold">{MOCK_PARTNER.name}</h2>
          <p className="text-sm text-muted-foreground">Learning {MOCK_PARTNER.language}</p>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === MOCK_USER.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.senderId === MOCK_USER.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p>{message.text}</p>
              <p className={`text-xs mt-1 ${message.senderId === MOCK_USER.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 bg-background border border-input rounded-l-md focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <Button 
          type="submit" 
          className="rounded-l-none"
          icon={<Send className="h-4 w-4" />}
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default Chat;
