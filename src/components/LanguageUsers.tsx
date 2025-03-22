import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { MessageCircle } from 'lucide-react';
import UserProfileCard from './UserProfileCard';
import { supabase } from '../lib/supabaseClient';
import { toast } from './ui/use-toast';
import { chatService } from '../services/chatService';

const LanguageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(6);

      if (error) {
        throw error;
      }

      if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error fetching users',
        description: error.message || 'Failed to load users',
        variant: 'destructive',
      });

      // Use sample data as fallback
      setUsers([
        {
          id: '1',
          username: 'Maria Garcia',
          profile_picture: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=random',
          native_language: 'es',
          learning_language: 'en',
          proficiency: 'Intermediate'
        },
        {
          id: '2',
          username: 'Akira Tanaka',
          profile_picture: 'https://ui-avatars.com/api/?name=Akira+Tanaka&background=random',
          native_language: 'ja',
          learning_language: 'en',
          proficiency: 'Advanced'
        },
        {
          id: '3',
          username: 'Sophie Laurent',
          profile_picture: 'https://ui-avatars.com/api/?name=Sophie+Laurent&background=random',
          native_language: 'fr',
          learning_language: 'es',
          proficiency: 'Beginner'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = async (userId) => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();

      if (!currentUser?.user?.id) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to start a chat',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      const currentUserId = currentUser.user.id;

      // Check if conversation exists - using proper parameter format
      const { data: existingConv, error: convCheckError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${currentUserId})`)
        .single();

      if (convCheckError) {
        console.error('Error checking existing conversation:', convCheckError);
        toast({
          title: 'Error checking conversation',
          description: convCheckError.message || 'Failed to check for existing conversation',
          variant: 'destructive',
        });
        return; // Stop execution if there's an error checking for existing conversations.
      }

      console.log('Existing conversation check:', existingConv);

      if (existingConv) {
        navigate(`/chat/${existingConv.id}`);
        return;
      }

      // Use chatService to create conversation
      const newConversation = await chatService.createConversation(currentUserId, userId);


      console.log('New conversation creation result:', newConversation);

      if (!newConversation?.id) {
        throw new Error('No conversation ID returned after creation');
      }

      navigate(`/chat/${newConversation.id}`);
    } catch (error: any) {
      console.error('Error creating chat:', error);
      toast({
        title: 'Error creating chat',
        description: error.message || 'Unable to start chat. Please try again.',
        variant: 'destructive',
      });

      // Log additional error details if available
      if (error.details || error.hint || error.code) {
        console.error('Additional error details:', {
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      }
    }
  };

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Connect with Language Partners</h2>

      {loading ? (
        <div className="text-center py-8">Loading users...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-4">
          {users.map(user => (
            <div key={user.id} className="flex flex-col h-full">
              <UserProfileCard 
                user={{
                  ...user,
                  avatar: user.avatar_url ? supabase.storage.from('avatars').getPublicUrl(user.avatar_url).data.publicUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || "User")}&background=random`
                }} 
                compact={true} 
                onClick={() => {}} 
              />
              <div className="p-3 border-t">
                <Button
                  onClick={() => handleChatClick(user.id)}
                  className="w-full"
                  size="sm"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Chatting
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageUsers;