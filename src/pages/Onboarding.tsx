import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import Button from '@/components/Button';
import { toast } from '@/hooks/use-toast';
import { Languages, ArrowRight, Check } from 'lucide-react';

// Sample language data
const LANGUAGES = [
  { id: 'en', name: 'English', flag: '🇺🇸' },
  { id: 'es', name: 'Spanish', flag: '🇪🇸' },
  { id: 'fr', name: 'French', flag: '🇫🇷' },
  { id: 'de', name: 'German', flag: '🇩🇪' },
  { id: 'it', name: 'Italian', flag: '🇮🇹' },
  { id: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { id: 'ko', name: 'Korean', flag: '🇰🇷' },
  { id: 'zh', name: 'Mandarin', flag: '🇨🇳' },
  { id: 'ru', name: 'Russian', flag: '🇷🇺' },
  { id: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { id: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { id: 'hi', name: 'Hindi', flag: '🇮🇳' },
];

const PROFICIENCY_LEVELS = [
  { id: 'beginner', name: 'Beginner', description: 'I know a few words' },
  { id: 'elementary', name: 'Elementary', description: 'I can make simple sentences' },
  { id: 'intermediate', name: 'Intermediate', description: 'I can have basic conversations' },
  { id: 'advanced', name: 'Advanced', description: 'I can express complex ideas' },
  { id: 'native', name: 'Native/Fluent', description: 'I speak this language fluently' },
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [learningLanguage, setLearningLanguage] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch the authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  // Save user preferences in Supabase
  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Error", description: "User not authenticated!" });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        native_language: nativeLanguage,
        learning_language: learningLanguage,
        proficiency_level: proficiencyLevel,
      });

    if (error) {
      toast({ title: "Error", description: "Failed to save profile preferences." });
    } else {
      toast({ title: "Profile Updated!", description: "Your preferences have been saved." });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-background/60">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Languages className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">MyLanguage</h1>
        </div>

        <div className="bg-card p-8 rounded-xl shadow-lg border border-border/40">
          {/* Step Indicator */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step === i ? 'border-primary bg-primary text-primary-foreground' :
                step > i ? 'border-primary bg-primary/20 text-primary' :
                'border-muted-foreground/30 text-muted-foreground/50'}`}>
                {step > i ? <Check className="h-5 w-5" /> : i}
              </div>
            ))}
          </div>

          {/* Step 1: Select Native Language */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">What's your native language?</h2>
              <p className="text-muted-foreground">Select the language you speak fluently.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {LANGUAGES.map((language) => (
                  <button key={language.id} onClick={() => setNativeLanguage(language.id)}
                    className={`flex items-center p-3 rounded-lg border ${
                      nativeLanguage === language.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}>
                    <span className="text-2xl mr-2">{language.flag}</span>
                    <span>{language.name}</span>
                  </button>
                ))}
              </div>
              <Button className="w-full mt-6" onClick={() => setStep(2)} disabled={!nativeLanguage}
                icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">Continue</Button>
            </div>
          )}

          {/* Step 2: Select Learning Language */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">What language do you want to learn?</h2>
              <p className="text-muted-foreground">Select a language you want to practice.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {LANGUAGES.filter(lang => lang.id !== nativeLanguage).map((language) => (
                  <button key={language.id} onClick={() => setLearningLanguage(language.id)}
                    className={`flex items-center p-3 rounded-lg border ${
                      learningLanguage === language.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}>
                    <span className="text-2xl mr-2">{language.flag}</span>
                    <span>{language.name}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} disabled={!learningLanguage} icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">Continue</Button>
              </div>
            </div>
          )}

          {/* Step 3: Select Proficiency Level */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">What's your proficiency level?</h2>
              <div className="space-y-3 mt-4">
                {PROFICIENCY_LEVELS.map((level) => (
                  <button key={level.id} onClick={() => setProficiencyLevel(level.id)}
                    className={`flex items-center justify-between w-full p-4 rounded-lg border ${
                      proficiencyLevel === level.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}>
                    <span>{level.name}</span>
                    {proficiencyLevel === level.id && <Check className="h-5 w-5 text-primary" />}
                  </button>
                ))}
              </div>
              <Button onClick={handleSubmit} disabled={!proficiencyLevel}>Complete Profile</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
