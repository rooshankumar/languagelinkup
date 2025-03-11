import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import UserProfileCard from '@/components/UserProfileCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  const [filters, setFilters] = useState({
    ageRange: "",
    onlineOnly: false,
  });

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

        if (!currentUserId) {
          console.warn('No current user ID found.');
          return;
        }

        let query = supabase
          .from('users')
          .select('id, username, profile_picture, dob, is_online, last_active, native_language, learning_language, proficiency, bio')
          .neq('id', currentUserId)
          .order('last_active', { ascending: false });

        const { data, error } = await query;
        if (error) {
          console.error("Error fetching users from database:", error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.warn("⚠ No other users found in the database.");
        }

        console.log("Fetched Users:", JSON.stringify(data, null, 2));
        setUsers(data || []);
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

  // Apply filters dynamically
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

  const handleChatClick = (userId: string) => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Language Community</h1>

        {/* Filter Toggle Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setFiltersVisible(!filtersVisible)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filter Section (Hidden until button clicked) */}
      {filtersVisible && (
        <div className="bg-gray-100 p-4 rounded mb-6 shadow-md">
          <h2 className="text-lg font-semibold mb-2">Filter Options</h2>
          <div className="flex gap-4">
            <select
              value={filters.ageRange}
              onChange={(e) => setFilters({ ...filters, ageRange: e.target.value })}
              className="border p-2 rounded w-full md:w-auto"
            >
              <option value="">Age Range</option>
              <option value="18-25">18-25</option>
              <option value="26-35">26-35</option>
              <option value="36+">36+</option>
            </select>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.onlineOnly}
                onChange={(e) => setFilters({ ...filters, onlineOnly: e.target.checked })}
              />
              <span>Online Only</span>
            </label>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-10">
          <p className="ml-3">Loading community members...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> Could not load community members</p>
          <p className="text-sm">Details: {error.message}</p>
        </div>
      )}

      {filteredUsers.length === 0 && !loading && !error && (
        <div className="text-center py-10">
          <p className="text-xl">No community members found.</p>
          <p className="text-muted-foreground mt-2">Check back soon as new members join!</p>
        </div>
      )}

      {filteredUsers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map(user => (
            <div key={user.id} className="flex flex-col h-full">
              <UserProfileCard user={mapDatabaseUserToUIUser(user)} compact={false} onClick={() => {}} />
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
