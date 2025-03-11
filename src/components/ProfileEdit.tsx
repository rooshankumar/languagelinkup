
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '../lib/supabaseClient';

interface ProfileEditProps {
  userProfile: any;
  onCancel: () => void;
  onSave: (updatedProfile: any) => void;
}

const ProfileEdit = ({ userProfile, onCancel, onSave }: ProfileEditProps) => {
  const [name, setName] = useState(userProfile?.username || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [location, setLocation] = useState(userProfile?.location || '');
  const [nativeLanguage, setNativeLanguage] = useState(userProfile?.native_language || '');
  const [learningLanguage, setLearningLanguage] = useState(userProfile?.learning_language || '');
  const [proficiency, setProficiency] = useState(userProfile?.proficiency || 'Beginner');
  const [isLoading, setIsLoading] = useState(false);

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
      
      onSave(updatedProfile);
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

  const languageOptions = [
    'English', 'Spanish', 'French', 'German', 'Italian', 
    'Portuguese', 'Russian', 'Japanese', 'Chinese', 'Korean',
    'Arabic', 'Hindi', 'Dutch', 'Swedish', 'Greek', 'Turkish'
  ];

  const proficiencyOptions = [
    'Beginner', 'Intermediate', 'Advanced', 'Fluent'
  ];

  return (
    <div className="border rounded-lg p-5 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded-md border border-input bg-background"
            placeholder="Your name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="bio" className="block text-sm font-medium">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2 rounded-md border border-input bg-background min-h-[100px]"
            placeholder="Tell us about yourself"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="location" className="block text-sm font-medium">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 rounded-md border border-input bg-background"
            placeholder="City, Country"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="nativeLanguage" className="block text-sm font-medium">
            Native Language
          </label>
          <select
            id="nativeLanguage"
            value={nativeLanguage}
            onChange={(e) => setNativeLanguage(e.target.value)}
            className="w-full p-2 rounded-md border border-input bg-background"
            required
          >
            <option value="">Select a language</option>
            {languageOptions.map((lang) => (
              <option key={`native-${lang}`} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="learningLanguage" className="block text-sm font-medium">
            Learning Language
          </label>
          <select
            id="learningLanguage"
            value={learningLanguage}
            onChange={(e) => setLearningLanguage(e.target.value)}
            className="w-full p-2 rounded-md border border-input bg-background"
            required
          >
            <option value="">Select a language</option>
            {languageOptions.map((lang) => (
              <option key={`learning-${lang}`} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="proficiency" className="block text-sm font-medium">
            Proficiency Level
          </label>
          <select
            id="proficiency"
            value={proficiency}
            onChange={(e) => setProficiency(e.target.value)}
            className="w-full p-2 rounded-md border border-input bg-background"
            required
          >
            {proficiencyOptions.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;
