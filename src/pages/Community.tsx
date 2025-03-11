
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
  useEffect(() => {
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
        
        // Fetch all users except the current user
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .neq('id', currentUserId);
        
        if (error) {
          throw error;
        }
        
        setUsers(data || []);
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
    
    fetchUsers();
  }, [navigate]);
  
  const handleStartChat = (userId: string) => {
    // In a real app, this would create a chat or navigate to an existing one
    console.log('Starting chat with user ID:', userId);
    
    // Navigate to the chat route
    navigate(`/chat/${userId}`);
  };
  
  // Get language name from code
  const getLanguageName = (code: string): string => {
    const language = LANGUAGES.find(lang => lang.id === code);
    return language ? language.name : code;
  };
  
  const filteredUsers = users.filter(user => {
    // Search filter
    if (searchTerm && !user.username.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Native language filter
    if (nativeLanguageFilter !== 'Any Language') {
      const nativeLanguageName = getLanguageName(user.native_language);
      if (nativeLanguageName !== nativeLanguageFilter) {
        return false;
      }
    }
    
    // Learning language filter
    if (learningLanguageFilter !== 'Any Language') {
      const learningLanguageName = getLanguageName(user.learning_language);
      if (learningLanguageName !== learningLanguageFilter) {
        return false;
      }
    }
    
    // Online only filter
    if (onlineOnly && !user.is_online) {
      return false;
    }
    
    return true;
  });
  
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
                      src={user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`} 
                      alt={user.username}
                      className="w-12 h-12 rounded-full" 
                    />
                    {user.is_online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{user.username}</h3>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <span className={user.is_online ? 'text-green-500' : 'text-muted-foreground'}>
                        {user.is_online ? 'Online now' : `Last active ${new Date(user.last_active).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm mb-4">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-muted-foreground">Native:</span>
                    <span className="font-medium ml-auto">{getLanguageName(user.native_language)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Languages className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-muted-foreground">Learning:</span>
                    <span className="font-medium ml-auto">
                      {getLanguageName(user.learning_language)} ({user.proficiency})
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
