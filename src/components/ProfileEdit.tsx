
import React, { useState, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import Button from '@/components/Button';
import { uploadProfilePicture } from '@/utils/supabaseStorage';

interface ProfileEditProps {
  userProfile: any;
  onCancel: () => void;
  onSave: (updatedProfile: any, newProfilePicture?: File) => void;
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Update user profile details
      const updatedProfile = {
        username: name,
        bio,
        location,
        native_language: nativeLanguage,
        learning_language: learningLanguage,
        proficiency,
        last_active: new Date().toISOString(),
      };
      
      onSave(updatedProfile, profilePicture || undefined);
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      toast({
        title: "Failed to update profile",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-24 mb-4">
            {profilePicture ? (
              <img 
                src={URL.createObjectURL(profilePicture)} 
                alt="Profile preview" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : userProfile?.profile_picture ? (
              <img 
                src={userProfile.profile_picture} 
                alt={name} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold">{name.charAt(0)}</span>
              </div>
            )}
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            id="profile-picture"
          />
          
          <Button 
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm"
          >
            Change Profile Picture
          </Button>
        </div>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Display Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded-md border border-input"
            required
          />
        </div>
        
        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2 rounded-md border border-input min-h-[100px]"
            placeholder="Tell others about yourself..."
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
            className="w-full p-2 rounded-md border border-input"
            placeholder="City, Country"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nativeLanguage" className="block text-sm font-medium mb-1">
              Native Language
            </label>
            <select
              id="nativeLanguage"
              value={nativeLanguage}
              onChange={(e) => setNativeLanguage(e.target.value)}
              className="w-full p-2 rounded-md border border-input"
              required
            >
              <option value="">Select Language</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              <option value="Korean">Korean</option>
              <option value="Russian">Russian</option>
              <option value="Arabic">Arabic</option>
              <option value="Hindi">Hindi</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Italian">Italian</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="learningLanguage" className="block text-sm font-medium mb-1">
              Learning Language
            </label>
            <select
              id="learningLanguage"
              value={learningLanguage}
              onChange={(e) => setLearningLanguage(e.target.value)}
              className="w-full p-2 rounded-md border border-input"
              required
            >
              <option value="">Select Language</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              <option value="Korean">Korean</option>
              <option value="Russian">Russian</option>
              <option value="Arabic">Arabic</option>
              <option value="Hindi">Hindi</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Italian">Italian</option>
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="proficiency" className="block text-sm font-medium mb-1">
            Proficiency Level
          </label>
          <select
            id="proficiency"
            value={proficiency}
            onChange={(e) => setProficiency(e.target.value)}
            className="w-full p-2 rounded-md border border-input"
            required
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Fluent">Fluent</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button 
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          isLoading={isLoading}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default ProfileEdit;
