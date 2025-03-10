
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MessageCircle } from 'lucide-react';
import Button from '@/components/Button';

// Mock data - will be replaced with API calls
const MOCK_CHATS = [
  {
    id: '1',
    partner: {
      id: '2',
      name: 'Maria Garcia',
      avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=random',
      language: 'Spanish',
    },
    lastMessage: {
      text: 'You would say "Quiero practicar mi español"',
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      isRead: true,
      senderId: '2'
    },
    unreadCount: 0,
    online: true
  },
  {
    id: '2',
    partner: {
      id: '3',
      name: 'Akira Tanaka',
      avatar: 'https://ui-avatars.com/api/?name=Akira+Tanaka&background=random',
      language: 'Japanese',
    },
    lastMessage: {
      text: 'I\'m just starting to learn Japanese. Could you help me practice?',
      timestamp: new Date(Date.now() - 43200000), // 12 hours ago
      isRead: true,
      senderId: '1'
    },
    unreadCount: 0,
    online: false
  },
  {
    id: '3',
    partner: {
      id: '4',
      name: 'Sophie Laurent',
      avatar: 'https://ui-avatars.com/api/?name=Sophie+Laurent&background=random',
      language: 'French',
    },
    lastMessage: {
      text: 'Bonjour! Comment ça va?',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      isRead: false,
      senderId: '4'
    },
    unreadCount: 1,
    online: true
  }
];

const ChatList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date >= today) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date >= yesterday) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };
  
  const filteredChats = MOCK_CHATS.filter(chat => 
    chat.partner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="max-w-3xl mx-auto h-full">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Button 
            onClick={() => navigate('/community')}
            icon={<Plus className="h-4 w-4" />}
            size="sm"
          >
            New Chat
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-y-auto h-[calc(100vh-10rem)]">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className="p-4 border-b hover:bg-muted/30 cursor-pointer transition-colors"
            >
              <div className="flex items-start">
                <div className="relative">
                  <img 
                    src={chat.partner.avatar}
                    alt={chat.partner.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {chat.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium">{chat.partner.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(chat.lastMessage.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-sm truncate ${!chat.lastMessage.isRead && chat.lastMessage.senderId !== '1' ? 'font-medium' : 'text-muted-foreground'}`}>
                      {chat.lastMessage.senderId === '1' ? 'You: ' : ''}
                      {chat.lastMessage.text}
                    </p>
                    
                    {chat.unreadCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    Speaking {chat.partner.language}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 p-4">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No messages found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm 
                ? `No chats matching "${searchTerm}"`
                : "You haven't started any conversations yet"}
            </p>
            <Button 
              onClick={() => navigate('/community')}
              icon={<Plus className="h-4 w-4" />}
            >
              Find Language Partners
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
