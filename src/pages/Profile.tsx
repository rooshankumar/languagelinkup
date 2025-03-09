
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import { toast } from '@/hooks/use-toast';
import { User, Languages, Camera, Pencil, Save, MapPin, LogOut, Target } from 'lucide-react';
import UserProfileCard from '@/components/UserProfileCard';

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Fluent'] as const;

type ProficiencyLevel = typeof PROFICIENCY_LEVELS[number];

interface LearningLanguage {
  language: string;
  proficiency: ProficiencyLevel;
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Mock user data - will be fetched from your backend later
  const [userData, setUserData] = useState({
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=random',
    location: 'New York, USA',
    nativeLanguage: 'English',
    learningLanguages: [
      { language: 'Spanish', proficiency: 'Intermediate' as ProficiencyLevel },
      { language: 'French', proficiency: 'Beginner' as ProficiencyLevel }
    ],
    learningGoals: 'I want to improve my conversation skills for my upcoming trip to Spain and France.',
    bio: 'Software developer interested in learning languages for travel and connecting with people around the world.',
    interests: ['Technology', 'Travel', 'Cooking', 'Music']
  });
  
  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    try {
      // This will connect to your MongoDB backend later
      console.log('Saving profile data:', userData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePhotoChange = () => {
    // This will connect to your Cloudinary upload later
    console.log('Changing profile photo');
    
    // For now just show toast
    toast({
      title: "Feature coming soon",
      description: "Profile photo upload will be available soon",
    });
  };

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      // This will connect to your backend logout endpoint later
      console.log('Logging out');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      
      // Navigate to auth page
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addLearningLanguage = () => {
    setUserData({
      ...userData,
      learningLanguages: [
        ...userData.learningLanguages,
        { language: '', proficiency: 'Beginner' }
      ]
    });
  };

  const removeLearningLanguage = (index: number) => {
    const updatedLanguages = [...userData.learningLanguages];
    updatedLanguages.splice(index, 1);
    setUserData({
      ...userData,
      learningLanguages: updatedLanguages
    });
  };

  const updateLearningLanguage = (index: number, field: 'language' | 'proficiency', value: string) => {
    const updatedLanguages = [...userData.learningLanguages];
    updatedLanguages[index] = {
      ...updatedLanguages[index],
      [field]: value
    } as LearningLanguage;
    
    setUserData({
      ...userData,
      learningLanguages: updatedLanguages
    });
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <div className="flex gap-2">
          <Button 
            variant={isEditing ? "primary" : "outline"}
            onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            icon={isEditing ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            isLoading={isLoading && isEditing}
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            icon={<LogOut className="h-4 w-4" />}
            isLoading={isLoading && !isEditing}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Preview Card */}
      {!isEditing && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Profile Preview</h2>
          <UserProfileCard 
            user={{
              id: userData.id,
              name: userData.name,
              avatar: userData.avatar,
              location: userData.location,
              bio: userData.bio,
              nativeLanguage: userData.nativeLanguage,
              learningLanguages: userData.learningLanguages,
              learningGoals: userData.learningGoals,
              online: true
            }}
          />
        </div>
      )}
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left column - Avatar and basic info */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">
              {userData.avatar ? (
                <img 
                  src={userData.avatar} 
                  alt={userData.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <User className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            
            {isEditing && (
              <button 
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full shadow-lg"
                onClick={handlePhotoChange}
              >
                <Camera className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <h2 className="text-xl font-bold mb-1">{userData.name}</h2>
          <p className="text-muted-foreground mb-4">{userData.email}</p>
          
          <div className="w-full space-y-3 mt-4">
            <div className="flex items-center p-3 bg-muted/50 rounded-lg">
              <Languages className="text-primary mr-3 h-5 w-5" />
              <div>
                <p className="text-sm text-muted-foreground">Native Language</p>
                <p className="font-medium">{userData.nativeLanguage}</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-muted/50 rounded-lg">
              <MapPin className="text-primary mr-3 h-5 w-5" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{userData.location || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Editable info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            {isEditing ? (
              <input 
                type="text" 
                value={userData.name}
                onChange={(e) => setUserData({...userData, name: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            ) : (
              <p className="p-2 border rounded-md bg-muted/30">{userData.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <p className="p-2 border rounded-md bg-muted/30">{userData.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            {isEditing ? (
              <input 
                type="text" 
                value={userData.location || ''}
                onChange={(e) => setUserData({...userData, location: e.target.value})}
                className="w-full p-2 border rounded-md"
                placeholder="City, Country"
              />
            ) : (
              <p className="p-2 border rounded-md bg-muted/30">{userData.location || 'Not specified'}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            {isEditing ? (
              <textarea
                value={userData.bio || ''}
                onChange={(e) => setUserData({...userData, bio: e.target.value})}
                className="w-full p-2 border rounded-md h-32"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="p-2 border rounded-md bg-muted/30 min-h-20">{userData.bio || 'No bio provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Native Language</label>
            {isEditing ? (
              <input 
                type="text" 
                value={userData.nativeLanguage}
                onChange={(e) => setUserData({...userData, nativeLanguage: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            ) : (
              <p className="p-2 border rounded-md bg-muted/30">{userData.nativeLanguage}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Learning Languages</label>
              {isEditing && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addLearningLanguage}
                >
                  Add Language
                </Button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                {userData.learningLanguages.map((lang, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={lang.language}
                      onChange={(e) => updateLearningLanguage(index, 'language', e.target.value)}
                      className="flex-1 p-2 border rounded-md"
                      placeholder="Language"
                    />
                    <select
                      value={lang.proficiency}
                      onChange={(e) => updateLearningLanguage(index, 'proficiency', e.target.value as ProficiencyLevel)}
                      className="p-2 border rounded-md"
                    >
                      {PROFICIENCY_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeLearningLanguage(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {userData.learningLanguages.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No languages added. Click "Add Language" to start.</p>
                )}
              </div>
            ) : (
              <div className="p-2 border rounded-md bg-muted/30">
                {userData.learningLanguages.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {userData.learningLanguages.map((lang, index) => (
                      <li key={index}>{lang.language} ({lang.proficiency})</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No languages specified</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Learning Goals</label>
            {isEditing ? (
              <textarea
                value={userData.learningGoals || ''}
                onChange={(e) => setUserData({...userData, learningGoals: e.target.value})}
                className="w-full p-2 border rounded-md h-24"
                placeholder="What are your language learning goals?"
              />
            ) : (
              <p className="p-2 border rounded-md bg-muted/30 min-h-20">{userData.learningGoals || 'No learning goals provided'}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Interests</label>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {userData.interests.map((interest, index) => (
                  <div key={index} className="flex items-center bg-muted/50 rounded-full px-3 py-1">
                    <span>{interest}</span>
                    <button 
                      className="ml-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setUserData({
                        ...userData, 
                        interests: userData.interests.filter((_, i) => i !== index)
                      })}
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                <input 
                  type="text"
                  placeholder="Add interest..."
                  className="border rounded-full px-3 py-1 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      setUserData({
                        ...userData,
                        interests: [...userData.interests, e.currentTarget.value]
                      });
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {userData.interests.map((interest, index) => (
                  <span key={index} className="bg-muted/50 rounded-full px-3 py-1">
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
