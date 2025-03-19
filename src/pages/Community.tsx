import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import UserProfileCard from '@/components/UserProfileCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { chatService } from '@/services/chatService';

interface UserData {
  id: string;
  username: string;
  profile_picture: string | null;
  dob: string | null;
  native_language: string;
  learning_language: string;
  proficiency: string;
  bio: string | null;
  last_active: string;
  is_online: boolean;
}

// Function to calculate age from DOB
const calculateAge = (dob: string | null): number | null => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
};

// Convert database user to UI format
const mapDatabaseUserToUIUser = (user: UserData) => ({
  id: user.id,
  name: user.username || "Unknown User",
  avatar: user.profile_picture && user.profile_picture.startsWith("http")
    ? user.profile_picture
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || "User")}&background=random`,
  bio: user.bio || "No bio available.",
  nativeLanguage: user.native_language || "Unknown",
  learningLanguages: [{ language: user.learning_language || "Unknown", proficiency: user.proficiency || "Unknown" }],
  online: user.is_online,
  age: calculateAge(user.dob),
});

const Community = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState({ ageRange: "", onlineOnly: false });

  useEffect(() => {
    async function fetchUsers() {
      try {
        console.log('Fetching users from database...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          return;
        }

        const currentUserId = sessionData?.session?.user?.id;
        console.log("Current User ID:", currentUserId);
        if (!currentUserId) return;

        let query = supabase
          .from('users')
          .select('id, username, profile_picture, dob, is_online, last_active, native_language, learning_language, proficiency, bio')
          .neq('id', currentUserId)
          .order('last_active', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;

        setUsers(data || []);
      } catch (err: any) {
        setError(err);
        toast({
          title: 'Error',
          description: 'Failed to fetch community members.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const age = calculateAge(user.dob);
    return (
      (!filters.onlineOnly || user.is_online) &&
      (!filters.ageRange ||
        (filters.ageRange === "18-25" && age && age >= 18 && age <= 25) ||
        (filters.ageRange === "26-35" && age && age >= 26 && age <= 35) ||
        (filters.ageRange === "36+" && age && age >= 36))
    );
  });

  const handleChatClick = async (partnerId: string) => {
    const { data: session } = await supabase.auth.getSession();
    const currentUserId = session?.session?.user?.id;

    if (!currentUserId || !partnerId) {
      console.error("❌ Invalid user or partner ID:", { currentUserId, partnerId });
      return;
    }

    const chatId = await chatService.createChat(currentUserId, partnerId);
    if (chatId) {
      navigate(`/chat/${chatId}`);
    } else {
      toast({
        title: "Chat Error",
        description: "Could not start a chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Language Community</h1>
        <Button variant="outline" size="sm" onClick={() => setFiltersVisible(!filtersVisible)}>
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {loading && <p>Loading community members...</p>}
      {error && <p className="text-red-500">Error fetching community members.</p>}
      {filteredUsers.length === 0 && !loading && <p>No community members found.</p>}

      {filteredUsers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map(user => (
            <div key={user.id} className="flex flex-col h-full">
              <UserProfileCard user={mapDatabaseUserToUIUser(user)} compact={false} onClick={() => {}} />
              <div className="p-3 border-t">
                <Button onClick={() => handleChatClick(user.id)} className="w-full" size="sm">
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
