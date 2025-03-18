
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Auth callback error:', error);
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      if (user) {
        // Check if user exists in our database
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        setUser(user);

        if (userError || !userData || !userData.native_language || !userData.learning_language) {
          // New user or incomplete profile
          toast({
            title: "Welcome to MyLanguage!",
            description: "Let's set up your profile.",
          });
          navigate('/onboarding');
        } else {
          // Existing user with complete profile
          toast({
            title: "Welcome back!",
            description: "Successfully logged in.",
          });
          navigate('/community');
        }
      }
    };

    handleAuthCallback();
  }, [navigate, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
    </div>
  );
}
