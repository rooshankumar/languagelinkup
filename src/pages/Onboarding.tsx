
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import { toast } from '@/hooks/use-toast';
import { Languages, ArrowRight, Check } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";

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
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        // Redirect to auth if not logged in
        toast({
          title: "Authentication required",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }
      
      setUserId(session.user.id);
    };
    
    checkAuth();
  }, [navigate]);

  const handleSubmit = async () => {
    if (!userId) {
      toast({
        title: "Authentication error",
        description: "Please log in again to continue.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Save language preferences to Supabase
      const { error } = await supabase
        .from('user_languages')
        .upsert({
          user_id: userId,
          native_language: nativeLanguage,
          learning_language: learningLanguage,
          proficiency_level: proficiencyLevel,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        
      if (error) throw error;
      
      toast({
        title: "Profile completed!",
        description: "Your language preferences have been saved.",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error saving preferences:', error.message);
      toast({
        title: "Error saving preferences",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step === i 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : step > i 
                      ? 'border-primary bg-primary/20 text-primary' 
                      : 'border-muted-foreground/30 text-muted-foreground/50'
                }`}
              >
                {step > i ? <Check className="h-5 w-5" /> : i}
              </div>
            ))}
          </div>
          
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">What's your native language?</h2>
              <p className="text-muted-foreground">Select the language you speak fluently.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {LANGUAGES.map((language) => (
                  <button
                    key={language.id}
                    onClick={() => setNativeLanguage(language.id)}
                    className={`flex items-center p-3 rounded-lg border ${
                      nativeLanguage === language.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-2xl mr-2">{language.flag}</span>
                    <span>{language.name}</span>
                  </button>
                ))}
              </div>
              
              <Button 
                className="w-full mt-6" 
                onClick={() => setStep(2)}
                disabled={!nativeLanguage}
                icon={<ArrowRight className="h-4 w-4" />}
                iconPosition="right"
              >
                Continue
              </Button>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">What language do you want to learn?</h2>
              <p className="text-muted-foreground">Select a language you want to practice.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {LANGUAGES.filter(lang => lang.id !== nativeLanguage).map((language) => (
                  <button
                    key={language.id}
                    onClick={() => setLearningLanguage(language.id)}
                    className={`flex items-center p-3 rounded-lg border ${
                      learningLanguage === language.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-2xl mr-2">{language.flag}</span>
                    <span>{language.name}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={!learningLanguage}
                  icon={<ArrowRight className="h-4 w-4" />}
                  iconPosition="right"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">What's your proficiency level?</h2>
              <p className="text-muted-foreground">Select your current level in {
                LANGUAGES.find(l => l.id === learningLanguage)?.name
              }.</p>
              
              <div className="space-y-3 mt-4">
                {PROFICIENCY_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setProficiencyLevel(level.id)}
                    className={`flex items-center justify-between w-full p-4 rounded-lg border ${
                      proficiencyLevel === level.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">{level.name}</div>
                      <div className="text-sm text-muted-foreground">{level.description}</div>
                    </div>
                    {proficiencyLevel === level.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!proficiencyLevel}
                  isLoading={isLoading}
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
