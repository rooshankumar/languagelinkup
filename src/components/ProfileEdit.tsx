
import React, { useState, useRef, useEffect } from 'react';
import Button from '@/components/Button';
import { User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { uploadProfilePicture } from '@/utils/supabaseStorage';
import { v4 as uuidv4 } from 'uuid';

interface UserProfile {
  id: string;
  username: string;
  email?: string;
  native_language?: string;
  learning_language?: string;
  proficiency?: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
}

interface ProfileEditProps {
  userProfile: UserProfile | null;
  onCancel: () => void;
  onSave: (updatedProfile: UserProfile) => void;
}

const ProfileEdit = ({ userProfile, onCancel, onSave }: ProfileEditProps) => {
  const [name, setName] = useState(userProfile?.username || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [location, setLocation] = useState(userProfile?.location || '');
  const [nativeLanguage, setNativeLanguage] = useState(userProfile?.native_language || '');
  const [learningLanguage, setLearningLanguage] = useState(userProfile?.learning_language || '');
  const [proficiency, setProficiency] = useState(userProfile?.proficiency || 'Beginner');
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(userProfile?.avatar_url || null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Languages list for dropdown options
  const languages = [
    "English", "Spanish", "French", "German", "Italian", 
    "Portuguese", "Russian", "Japanese", "Korean", "Chinese", 
    "Arabic", "Hindi", "Turkish", "Dutch", "Polish", "Swedish"
  ];
  
  // Proficiency levels for dropdown selection
  const proficiencyLevels = [
    { id: 'beginner', name: 'Beginner', description: 'I know basic phrases and vocabulary' },
    { id: 'intermediate', name: 'Intermediate', description: 'I can have simple conversations' },
    { id: 'advanced', name: 'Advanced', description: 'I can express complex thoughts' },
    { id: 'native', name: 'Native/Fluent', description: 'I speak this language fluently' }
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }
      
      setProfilePicture(file);
      const objectUrl = URL.createObjectURL(file);
      setProfilePicturePreview(objectUrl);
      
      // Cleanup previous preview URL
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleSave = async () => {
    if (!userProfile?.id) {
      toast({
        title: "Error",
        description: "User profile not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let avatarUrl = userProfile.avatar_url;

      // Upload new profile picture if selected
      if (profilePicture) {
        const fileName = `${userProfile.id}/${uuidv4()}`;
        const { url, error: uploadError } = await uploadProfilePicture(profilePicture, fileName);
        
        if (uploadError) {
          throw new Error(`Error uploading profile picture: ${uploadError.message}`);
        }
        
        if (url) {
          avatarUrl = url;
        }
      }

      // Update user profile in the database
      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: name,
          bio,
          location,
          native_language: nativeLanguage,
          learning_language: learningLanguage,
          proficiency,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userProfile.id);

      if (updateError) {
        throw new Error(`Error updating profile: ${updateError.message}`);
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      // Call onSave with updated profile
      onSave({
        ...userProfile,
        username: name,
        bio,
        location,
        native_language: nativeLanguage,
        learning_language: learningLanguage,
        proficiency,
        avatar_url: avatarUrl,
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Edit Profile</h2>
      
      {/* Profile Picture */}
      <div className="flex flex-col items-center mb-6">
        <div 
          className="w-24 h-24 rounded-full mb-4 cursor-pointer relative overflow-hidden bg-muted"
          onClick={() => fileInputRef.current?.click()}
        >
          {profilePicturePreview ? (
            <img 
              src={profilePicturePreview} 
              alt="Profile preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-white text-xs font-medium">Change Photo</span>
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <button 
          className="text-sm text-primary hover:underline"
          onClick={() => fileInputRef.current?.click()}
        >
          Update profile picture
        </button>
      </div>
      
      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Display Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded-md border border-input bg-background"
            placeholder="Your name"
          />
        </div>
        
        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            id="bio"
            value={bio || ''}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2 rounded-md border border-input bg-background min-h-[100px]"
            placeholder="Tell us about yourself..."
          />
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
          <input
            id="location"
            type="text"
            value={location || ''}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 rounded-md border border-input bg-background"
            placeholder="City, Country"
          />
        </div>
        
        <div>
          <label htmlFor="nativeLanguage" className="block text-sm font-medium mb-1">Native Language</label>
          <select
            id="nativeLanguage"
            value={nativeLanguage || ''}
            onChange={(e) => setNativeLanguage(e.target.value)}
            className="w-full p-2 rounded-md border border-input bg-background"
          >
            <option value="">Select your native language</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="learningLanguage" className="block text-sm font-medium mb-1">Learning Language</label>
          <select
            id="learningLanguage"
            value={learningLanguage || ''}
            onChange={(e) => setLearningLanguage(e.target.value)}
            className="w-full p-2 rounded-md border border-input bg-background"
          >
            <option value="">Select the language you're learning</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="proficiency" className="block text-sm font-medium mb-1">Proficiency Level</label>
          <select
            id="proficiency"
            value={proficiency || ''}
            onChange={(e) => setProficiency(e.target.value)}
            className="w-full p-2 rounded-md border border-input bg-background"
          >
            <option value="">Select your proficiency level</option>
            {proficiencyLevels.map((level) => (
              <option key={level.id} value={level.name}>
                {level.name} - {level.description}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          isLoading={isLoading}
          disabled={!name || !nativeLanguage || !learningLanguage || !proficiency}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ProfileEdit;
