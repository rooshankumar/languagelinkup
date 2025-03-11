import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import UserProfileCard from '@/components/UserProfileCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  username: string;
  profile_picture: string | null;
  native_language: string;
  learning_language: string;
  proficiency: string;
  bio: string | null;
  last_active: string;
  is_online: boolean;
}

// Convert database user to the format expected by UserProfileCard
const mapDatabaseUserToUIUser = (user: UserData) => {
  return {
    id: user.id,
    name: user.username,
    avatar: user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`,
    location: '', // Add if available in your schema
    bio: user.bio || `Learning ${user.learning_language}`,
    nativeLanguage: user.native_language,
    learningLanguages: [
      { language: user.learning_language, proficiency: user.proficiency as any },
    ],
    learningGoals: '', // Add if available in your schema
    online: user.is_online,
  };
};

const Community = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        console.log('Fetching users from database...');

        // Query the database for all users
        const { data, error } = await supabase
          .from('users')
          .select('*');

        console.log('Fetched users from database:', data);

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          // If no users found, let's create some sample users for testing
          console.log("No users found, inserting sample users for testing");

          // Sample users data based on your MOCK_USERS
          const sampleUsers = [
            {
              username: 'Maria Garcia',
              email: 'maria@example.com',
              profile_picture: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=random',
              native_language: 'es',
              learning_language: 'en',
              proficiency: 'Intermediate',
              bio: 'Spanish teacher looking to practice English and make international friends.',
              is_online: true,
              last_active: new Date().toISOString()
            },
            {
              username: 'Akira Tanaka',
              email: 'akira@example.com',
              profile_picture: 'https://ui-avatars.com/api/?name=Akira+Tanaka&background=random',
              native_language: 'ja',
              learning_language: 'en',
              proficiency: 'Advanced',
              bio: 'Software engineer interested in learning English for work and travel.',
              is_online: false,
              last_active: new Date().toISOString()
            },
            {
              username: 'Sophie Laurent',
              email: 'sophie@example.com',
              profile_picture: 'https://ui-avatars.com/api/?name=Sophie+Laurent&background=random',
              native_language: 'fr',
              learning_language: 'es',
              proficiency: 'Beginner',
              bio: 'Culinary student wanting to learn Spanish for travel around Latin America.',
              is_online: true,
              last_active: new Date().toISOString()
            }
          ];

          // Insert sample users
          for (const user of sampleUsers) {
            await supabase.from('users').insert([user]);
          }

          // Fetch users again after inserting samples
          const { data: newData, error: newError } = await supabase
            .from('users')
            .select('*');

          if (newError) {
            throw newError;
          }

          setUsers(newData || []);
        } else {
          setUsers(data);
        }
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err);
        toast({
          title: 'Error',
          description: 'Failed to fetch community members. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleChatClick = (userId: string) => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Language Community</h1>
        {process.env.NODE_ENV !== 'production' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/debug/community')}
          >
            Debug Users
          </Button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="loader"></div>
          <p className="ml-3">Loading community members...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> Could not load community members</p>
          <p className="text-sm">Details: {error.message}</p>
        </div>
      )}

      {!loading && users.length === 0 && !error && (
        <div className="text-center py-10">
          <p className="text-xl">No community members found.</p>
          <p className="text-muted-foreground mt-2">Check back soon as new members join!</p>
        </div>
      )}

      {users.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map(user => (
            <div key={user.id} className="flex flex-col h-full">
              <UserProfileCard user={mapDatabaseUserToUIUser(user)} compact={true} onClick={() => {}} />
              <div className="p-3 border-t">
                <Button 
                  onClick={() => handleChatClick(user.id)}
                  className="w-full" 
                  size="sm"
                  variant="default"
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

export default Community;
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import UserProfileCard from '@/components/UserProfileCard';
import { MessageCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Community = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('is_online', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error fetching users',
        description: error.message || 'Failed to load community members',
        variant: 'destructive',
      });
      
      // Fallback data
      setUsers([
        {
          id: '1',
          username: 'Maria Garcia',
          profile_picture: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=random',
          native_language: 'es',
          learning_language: 'en',
          is_online: true
        },
        {
          id: '2',
          username: 'Akira Tanaka',
          profile_picture: 'https://ui-avatars.com/api/?name=Akira+Tanaka&background=random',
          native_language: 'ja',
          learning_language: 'en',
          is_online: false
        },
        {
          id: '3',
          username: 'Sophie Laurent',
          profile_picture: 'https://ui-avatars.com/api/?name=Sophie+Laurent&background=random',
          native_language: 'fr',
          learning_language: 'es',
          is_online: true
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
        navigate('/auth');
        return;
      }
      
      const currentUserId = currentUser.user.id;
      
      // Check if conversation exists
      const { data: existingConv, error: convCheckError } = await supabase
        .from('conversations')
        .select('id')
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${userId}`)
        .or(`user1_id.eq.${userId},user2_id.eq.${currentUserId}`)
        .maybeSingle();

      if (convCheckError) {
        console.error('Error checking existing conversation:', convCheckError);
      }
        
      if (existingConv) {
        navigate(`/chat/${existingConv.id}`);
        return;
      }
      
      // Create new conversation
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
      <h2 className="text-2xl font-bold mb-6 text-center">Community</h2>
      
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

export default Community;
