
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/lib/supabaseClient";  
import Button from '@/components/Button';
import { toast } from '@/hooks/use-toast';
import UserProfileCard from '@/components/UserProfileCard';
import { LANGUAGES } from '@/pages/Onboarding';
import { useUserProfile } from '@/hooks/useUserProfile';

interface UserData {
  id: string;
  username: string;
  email: string;
  native_language: string;
  learning_language: string;
  proficiency: string;
  bio: string | null;
  avatar: string | null;
  last_active: string;
  is_online: boolean;
  dob: string | null;
  profile_picture: string | null;
  location?: string;
}

const Profile = () => {
  const { user: userData, loading: isLoading, updateUserProfile, fetchUserProfile } = useUserProfile();
  const [editedUserData, setEditedUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  // Set up edited user data when userData changes
  React.useEffect(() => {
    if (userData) {
      setEditedUserData(userData);
    }
  }, [userData]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editedUserData) {
      setEditedUserData({
        ...editedUserData,
        [name]: value
      });
    }
  };

  // Save changes to database
  const saveChanges = async () => {
    if (!editedUserData) return;
    
    setIsSaving(true);
    
    // Update using the context
    const success = await updateUserProfile({
      username: editedUserData.username,
      bio: editedUserData.bio,
      native_language: editedUserData.native_language,
      learning_language: editedUserData.learning_language,
      proficiency: editedUserData.proficiency,
      location: editedUserData.location
    });
    
    if (success) {
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Refresh data to reflect changes throughout the app
      fetchUserProfile();
    }
    
    setIsSaving(false);
  };

  // Cancel editing
  const cancelEditing = () => {
    if (userData) {
      setEditedUserData(userData);
    }
    setIsEditing(false);
  };

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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Profile Details</h2>
          {!isEditing && (
            <Button 
              onClick={() => setIsEditing(true)} 
              variant="outline"
            >
              Edit Profile
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Full Name</label>
                <input
                  type="text"
                  name="username"
                  value={editedUserData?.username || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Email</label>
                <input
                  type="text"
                  value={editedUserData?.email || ""}
                  disabled
                  className="w-full p-2 border rounded-md bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={editedUserData?.location || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Native Language</label>
                <select
                  name="native_language"
                  value={editedUserData?.native_language || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Learning Language</label>
                <select
                  name="learning_language"
                  value={editedUserData?.learning_language || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Proficiency</label>
                <select
                  name="proficiency"
                  value={editedUserData?.proficiency || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Fluent">Fluent</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Bio</label>
              <textarea
                name="bio"
                value={editedUserData?.bio || ""}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button 
                onClick={saveChanges} 
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                onClick={cancelEditing} 
                variant="outline"
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{userData.username || "Not specified"}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{userData.email}</p>
              </div>
              
              {userData.location && (
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{userData.location}</p>
                </div>
              )}
              
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
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
