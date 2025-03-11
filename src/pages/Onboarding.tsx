import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import { toast } from '@/hooks/use-toast';
import { Languages, ArrowRight, Check } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";

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
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
      const checkAuth = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Auth session error:", error);
          toast({
            title: "Authentication error",
            description: "Failed to retrieve session. Please log in again.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        if (!session?.user) {
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

  console.log("Submitting data:", { nativeLanguage, learningLanguage, proficiencyLevel });

  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("No active session found");
    }
    
    // Create data object to update
    const userData = {
      id: userId,
      username: username || "User",
      email: session.user.email || '',
      native_language: nativeLanguage,
      learning_language: learningLanguage,
      proficiency: proficiencyLevel,
      last_active: new Date().toISOString(),
      is_online: true,
    };
    
    console.log("Updating user data:", userData);
    
    // Try direct update instead of upsert
    const { error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId);
      
    if (error) {
      console.error("Update error:", error);
      // Fallback to insert if update fails
      const { error: insertError } = await supabase
        .from('users')
        .insert([userData]);
        
      if (insertError) throw insertError;
    }
        id: userId,
        username: username || "User";
        email: (await supabase.auth.getUser()).data?.user?.email || '',
        native_language: nativeLanguage,
        learning_language: learningLanguage,
        proficiency: proficiencyLevel,
        last_active: new Date().toISOString(),
        is_online: true,
      }, { onConflict: ['id'] });

    if (error) throw error;

    toast({
      title: "Profile completed!",
      description: "Your language preferences have been saved.",
    });

    navigate('/profile'); // Redirect to profile after completion
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
              <div key={i} className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step === i 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : step > i 
                    ? 'border-primary bg-primary/20 text-primary' 
                    : 'border-muted-foreground/30 text-muted-foreground/50'
              }`}>
                {step > i ? <Check className="h-5 w-5" /> : i}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">What's your native language?</h2>
              <p className="text-muted-foreground">Select the language you speak fluently.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {LANGUAGES.map((language) => (
                  <button
                    key={language.id}
                    onClick={() => setNativeLanguage(language.id)}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      nativeLanguage === language.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{language.flag}</span>
                      <span>{language.name}</span>
                    </div>
                    {nativeLanguage === language.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => setStep(2)}
                  disabled={!nativeLanguage}
                  icon={<ArrowRight className="h-4 w-4 ml-2" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">What language do you want to learn?</h2>
              <p className="text-muted-foreground">Select a language you'd like to practice.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {LANGUAGES.filter(lang => lang.id !== nativeLanguage).map((language) => (
                  <button
                    key={language.id}
                    onClick={() => setLearningLanguage(language.id)}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      learningLanguage === language.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{language.flag}</span>
                      <span>{language.name}</span>
                    </div>
                    {learningLanguage === language.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
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
                  icon={<ArrowRight className="h-4 w-4 ml-2" />}
                >
                  Next
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
                  disabled={!nativeLanguage || !learningLanguage || !proficiencyLevel}
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