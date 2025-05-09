import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, User, Languages, Calendar, CheckCircle, Globe, Loader2 } from 'lucide-react';

type OnboardingStepProps = {
  children: React.ReactNode;
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
};

const OnboardingStep = ({ children, title, icon, isActive }: OnboardingStepProps) => {
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
          Let's personalize your experience
        </p>
      </div>
      {children}
    </motion.div>
  );
};

export type OnboardingFormData = {
  full_name: string;
  username: string;
  bio: string;
  native_language: string;
  learning_languages: string[];
  avatar_url: string;
  dob: string;
  proficiency_level: string;
  gender: string;
};

export const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>({
    full_name: '',
    gender: '',
    bio: '',
    native_language: '',
    learning_languages: [],
    avatar_url: '',
    dob: '',
    proficiency_level: '',
    username: ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState({
    full_name: '',
    gender: '',
    bio: '',
    native_language: '',
    learning_languages: '',
    avatar_url: '',
    dob: '',
    proficiency_level: '',
    username: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({...errors, [e.target.name]: ''}); //clear error on change
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    setErrors({...errors, [name]: ''}); //clear error on change
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const preview = URL.createObjectURL(file);
      setFormData({ ...formData, avatar_url: preview });
    }
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const validateForm = () => {
    const newErrors = {
      full_name: !formData.full_name ? 'Full name is required' : '',
      gender: !formData.gender ? 'Gender is required' : '',
      bio: !formData.bio ? 'Bio is required' : '',
      native_language: !formData.native_language ? 'Native Language is required' : '',
      learning_languages: formData.learning_languages.length === 0 ? 'Select at least one language' : '',
      avatar_url: !formData.avatar_url ? 'Avatar is required' : '',
      dob: !formData.dob ? 'Date of Birth is required' : '',
      proficiency_level: !formData.proficiency_level ? 'Proficiency Level is required' : '',
      username: !formData.username ? 'Username is required' : ''
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!user.email_confirmed_at) {
        toast.error('Please verify your email before proceeding with onboarding.');
        navigate('/auth'); // Redirect to verification page
        return;
      }

      // Upload avatar if exists
      let avatar_url = formData.avatar_url;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatar_url = publicUrl;
      }

      // Create user profile
      const { error } = await supabase.from('users').upsert({
        id: user.id,
        ...formData,
        avatar_url,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success('Profile created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Chinese',
    'Japanese', 'Korean', 'Russian', 'Arabic', 'Portuguese', 'Italian'
  ];

  const proficiencyLevels = [
    'Beginner', 'Elementary', 'Intermediate',
    'Upper Intermediate', 'Advanced', 'Fluent', 'Native'
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 py-8 px-4">
        <div className="max-w-md mx-auto space-y-8">
          <div className="bg-card rounded-xl border shadow-sm p-6">
            {/* Step 1: Personal Information */}
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
                  {errors.full_name && <p className="text-sm text-red-500 mt-1">{errors.full_name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange('gender', value)}
                    value={formData.gender}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                  {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us a bit about yourself"
                    value={formData.bio}
                    onChange={handleInputChange}
                  />
                  {errors.bio && <p className="text-sm text-red-500 mt-1">{errors.bio}</p>}
                </div>

                <div className="pt-4 flex justify-end">
                  <Button onClick={handleNext} disabled={!formData.full_name || !formData.gender || !formData.username}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </OnboardingStep>

            {/* Step 2: Language Preferences */}
            <OnboardingStep
              title="Language Preferences"
              icon={<Languages className="h-6 w-6 text-primary" />}
              isActive={step === 2}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Native Language</Label>
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
                  {errors.native_language && <p className="text-sm text-red-500 mt-1">{errors.native_language}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Languages You're Learning</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {languages.map(language => (
                      <div key={language} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`learning-${language}`}
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
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor={`learning-${language}`} className="text-sm">
                          {language}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.learning_languages && <p className="text-sm text-red-500 mt-1">{errors.learning_languages}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Your Proficiency Level</Label>
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
                  {errors.proficiency_level && <p className="text-sm text-red-500 mt-1">{errors.proficiency_level}</p>}
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext} disabled={!formData.native_language || !formData.proficiency_level || formData.learning_languages.length === 0}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </OnboardingStep>

            {/* Step 3: Date of Birth */}
            <OnboardingStep
              title="Date of Birth"
              icon={<Calendar className="h-6 w-6 text-primary" />}
              isActive={step === 3}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.dob && <p className="text-sm text-red-500 mt-1">{errors.dob}</p>}
                  <p className="text-xs text-muted-foreground">
                    This helps us find suitable language partners for you.
                  </p>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext} disabled={!formData.dob}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </OnboardingStep>

            {/* Step 4: Profile Picture */}
            <OnboardingStep
              title="Profile Picture"
              icon={<User className="h-6 w-6 text-primary" />}
              isActive={step === 4}
            >
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="h-32 w-32 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-primary/20">
                    {formData.avatar_url ? (
                      <img
                        src={formData.avatar_url}
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
                    {formData.avatar_url ? 'Change Photo' : 'Upload Photo'}
                  </Label>
                  {errors.avatar_url && <p className="text-sm text-red-500 mt-1">{errors.avatar_url}</p>}
                  <p className="text-sm text-muted-foreground">
                    Choose a profile picture that represents you
                  </p>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext} disabled={!formData.avatar_url}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </OnboardingStep>

            {/* Step 5: Ready to Start */}
            <OnboardingStep
              title="Ready to Start"
              icon={<CheckCircle className="h-6 w-6 text-primary" />}
              isActive={step === 5}
            >
              <form onSubmit={handleSubmit}>
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
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Finishing up...
                        </>
                      ) : 'Get Started'}
                    </Button>
                  </div>
                </div>
              </form>
            </OnboardingStep>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;