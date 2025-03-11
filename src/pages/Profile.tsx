import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import Button from '@/components/Button';
import UserProfileCard from '@/components/UserProfileCard';
import ProfileEdit from '@/components/ProfileEdit';
import { uploadProfilePicture } from '@/utils/supabaseStorage';
import { Edit, Save, X } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Fetch user profile data
  useEffect(() => {
    const getProfile = async () => {
      try {
        if (!user) {
          navigate('/');
          return;
        }

        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setProfile(data);
          if (data.profile_picture) {
            setAvatarUrl(data.profile_picture);
          }
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error.message);
        toast({
          title: 'Error fetching profile',
          description: error.message || 'Please try again',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [user, navigate]);

  const handleSaveProfile = async (updatedProfile: any, newProfilePicture?: File) => {
    setLoading(true);

    try {
      let profilePictureUrl = profile.profile_picture;

      // Upload new profile picture if provided
      if (newProfilePicture) {
        profilePictureUrl = await uploadProfilePicture(user!.id, newProfilePicture);
      }

      // Update the user profile in the database
      const { error } = await supabase
        .from('users')
        .update({ 
          ...updatedProfile,
          profile_picture: profilePictureUrl,
          last_active: new Date().toISOString()
        })
        .eq('id', user!.id);

      if (error) throw error;

      // Update local state
      setProfile({
        ...profile,
        ...updatedProfile,
        profile_picture: profilePictureUrl
      });

      setAvatarUrl(profilePictureUrl);
      setIsEditing(false);

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      toast({
        title: 'Error updating profile',
        description: error.message || 'Could not update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Format learning languages for profile card
  const learningLanguages = profile.learning_language
    ? [{ language: profile.learning_language, proficiency: profile.proficiency || 'Beginner' }]
    : [];

  if (loading && !profile.id) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-bold mb-2">Loading profile...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-bold mb-2">Please sign in</h2>
        <p className="mb-6">You need to be logged in to view your profile.</p>
        <Button onClick={() => navigate('/')}>Go to Login</Button>
      </div>
    );
  }

  if (!profile || !profile.id) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
        <p className="mb-6">Could not load profile information.</p>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  // Prepare user data for profile card
  const userData = {
    id: user?.id || '',
    name: profile.username || 'Anonymous User',
    avatar: avatarUrl || undefined,
    location: profile.location,
    bio: profile.bio,
    nativeLanguage: profile.native_language,
    learningLanguages: learningLanguages,
    learningGoals: profile.learning_goals,
    online: true,
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <Edit size={16} />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => setIsEditing(false)} variant="outline" className="flex items-center gap-2">
              <X size={16} />
              Cancel
            </Button>
            <Button onClick={() => {}} variant="ghost" className="flex items-center gap-2">
              <Save size={16} />
              Save Profile
            </Button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <UserProfileCard user={userData} />
      ) : (
        <div className="border rounded-lg p-6 space-y-6">
          <ProfileEdit 
            userProfile={profile}
            onCancel={() => setIsEditing(false)}
            onSave={handleSaveProfile}
          />
        </div>
      )}
    </div>
  );
};

export default Profile;