
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/Button';
import { Send, ArrowLeft, Paperclip, Smile, MoreVertical, Phone, Video } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// This will be replaced with real-time chat logic when you implement the backend
const MOCK_CHATS = {
  '1': {
    id: '1',
    partner: {
      id: '2',
      name: 'Maria Garcia',
      avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=random',
      language: 'Spanish',
      online: true,
      lastActive: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    },
    messages: [
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
    ]
  },
  '2': {
    id: '2',
    partner: {
      id: '3',
      name: 'Akira Tanaka',
      avatar: 'https://ui-avatars.com/api/?name=Akira+Tanaka&background=random',
      language: 'Japanese',
      online: false,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    messages: [
      {
        id: '1',
        senderId: '3',
        text: 'こんにちは！元気ですか？',
        timestamp: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        id: '2',
        senderId: '1',
        text: 'I\'m just starting to learn Japanese. Could you help me practice?',
        timestamp: new Date(Date.now() - 43200000) // 12 hours ago
      }
    ]
  },
  '3': {
    id: '3',
    partner: {
      id: '4',
      name: 'Sophie Laurent',
      avatar: 'https://ui-avatars.com/api/?name=Sophie+Laurent&background=random',
      language: 'French',
      online: true,
      lastActive: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
    },
    messages: [
      {
        id: '1',
        senderId: '4',
        text: 'Bonjour! Comment ça va?',
        timestamp: new Date(Date.now() - 7200000) // 2 hours ago
      }
    ]
  }
};

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

const Chat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [activeChat, setActiveChat] = useState<typeof MOCK_CHATS[keyof typeof MOCK_CHATS] | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // For real app, this would fetch from your API
  useEffect(() => {
    if (chatId && MOCK_CHATS[chatId as keyof typeof MOCK_CHATS]) {
      const chat = MOCK_CHATS[chatId as keyof typeof MOCK_CHATS];
      setActiveChat(chat);
      setMessages(chat.messages);
      
      // Simulate connection to chat server
      console.log('Connecting to chat server for chat ID:', chatId);
    } else if (chatId) {
      toast({
        title: "Chat not found",
        description: "This chat does not exist or has been deleted.",
        variant: "destructive",
      });
      navigate('/chats');
    } else {
      // No chatId, show chat list
      navigate('/chats');
    }
  }, [chatId, navigate]);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: '1', // Current user ID
      text: newMessage,
      timestamp: new Date()
    };

    setMessages([...messages, message]);
    setNewMessage('');
    
    // Simulate sending to server
    console.log('Sending message to server:', message);
    
    // Simulate typing indicator from partner (will be done by real-time backend)
    setTimeout(() => setIsTyping(true), 1000);
    setTimeout(() => {
      setIsTyping(false);
      // Simulate response for demo purposes
      if (activeChat.partner.online) {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          senderId: activeChat.partner.id,
          text: `This is a simulated response. In the real app, this would come from the actual user through your backend.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, response]);
      }
    }, 3500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // If no active chat is selected, navigate to chats list
  if (!activeChat) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/chats')}
            className="mr-3 text-muted-foreground hover:text-foreground rounded-full p-2 hover:bg-muted transition-colors"
            aria-label="Back to chats"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center">
            <div className="relative">
              <img
                src={activeChat.partner.avatar}
                alt={activeChat.partner.name}
                className="w-10 h-10 rounded-full"
              />
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${activeChat.partner.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </div>
            
            <div className="ml-3">
              <h2 className="font-semibold">{activeChat.partner.name}</h2>
              <p className="text-xs text-muted-foreground">
                {activeChat.partner.online 
                  ? 'Online now' 
                  : `Last active ${
                      activeChat.partner.lastActive.toDateString() === new Date().toDateString()
                        ? 'today at ' + formatTime(activeChat.partner.lastActive)
                        : formatDate(activeChat.partner.lastActive)
                    }`
                }
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-muted transition-colors" aria-label="Audio call">
            <Phone className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-muted transition-colors" aria-label="Video call">
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-muted transition-colors" aria-label="More options">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        {/* Date separator for demo */}
        <div className="flex justify-center">
          <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
            {formatDate(messages[0]?.timestamp || new Date())}
          </span>
        </div>
        
        {messages.map((message, index) => {
          const isCurrentUser = message.senderId === '1';
          const showDateSeparator = index > 0 && 
            formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
            
          return (
            <React.Fragment key={message.id}>
              {showDateSeparator && (
                <div className="flex justify-center my-4">
                  <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                    {formatDate(message.timestamp)}
                  </span>
                </div>
              )}
              
              <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                {!isCurrentUser && (
                  <img 
                    src={activeChat.partner.avatar} 
                    alt={activeChat.partner.name}
                    className="h-8 w-8 rounded-full mr-2 self-end"
                  />
                )}
                
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    isCurrentUser
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card rounded-bl-none'
                  }`}
                >
                  <p className="break-words">{message.text}</p>
                  <p className={`text-xs mt-1 text-right ${isCurrentUser ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        
        {isTyping && (
          <div className="flex justify-start">
            <img 
              src={activeChat.partner.avatar} 
              alt={activeChat.partner.name}
              className="h-8 w-8 rounded-full mr-2 self-end"
            />
            <div className="bg-card rounded-lg rounded-bl-none p-3 max-w-[75%]">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '600ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t flex items-end bg-card">
        <button 
          type="button"
          className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        
        <div className="flex-1 mx-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full p-3 bg-muted/30 border-0 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[2.5rem] max-h-[8rem]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            rows={1}
          />
        </div>
        
        <div className="flex items-center">
          <button 
            type="button"
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors mr-2"
          >
            <Smile className="h-5 w-5" />
          </button>
          
          <Button 
            type="submit" 
            className="rounded-full px-3 h-10 w-10"
            disabled={!newMessage.trim()}
            icon={<Send className="h-4 w-4" />}
            aria-label="Send message"
          />
        </div>
      </form>
    </div>
  );
};

export default Chat;
