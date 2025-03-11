import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import Button from '@/components/Button';
import UserProfileCard from '@/components/UserProfileCard';
import ProfileEdit from '@/components/ProfileEdit';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        // Format the data for the UserProfileCard component
        const formattedProfile = {
          id: data.id,
          name: data.username || 'User',
          avatar: data.profile_picture,
          location: data.location,
          bio: data.bio,
          nativeLanguage: data.native_language,
          learningLanguages: [
            {
              language: data.learning_language,
              proficiency: data.proficiency || 'Beginner'
            }
          ],
          learningGoals: data.learning_goals,
          online: data.is_online
        };
        setUserProfile(formattedProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error fetching profile",
        description: "We couldn't load your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (updatedProfile) => {
    try {
      // Transform from UI format to database format
      const dbProfileData = {
        username: updatedProfile.username,
        bio: updatedProfile.bio,
        location: updatedProfile.location,
        native_language: updatedProfile.native_language,
        learning_language: updatedProfile.learning_language,
        proficiency: updatedProfile.proficiency,
        last_active: updatedProfile.last_active
      };

      // Update profile in database
      const { error } = await supabase
        .from('users')
        .update(dbProfileData)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });

      // Refresh user profile data
      fetchUserProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "We couldn't update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      {isEditing ? (
        <ProfileEdit 
          userProfile={userProfile} 
          onCancel={() => setIsEditing(false)} 
          onSave={handleSaveProfile}
        />
      ) : (
        userProfile && <UserProfileCard user={userProfile} />
      )}
    </div>
  );
};

export default Profile;