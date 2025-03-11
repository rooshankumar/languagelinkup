
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { MessageCircle } from 'lucide-react';
import UserProfileCard from './UserProfileCard';
import { supabase } from '../lib/supabaseClient';
import { toast } from './ui/use-toast';

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
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${userId}`)
        .or(`user1_id.eq.${userId},user2_id.eq.${currentUserId}`)
        .maybeSingle();

      if (convCheckError) {
        console.error('Error checking existing conversation:', convCheckError);
      }
        
      console.log('Existing conversation check:', existingConv);
        
      if (existingConv) {
        navigate(`/chat/${existingConv.id}`);
        return;
      }
      
      // Create new conversation - properly formatted
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert([
          { 
            user1_id: currentUserId, 
            user2_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select('id')
        .single();
        
      console.log('New conversation creation result:', newConversation, createError);
        
      if (createError) {
        throw createError;
      }
      
      navigate(`/chat/${newConversation.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: 'Error creating chat',
        description: error.message || 'There was an error starting this chat',
        variant: 'destructive',
      });
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
              <UserProfileCard user={user} compact={true} onClick={() => {}} />
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
