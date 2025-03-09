
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import { toast } from '@/hooks/use-toast';
import { User, Languages, Camera, Pencil, Save } from 'lucide-react';

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
    nativeLanguage: 'English',
    learningLanguage: 'Spanish',
    proficiency: 'Intermediate',
    bio: 'Software developer interested in learning Spanish for my upcoming trip to Mexico.',
    interests: ['Technology', 'Travel', 'Cooking', 'Music']
  });
  
  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    try {
      // This will connect to your backend later
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
    // This will connect to your file upload backend later
    console.log('Changing profile photo');
    
    // For now just show toast
    toast({
      title: "Feature coming soon",
      description: "Profile photo upload will be available soon",
    });
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button 
          variant={isEditing ? "primary" : "outline"}
          onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
          icon={isEditing ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          isLoading={isLoading}
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
        </Button>
      </div>
      
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
              <Languages className="text-primary mr-3 h-5 w-5" />
              <div>
                <p className="text-sm text-muted-foreground">Learning</p>
                <p className="font-medium">{userData.learningLanguage} ({userData.proficiency})</p>
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
            <label className="block text-sm font-medium mb-2">Bio</label>
            {isEditing ? (
              <textarea
                value={userData.bio}
                onChange={(e) => setUserData({...userData, bio: e.target.value})}
                className="w-full p-2 border rounded-md h-32"
              />
            ) : (
              <p className="p-2 border rounded-md bg-muted/30 min-h-20">{userData.bio}</p>
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
