
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import Button from '@/components/Button';
import UserProfileCard from '@/components/UserProfileCard';
import { Edit, Save, X } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Editable profile fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [learningLanguages, setLearningLanguages] = useState<Array<{language: string, proficiency: string}>>([]);
  const [learningGoals, setLearningGoals] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setProfile(data);
          setName(data.username || '');
          setBio(data.bio || '');
          setLocation(data.location || '');
          setNativeLanguage(data.native_language || '');
          setLearningGoals(data.learning_goals || '');
          
          // Convert learning languages from DB format to component format
          if (data.learning_languages) {
            try {
              const parsedLanguages = Array.isArray(data.learning_languages) 
                ? data.learning_languages 
                : JSON.parse(data.learning_languages);
              
              setLearningLanguages(parsedLanguages);
            } catch (e) {
              console.error('Error parsing learning languages:', e);
              setLearningLanguages([{ language: data.learning_language || '', proficiency: data.proficiency || 'Beginner' }]);
            }
          } else {
            setLearningLanguages([{ language: data.learning_language || '', proficiency: data.proficiency || 'Beginner' }]);
          }
          
          // Get avatar URL if profile_picture exists
          if (data.profile_picture) {
            const { data: storageData } = supabase.storage
              .from('avatars')
              .getPublicUrl(data.profile_picture);
              
            if (storageData) {
              setAvatarUrl(storageData.publicUrl);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error fetching profile',
          description: 'Could not load your profile information.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user, navigate]);
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Avatar must be smaller than 2MB',
          variant: 'destructive',
        });
        return;
      }
      
      setAvatar(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAddLanguage = () => {
    setLearningLanguages([...learningLanguages, { language: '', proficiency: 'Beginner' }]);
  };
  
  const handleRemoveLanguage = (index: number) => {
    const updatedLanguages = [...learningLanguages];
    updatedLanguages.splice(index, 1);
    setLearningLanguages(updatedLanguages);
  };
  
  const handleLanguageChange = (index: number, field: 'language' | 'proficiency', value: string) => {
    const updatedLanguages = [...learningLanguages];
    updatedLanguages[index][field] = value;
    setLearningLanguages(updatedLanguages);
  };
  
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Upload avatar if changed
      let avatarPath = profile?.profile_picture;
      if (avatar) {
        const fileExt = avatar.name.split('.').pop();
        const filePath = `${user!.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatar);
          
        if (uploadError) throw uploadError;
        
        avatarPath = filePath;
      }
      
      // Update user profile in database
      const { error } = await supabase
        .from('users')
        .update({
          username: name,
          bio,
          location,
          native_language: nativeLanguage,
          learning_language: learningLanguages[0]?.language || null,
          proficiency: learningLanguages[0]?.proficiency || 'Beginner',
          learning_languages: JSON.stringify(learningLanguages),
          learning_goals: learningGoals,
          profile_picture: avatarPath,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id);
        
      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error updating profile',
        description: 'Could not update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !profile) {
    return <div className="flex justify-center items-center h-[80vh]">Loading profile...</div>;
  }
  
  if (!profile) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
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
            <Button onClick={handleSaveProfile} isLoading={loading} className="flex items-center gap-2">
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
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Display Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="City, Country"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label htmlFor="bio" className="block text-sm font-medium mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="A little about yourself..."
              />
            </div>
            
            <div className="mt-4">
              <label htmlFor="avatar" className="block text-sm font-medium mb-1">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum file size: 2MB. Recommended size: 300x300px.
              </p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Language Profile</h2>
            <div className="mb-4">
              <label htmlFor="nativeLanguage" className="block text-sm font-medium mb-1">
                Native Language
              </label>
              <input
                id="nativeLanguage"
                type="text"
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Your native language"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Languages I'm Learning</label>
                <Button
                  onClick={handleAddLanguage}
                  size="sm"
                  variant="outline"
                  type="button"
                >
                  Add Language
                </Button>
              </div>
              
              {learningLanguages.map((lang, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-8 gap-2 mb-3 items-center">
                  <div className="md:col-span-4">
                    <input
                      type="text"
                      value={lang.language}
                      onChange={(e) => handleLanguageChange(index, 'language', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="Language"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <select
                      value={lang.proficiency}
                      onChange={(e) => handleLanguageChange(index, 'proficiency', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Fluent">Fluent</option>
                    </select>
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    {learningLanguages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <label htmlFor="learningGoals" className="block text-sm font-medium mb-1">
                Learning Goals
              </label>
              <textarea
                id="learningGoals"
                value={learningGoals}
                onChange={(e) => setLearningGoals(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="What are you hoping to achieve?"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
