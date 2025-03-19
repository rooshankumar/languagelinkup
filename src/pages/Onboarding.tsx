import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Japanese',
  'Korean',
  'Chinese',
] as const;

export type Language = typeof LANGUAGES[number];

const Onboarding = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
  };

  const handleContinue = async () => {
    if (!selectedLanguage) return;

    try {
      // Save language preference
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Choose your learning language</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {LANGUAGES.map((language) => (
          <Button
            key={language}
            variant={selectedLanguage === language ? "default" : "outline"}
            className="h-20"
            onClick={() => handleLanguageSelect(language)}
          >
            {language}
          </Button>
        ))}
      </div>
      <Button
        className="w-full"
        disabled={!selectedLanguage}
        onClick={handleContinue}
      >
        Continue
      </Button>
    </div>
  );
};

export default Onboarding;