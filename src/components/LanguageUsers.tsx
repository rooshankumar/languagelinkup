import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { MessageCircle, Plus } from 'lucide-react';
import UserProfileCard from './UserProfileCard';
import { MOCK_USERS } from '../utils/mockData';
import { supabase } from '../lib/supabaseClient';
import { toast } from './ui/use-toast';

const LanguageUsers = () => {
  const navigate = useNavigate();

  const handleChatClick = async (userId: string) => {
    try {
      // In a real app, you would create a chat or navigate to an existing one using Supabase
      // Example using Supabase (replace with your actual database schema and logic):
      // const { data, error } = await supabase
      //   .from('chats')
      //   .insert([{ user1Id: userId, user2Id: 'currentUserId' }]); // Replace 'currentUserId' with actual user ID

      // if (error) {
      //   throw error;
      // }
      // navigate(`/chat/${data[0].id}`); // Navigate to the newly created chat
      navigate(`/chat/${userId}`); // Placeholder navigation for now
    } catch (error) {
      toast({
        title: 'Error creating chat',
        description: error.message,
        variant: 'destructive',
      });
    }
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