
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { searchParams } = new URL(window.location.href);
        const code = searchParams.get('code');

        if (!code) {
          console.error('No code provided in callback');
          navigate('/auth/error');
          return;
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Auth error:', error.message);
          navigate('/auth/error');
          return;
        }

        navigate('/dashboard');
      } catch (err) {
        console.error('Callback error:', err);
        navigate('/auth/error');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
};

export default AuthCallback;
