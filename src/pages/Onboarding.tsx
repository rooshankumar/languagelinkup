import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import { toast } from '@/hooks/use-toast';
import { Languages, ArrowRight, Check, Calendar, Upload, User } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";

export const LANGUAGES = [
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
  const [fullName, setFullName] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        
        // Get user metadata for name
        if (session.user.user_metadata?.username) {
          setFullName(session.user.user_metadata.username);
        }
        
        // Check if user has already completed onboarding
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('native_language, learning_language, username')
          .eq('id', session.user.id)
          .single();
          
        if (!userError && userData) {
          // Set full name from database if available
          if (userData.username) {
            setFullName(userData.username);
          }
          
          // If onboarding is complete, redirect to community
          if (userData.native_language && userData.learning_language) {
            console.log("Onboarding already completed, redirecting to community...");
            navigate('/community');
            return;
          }
        }
      };

      checkAuth();
  }, [navigate]);

const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    setProfilePicture(file);
    // Create a temporary URL for preview
    const objectUrl = URL.createObjectURL(file);
    setProfilePictureUrl(objectUrl);
  }
};

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

  console.log("Submitting data:", { 
    fullName, 
    nativeLanguage, 
    learningLanguage, 
    proficiencyLevel,
    dob,
    profilePicture: profilePicture ? "Selected" : "None"
  });

  try {
    // Get current user session and ensure authentication
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("No active session found");
    }
    
    // Upload profile picture if selected
    let profilePictureURL = '';
    if (profilePicture) {
      const fileExt = profilePicture.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `profile_pictures/${fileName}`;
      
      console.log("Uploading profile picture:", filePath);
      
      // Check if bucket exists, create if needed
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'user_uploads');
      
      if (!bucketExists) {
        console.log("Creating user_uploads bucket");
        await supabase.storage.createBucket('user_uploads', {
          public: true
        });
      }
      
      const { error: uploadError, data } = await supabase.storage
        .from('user_uploads')
        .upload(filePath, profilePicture, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        console.error("Error uploading profile picture:", uploadError);
        throw uploadError;
      }
      
      console.log("Upload successful:", data);
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user_uploads')
        .getPublicUrl(filePath);
      
      console.log("Profile picture public URL:", publicUrl);
      profilePictureURL = publicUrl;
    }

    // Create data object to update or insert
    const userData = {
      id: userId,
      username: fullName || "User",
      email: session.user.email || '',
      native_language: nativeLanguage,
      learning_language: learningLanguage,
      proficiency: proficiencyLevel,
      last_active: new Date().toISOString(),
      is_online: true,
      dob: dob || null,
      profile_picture: profilePictureURL || null
    };

    console.log("Updating user data:", userData);

    // Always use upsert to handle both insert and update cases
    // This will prevent the duplicate key error
    const { error } = await supabase
      .from('users')
      .upsert(userData, { 
        onConflict: ['id'],
        returning: 'minimal' 
      });

    if (error) {
      console.error("Standard update/insert failed, error:", error.message);
      throw error;
    }

    toast({
      title: "Profile completed!",
      description: "Your preferences have been saved.",
    });

    navigate('/community'); // Redirect to community page after completion
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
            {[1, 2, 3, 4].map((i) => (
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
                  onClick={() => setStep(4)}
                  disabled={!proficiencyLevel}
                  icon={<ArrowRight className="h-4 w-4 ml-2" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Complete Your Profile</h2>
              <p className="text-muted-foreground">Add some personal details to help others connect with you.</p>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2 rounded-md border border-input bg-background"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="dob" className="block text-sm font-medium">
                    Date of Birth
                  </label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                    <input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full p-2 rounded-md border border-input bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="profilePicture" className="block text-sm font-medium">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center overflow-hidden"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {profilePictureUrl ? (
                        <img 
                          src={profilePictureUrl} 
                          alt="Profile Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div>
                      <input
                        ref={fileInputRef}
                        id="profilePicture"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePictureUpload}
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        icon={<Upload className="h-4 w-4 mr-2" />}
                      >
                        {profilePicture ? 'Change Photo' : 'Upload Photo'}
                      </Button>
                      {profilePicture && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {profilePicture.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(3)}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!nativeLanguage || !learningLanguage || !proficiencyLevel || !fullName}
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