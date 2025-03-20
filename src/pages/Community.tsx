import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import UserProfileCard from '@/components/UserProfileCard';
import { MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; 
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

const calculateAge = (dob: string | null): number | null => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
};

const mapDatabaseUserToUIUser = (user: UserData) => {
  let proficiency: "Beginner" | "Intermediate" | "Advanced" | "Fluent" = "Beginner";

  if (user.proficiency === "Intermediate" ||
      user.proficiency === "Advanced" ||
      user.proficiency === "Fluent") {
    proficiency = user.proficiency;
  }

  const avatarUrl = user.profile_picture
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${user.profile_picture}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || "User")}&background=random`;

  return {
    id: user.id,
    name: user.username || "Unknown User",
    avatar: avatarUrl,
    bio: user.bio || "No bio available.",
    nativeLanguage: user.native_language || "Unknown",
    learningLanguages: [{
      language: user.learning_language || "Unknown",
      proficiency: proficiency
    }],
    online: user.is_online,
    learningGoals: "Become fluent in conversation"
  };
};

const Community = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);

  const handleLike = async () => {
    try {
      setLoadingLike(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id || !userId) return;

      const { error } = await supabase
        .from('user_likes')
        .insert([
          { user_id: session.session.user.id, liked_user_id: userId }
        ]);

      if (error) throw error;
      setHasLiked(true);
      setLikesCount(prev => prev + 1);
    } catch (error) {
      console.error('Error liking profile:', error);
    } finally {
      setLoadingLike(false);
    }
  };

  useEffect(() => {
    const fetchLikes = async () => {
      if (!userId) return;
      
      const { data: session } = await supabase.auth.getSession();
      const currentUserId = session?.session?.user?.id;

      // Get total likes
      const { count } = await supabase
        .from('user_likes')
        .select('*', { count: 'exact' })
        .eq('liked_user_id', userId);

      setLikesCount(count || 0);

      // Check if current user has liked
      if (currentUserId) {
        const { data } = await supabase
          .from('user_likes')
          .select('*')
          .eq('user_id', currentUserId)
          .eq('liked_user_id', userId)
          .single();

        setHasLiked(!!data);
      }
    };

    fetchLikes();
  }, [userId]);
  const [error, setError] = useState<Error | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState({ ageRange: "", onlineOnly: false });
  const toast = useToast(); 

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          return;
        }

        const currentUserId = sessionData?.session?.user?.id;
        if (!currentUserId) return;

        let query = supabase
          .from('users')
          .select(`
            id,
            username,
            email,
            native_language,
            learning_language,
            proficiency,
            bio,
            location,
            avatar_url,
            profile_picture,
            is_online,
            last_active,
            dob
          `)
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

    if (!userId) {
        fetchUsers();
    }
  }, [userId, toast]); 


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

    const chat = await chatService.findOrCreateChat(partnerId);
    if (chat?.id) {
      navigate(`/chat/${chat.id}`);
    } else {
      toast({
        title: "Chat Error",
        description: "Could not start a chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const [userprofile, setUserprofile] = useState<UserData | null>(null);
  const [loadingprofile, setLoadingprofile] = useState(true);
  const [errorprofile, setErrorprofile] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (userId) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

          if (error) throw error;
          if (!data) throw new Error('User not found');

          setUserprofile(data);
        }
      } catch (err: any) {
        setErrorprofile(err.message);
      } finally {
        setLoadingprofile(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (userId && loadingprofile) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  if (userId && (errorprofile || !userprofile)) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
        <p className="mb-4 text-muted-foreground">This user profile does not exist or has been removed.</p>
        <Button onClick={() => navigate('/community/list')}>
          Return to Community List
        </Button>
      </div>
    );
  }


  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      {userId ? (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/community/list')}
            className="mb-6"
          >
            ← Back to List
          </Button>

          <div className="profile-container">
            <picture>
              <source
                srcSet={userprofile?.profile_picture || userprofile?.avatar_url}
                type="image/webp"
              />
              <img 
                src={userprofile?.profile_picture || userprofile?.avatar_url || "/placeholder.svg"} 
                alt="Profile Avatar" 
                className="profile-avatar"
                loading="eager"
              />
            </picture>
            <h2 className="text-2xl font-bold mt-4">{userprofile?.username}</h2>
            <p className="text-muted-foreground mt-2">{userprofile?.bio}</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">
                {likesCount} {likesCount === 1 ? 'like' : 'likes'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLike}
                disabled={hasLiked || loadingLike}
                className="gap-2"
              >
                {hasLiked ? "❤️ Liked" : "🤍 Like"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <p className="font-semibold">Native Language</p>
                <p>{userprofile?.native_language}</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">Learning</p>
                <p>{userprofile?.learning_language}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={() => navigate(`/chat/${userprofile?.id}`)}
              className="w-full"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Start Conversation
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Language Community</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/community/list')}>
                View List
              </Button>
              {/* <Button variant="outline" size="sm" onClick={() => setFiltersVisible(!filtersVisible)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button> */}
            </div>
          </div>

          {loading && <p>Loading community members...</p>}
          {error && <p className="text-red-500">Error fetching community members.</p>}
          {filteredUsers.length === 0 && !loading && <p>No community members found.</p>}

          {filteredUsers.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map(user => (
                <div key={user.id} className="flex flex-col h-full">
                  <UserProfileCard user={mapDatabaseUserToUIUser(user)} compact={false} onClick={() => navigate(`/community/${user.id}`)} />
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
        </>
      )}
    </div>
  );
};

export default Community;