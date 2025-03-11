import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/lib/supabaseClient";  
import Button from '@/components/Button';
import { toast } from '@/hooks/use-toast';
import UserProfileCard from '@/components/UserProfileCard';
import { LANGUAGES } from '@/pages/Onboarding';

const Profile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Function to calculate age from date of birth
  const calculateAge = (dob: string | null): number | null => {
    if (!dob) return null;
    
    const birthDate = new Date(dob);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Function to get full language name from language code
  const getLanguageName = (code: string): string => {
    const language = LANGUAGES.find(lang => lang.id === code);
    return language ? language.name : code;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);

      // ✅ Get current user session
      const { data: userSession, error: sessionError } = await supabase.auth.getUser();
      if (sessionError || !userSession?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // ✅ Fetch user data from DB
      const { data, error } = await supabase
        .from('users')
        .select(`
          id, username, email, native_language, learning_language, proficiency, bio, avatar, 
          last_active, is_online, dob, profile_picture
        `)
        .eq('id', userSession.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        toast({
          title: "Error loading profile",
          description: "Could not fetch user data.",
          variant: "destructive",
        });
      } else {
        setUserData(data);
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, [navigate]);

  // ✅ Redirect user to onboarding if no profile data
  if (isLoading) return <p>Loading...</p>;
  if (!userData) {
    toast({
      title: "Complete your profile",
      description: "Redirecting to onboarding...",
    });
    navigate('/onboarding');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">My Profile</h1>

      {/* Profile Card */}
      <UserProfileCard 
        user={{
          id: userData.id,
          name: userData.username || "Anonymous",
          avatar: userData.profile_picture || userData.avatar || 'https://ui-avatars.com/api/?name=User',
          location: userData.location || 'Not specified',
          bio: userData.bio || "No bio available",
          nativeLanguage: getLanguageName(userData.native_language),
          learningLanguages: [{ 
            language: getLanguageName(userData.learning_language), 
            proficiency: userData.proficiency 
          }],
          online: userData.is_online || false
        }}
      />

      {/* Profile Details */}
      <div className="mt-8 bg-card p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-bold mb-4">Profile Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p className="font-medium">{userData.username || "Not specified"}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{userData.email}</p>
          </div>
          
          {userData.dob && (
            <div>
              <p className="text-sm text-muted-foreground">Age</p>
              <p className="font-medium">{calculateAge(userData.dob)} years</p>
            </div>
          )}
          
          <div>
            <p className="text-sm text-muted-foreground">Native Language</p>
            <p className="font-medium">{getLanguageName(userData.native_language)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Learning Language</p>
            <p className="font-medium">{getLanguageName(userData.learning_language)} ({userData.proficiency})</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Last Active</p>
            <p className="font-medium">{new Date(userData.last_active).toLocaleString()}</p>
          </div>
        </div>
        
        {userData.bio && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Bio</p>
            <p className="font-medium">{userData.bio}</p>
          </div>
        )}
        
        <div className="mt-6">
          <Button 
            onClick={() => navigate('/settings')} 
            variant="outline"
          >
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
