
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import { MessageCircle } from 'lucide-react';

interface LanguageUser {
  id: string;
  name: string;
  avatar: string;
  nativeLanguage: string;
  learningLanguage: string;
  online: boolean;
}

const MOCK_USERS: LanguageUser[] = [
  {
    id: '2',
    name: 'Maria Garcia',
    avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=random',
    nativeLanguage: 'Spanish',
    learningLanguage: 'English',
    online: true,
  },
  {
    id: '3',
    name: 'Akira Tanaka',
    avatar: 'https://ui-avatars.com/api/?name=Akira+Tanaka&background=random',
    nativeLanguage: 'Japanese',
    learningLanguage: 'English',
    online: false,
  },
  {
    id: '4',
    name: 'Sophie Laurent',
    avatar: 'https://ui-avatars.com/api/?name=Sophie+Laurent&background=random',
    nativeLanguage: 'French',
    learningLanguage: 'Spanish',
    online: true,
  },
  {
    id: '5',
    name: 'Li Wei',
    avatar: 'https://ui-avatars.com/api/?name=Li+Wei&background=random',
    nativeLanguage: 'Mandarin',
    learningLanguage: 'English',
    online: false,
  }
];

const LanguageUsers = () => {
  const navigate = useNavigate();
  
  const handleChatClick = (userId: string) => {
    // In a real app, you would create a chat or navigate to an existing one
    navigate('/chat');
  };
  
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Connect with Language Partners</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-4">
        {MOCK_USERS.map(user => (
          <div key={user.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-12 h-12 rounded-full" 
                  />
                  {user.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <span className={user.online ? 'text-green-500' : 'text-gray-400'}>
                      {user.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Native language:</span>
                  <span className="font-medium">{user.nativeLanguage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Learning:</span>
                  <span className="font-medium">{user.learningLanguage}</span>
                </div>
              </div>
              
              <Button 
                onClick={() => handleChatClick(user.id)}
                className="w-full" 
                size="sm"
                icon={<MessageCircle className="h-4 w-4" />}
              >
                Start Chatting
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguageUsers;
