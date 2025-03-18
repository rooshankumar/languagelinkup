
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        if (!session?.user) throw new Error('No session found');

        await refreshSession();

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError || !userData || !userData.native_language) {
          navigate('/onboarding');
          toast({
            title: "Welcome!",
            description: "Let's set up your profile.",
          });
        } else {
          navigate('/community');
          toast({
            title: "Welcome back!",
            description: "Successfully logged in.",
          });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to complete authentication",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate, refreshSession]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-center">
        <h2 className="text-2xl font-semibold">Completing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we verify your account.</p>
      </div>
    </div>
  );
}
