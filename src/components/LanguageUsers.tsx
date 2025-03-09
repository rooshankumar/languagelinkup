
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import { MessageCircle } from 'lucide-react';
import UserProfileCard from '@/components/UserProfileCard';

const MOCK_USERS = [
  {
    id: '2',
    name: 'Maria Garcia',
    avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=random',
    location: 'Madrid, Spain',
    bio: 'Spanish teacher looking to practice English and make international friends.',
    nativeLanguage: 'Spanish',
    learningLanguages: [
      { language: 'English', proficiency: 'Intermediate' as const },
    ],
    learningGoals: 'I want to improve my English for my teaching career.',
    online: true,
  },
  {
    id: '3',
    name: 'Akira Tanaka',
    avatar: 'https://ui-avatars.com/api/?name=Akira+Tanaka&background=random',
    location: 'Tokyo, Japan',
    bio: 'Software engineer interested in learning English for work and travel.',
    nativeLanguage: 'Japanese',
    learningLanguages: [
      { language: 'English', proficiency: 'Advanced' as const },
    ],
    learningGoals: 'I want to communicate better with international colleagues.',
    online: false,
  },
  {
    id: '4',
    name: 'Sophie Laurent',
    avatar: 'https://ui-avatars.com/api/?name=Sophie+Laurent&background=random',
    location: 'Paris, France',
    bio: 'Culinary student wanting to learn Spanish for travel around Latin America.',
    nativeLanguage: 'French',
    learningLanguages: [
      { language: 'Spanish', proficiency: 'Beginner' as const },
      { language: 'Italian', proficiency: 'Beginner' as const },
    ],
    learningGoals: 'I want to be able to understand basic conversations during travel.',
    online: true,
  },
  {
    id: '5',
    name: 'Li Wei',
    avatar: 'https://ui-avatars.com/api/?name=Li+Wei&background=random',
    location: 'Shanghai, China',
    bio: 'Business student who loves movies and music. Want to improve my English.',
    nativeLanguage: 'Mandarin',
    learningLanguages: [
      { language: 'English', proficiency: 'Intermediate' as const },
    ],
    learningGoals: 'I want to study abroad in the United States next year.',
    online: false,
  }
];

const LanguageUsers = () => {
  const navigate = useNavigate();
  
  const handleChatClick = (userId: string) => {
    // In a real app, you would create a chat or navigate to an existing one
    navigate(`/chat/${userId}`);
  };
  
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Connect with Language Partners</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-4">
        {MOCK_USERS.map(user => (
          <div key={user.id} className="flex flex-col h-full">
            <UserProfileCard user={user} compact={true} onClick={() => {}} />
            <div className="p-3 border-t">
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
