
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { 
  ChevronRight, 
  ChevronLeft, 
  Languages, 
  User, 
  Globe, 
  CheckCircle,
  Calendar,
  Loader2
} from 'lucide-react';

const OnboardingStep = ({ 
  children, 
  title, 
  icon, 
  isActive 
}: { 
  children: React.ReactNode; 
  title: string; 
  icon: React.ReactNode; 
  isActive: boolean; 
}) => {
  if (!isActive) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-md w-full mx-auto"
    >
      <div className="mb-8 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground mt-2">
          Let's personalize your language learning experience
        </p>
      </div>
      {children}
    </motion.div>
  );
};

const Onboarding = () => {
  const { user } = useAuth();
  const { completeOnboarding, isLoading, uploadAvatar } = useProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    native_language: '',
    learning_languages: [] as string[],
    avatar_url: '',
    date_of_birth: '',
    proficiency_level: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (step === 1 && (!formData.full_name || !formData.username)) {
      toast.error('Please fill out all required fields');
      return;
    }

    if (step === 2 && !formData.native_language) {
      toast.error('Please select your native language');
      return;
    }

    if (step === 3 && !formData.date_of_birth) {
      toast.error('Please enter your date of birth');
      return;
    }

    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      toast.info('Saving your profile...');
      
      // First upload avatar if provided
      if (avatarFile) {
        const { url } = await uploadAvatar(avatarFile);
        if (url) {
          formData.avatar_url = url;
        }
      }
      
      const { error } = await completeOnboarding(formData);
      
      if (error) {
        throw error;
      }
      
      toast.success('Onboarding completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding');
    }
  };

  // Sample language options
  const languages = [
    'English',
    'Spanish',
    'French', 
    'German',
    'Chinese',
    'Japanese',
    'Korean',
    'Russian',
    'Arabic',
    'Portuguese',
    'Italian',
  ];

  // Proficiency levels
  const proficiencyLevels = [
    'Beginner',
    'Elementary',
    'Intermediate',
    'Upper Intermediate',
    'Advanced',
    'Fluent',
    'Native'
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="fixed top-0 right-0 p-4 z-10">
        <ThemeToggle />
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">
              roshLingua
            </h1>
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-12 rounded-full transition-colors ${
                    i === step ? 'bg-primary' : 'bg-primary/20'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <OnboardingStep 
              title="Personal Information" 
              icon={<User className="h-6 w-6 text-primary" />} 
              isActive={step === 1}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us a bit about yourself"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button onClick={handleNext}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </OnboardingStep>
            
            <OnboardingStep 
              title="Language Skills" 
              icon={<Languages className="h-6 w-6 text-primary" />} 
              isActive={step === 2}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="native_language">Native Language</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange('native_language', value)}
                    value={formData.native_language}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your native language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(language => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Languages You're Learning</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {languages.slice(0, 8).map(language => (
                      <div key={language} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`learning-${language}`}
                          className="h-4 w-4 rounded border-gray-300"
                          checked={formData.learning_languages.includes(language)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setFormData(prev => ({
                              ...prev,
                              learning_languages: isChecked
                                ? [...prev.learning_languages, language]
                                : prev.learning_languages.filter(lang => lang !== language),
                            }));
                          }}
                        />
                        <label htmlFor={`learning-${language}`} className="text-sm">
                          {language}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="proficiency_level">Your Proficiency Level</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange('proficiency_level', value)}
                    value={formData.proficiency_level}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your proficiency level" />
                    </SelectTrigger>
                    <SelectContent>
                      {proficiencyLevels.map(level => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </OnboardingStep>

            <OnboardingStep 
              title="Date of Birth" 
              icon={<Calendar className="h-6 w-6 text-primary" />} 
              isActive={step === 3}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]} // Prevents future dates
                  />
                  <p className="text-xs text-muted-foreground">
                    This helps us find suitable language partners for you.
                  </p>
                </div>
                
                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </OnboardingStep>
            
            <OnboardingStep 
              title="Profile Picture" 
              icon={<User className="h-6 w-6 text-primary" />} 
              isActive={step === 4}
            >
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="h-32 w-32 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-primary/20">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                  
                  <input
                    type="file"
                    accept="image/*"
                    id="avatar"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <Label 
                    htmlFor="avatar" 
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md cursor-pointer"
                  >
                    {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                  </Label>
                  
                  <p className="text-sm text-muted-foreground">
                    Choose a profile picture that represents you
                  </p>
                </div>
                
                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </OnboardingStep>
            
            <OnboardingStep 
              title="Ready to Start" 
              icon={<CheckCircle className="h-6 w-6 text-primary" />} 
              isActive={step === 5}
            >
              <div className="space-y-6">
                <div className="bg-primary/5 rounded-lg p-6 text-center">
                  <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">You're all set!</h3>
                  <p className="text-muted-foreground">
                    Start connecting with language partners around the world and improve your language skills.
                  </p>
                </div>
                
                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Finishing up...
                      </>
                    ) : 'Get Started'}
                  </Button>
                </div>
              </div>
            </OnboardingStep>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
