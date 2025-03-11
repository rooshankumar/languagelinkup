
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import { Search, Filter, MessageCircle, Languages, Globe, User } from 'lucide-react';
import { LANGUAGES } from '@/pages/Onboarding';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

// Available languages for filtering
const LANGUAGES_FILTER = [
  'Any Language',
  'English',
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Mandarin',
  'Russian'
];

// Interface for user data
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

const Community = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [nativeLanguageFilter, setNativeLanguageFilter] = useState('Any Language');
  const [learningLanguageFilter, setLearningLanguageFilter] = useState('Any Language');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch users from the database
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Check if the current user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      
      // Get current user ID
      const currentUserId = session.user.id;
      
      // Fetch all users regardless of whether they're complete or not
      // This way we can debug what users actually exist in the database
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('*');
      
      if (allUsersError) {
        throw allUsersError;
      }
      
      console.log('ALL users in database:', allUsers);
      
      // Fetch all users except the current user
      // No filter on is_online to show all users
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', currentUserId);
      
      if (error) {
        throw error;
      }
      
      console.log('Fetched users from database:', data);
      
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
        const { data: newData, error: refetchError } = await supabase
          .from('users')
          .select('*')
          .neq('id', currentUserId);
          
        if (refetchError) {
          throw refetchError;
        }
        
        setUsers(newData || []);
      } else {
        // Don't filter out users, show all of them
        setUsers(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error.message);
      toast({
        title: "Failed to load users",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch of users
  useEffect(() => {
    fetchUsers();
  }, [navigate]);
  
  // Set up realtime subscription for user updates
  useEffect(() => {
    // Subscribe to changes in the users table
    const channel = supabase
      .channel('user_status_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'users'
        }, 
        (payload) => {
          console.log('User status changed:', payload);
          // Refresh the user list
          fetchUsers();
        }
      )
      .subscribe();
    
    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const handleStartChat = async (userId: string) => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      
      const currentUserId = session.user.id;
      
      // First check if a conversation already exists between these users
      const { data: existingConversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .single();
      
      if (convError && convError.code !== 'PGRST116') { // PGRST116 = not found
        throw convError;
      }
      
      if (existingConversation) {
        // If conversation exists, navigate to it
        navigate(`/chat/${existingConversation.id}`);
        return;
      }
      
      // Create a new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          user1_id: currentUserId,
          user2_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (createError) {
        throw createError;
      }
      
      // Navigate to the new conversation
      navigate(`/chat/${newConversation.id}`);
      
    } catch (error: any) {
      console.error('Error starting chat:', error);
      toast({
        title: "Couldn't start conversation",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    }
  };
  
  // Get language name from code
  const getLanguageName = (code: string | null | undefined): string => {
    // Handle undefined or null values
    if (!code) {
      return 'Unknown';
    }
    
    // If code is already a full language name, return it
    if (LANGUAGES_FILTER.includes(code)) {
      return code;
    }
    
    // Otherwise, try to find the language by id
    const language = LANGUAGES.find(lang => lang.id === code);
    return language ? language.name : code;
  };
  
  const filteredUsers = users.filter(user => {
    // Ensure user has basic required fields
    if (!user || !user.id) {
      console.log('Skipping invalid user:', user);
      return false;
    }
    
    // Search filter - case insensitive (only if username exists)
    if (searchTerm && user.username && !user.username.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Native language filter (only if native_language exists)
    if (nativeLanguageFilter !== 'Any Language' && user.native_language) {
      const nativeLanguageName = getLanguageName(user.native_language);
      if (nativeLanguageName !== nativeLanguageFilter) {
        return false;
      }
    }
    
    // Learning language filter (only if learning_language exists)
    if (learningLanguageFilter !== 'Any Language' && user.learning_language) {
      const learningLanguageName = getLanguageName(user.learning_language);
      if (learningLanguageName !== learningLanguageFilter) {
        return false;
      }
    }
    
    // Online only filter - apply only if the checkbox is checked
    if (onlineOnly && user.is_online === false) {
      return false;
    }
    
    return true;
  });
  
  console.log('Filtered users count:', filteredUsers.length);
  
  console.log('Filtered users count:', filteredUsers.length);
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Language Partners</h1>
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          icon={<Filter className="h-4 w-4" />}
        >
          Filters
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search by name..."
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-card p-4 rounded-lg shadow-sm mb-6 border">
          <h2 className="font-medium mb-3">Filter Language Partners</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">Native Language</label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={nativeLanguageFilter}
                onChange={(e) => setNativeLanguageFilter(e.target.value)}
              >
                {LANGUAGES_FILTER.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Learning</label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={learningLanguageFilter}
                onChange={(e) => setLearningLanguageFilter(e.target.value)}
              >
                {LANGUAGES_FILTER.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={onlineOnly}
                  onChange={() => setOnlineOnly(!onlineOnly)}
                />
                <div className="relative w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="ms-3 text-sm font-medium">Online only</span>
              </label>
            </div>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading users...</p>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map(user => (
            <div key={user.id} className="border rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <img 
                      src={user.profile_picture ? user.profile_picture : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}&background=random`} 
                      alt={user.username || 'User'}
                      className="w-12 h-12 rounded-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}&background=random`;
                      }}
                    />
                    {user.is_online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{user.username || 'No Username'}</h3>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <span className={user.is_online ? 'text-green-500' : 'text-muted-foreground'}>
                        {user.is_online ? 'Online now' : (user.last_active ? `Last active ${new Date(user.last_active).toLocaleDateString()}` : 'Status unknown')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm mb-4">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-muted-foreground">Native:</span>
                    <span className="font-medium ml-auto">{user.native_language ? getLanguageName(user.native_language) : 'Not specified'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Languages className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-muted-foreground">Learning:</span>
                    <span className="font-medium ml-auto">
                      {user.learning_language ? getLanguageName(user.learning_language) : 'Not specified'} {user.proficiency ? `(${user.proficiency})` : ''}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm mb-4 line-clamp-2 text-muted-foreground">{user.bio || "No bio available"}</p>
                
                <Button 
                  onClick={() => handleStartChat(user.id)}
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
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No partners found</h3>
          <p className="text-muted-foreground text-center mb-4">
            Try adjusting your filters or search criteria
          </p>
          <Button 
            onClick={() => {
              setSearchTerm('');
              setNativeLanguageFilter('Any Language');
              setLearningLanguageFilter('Any Language');
              setOnlineOnly(false);
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Community;
