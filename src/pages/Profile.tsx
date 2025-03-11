import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/lib/supabaseClient";  
import Button from '@/components/Button';
import { toast } from '@/hooks/use-toast';
import UserProfileCard from '@/components/UserProfileCard';

const Profile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
          id, username, email, native_language, learning_language, proficiency, bio, avatar, last_active, is_online
        `)
        .eq('id', userSession.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        
        // Check if the error is because the record doesn't exist
        if (error.code === 'PGRST116') {
          // Record not found - redirect to onboarding
          toast({
            title: "Profile not found",
            description: "Please complete your profile setup.",
          });
          navigate('/onboarding');
          return;
        }
        
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
          avatar: userData.avatar || 'https://ui-avatars.com/api/?name=User',
          location: userData.location || 'Not specified',
          bio: userData.bio || "No bio available",
          nativeLanguage: userData.native_language,
          learningLanguages: [{ language: userData.learning_language, proficiency: userData.proficiency }],
          online: userData.is_online || false
        }}
      />

      {/* Profile Details */}
      <p><strong>Email:</strong> {userData.email}</p>
      <p><strong>Native Language:</strong> {userData.native_language}</p>
      <p><strong>Learning Language:</strong> {userData.learning_language} ({userData.proficiency})</p>
      <p><strong>Bio:</strong> {userData.bio || "Not provided"}</p>
      <p><strong>Last Active:</strong> {new Date(userData.last_active).toLocaleString()}</p>
    </div>
  );
};

export default Profile;
