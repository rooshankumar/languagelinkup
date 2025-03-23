import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true; // ✅ Prevents memory leaks in React

    const handleAuthCallback = async () => {
      const { searchParams } = new URL(window.location.href);
      const code = searchParams.get('code');

      if (!code) {
        navigate('/auth/error'); // ✅ Redirect if code is missing
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (isMounted) {
        navigate(error ? '/auth/error' : '/dashboard');
      }
    };

    handleAuthCallback();

    return () => {
      isMounted = false; // ✅ Cleanup to prevent state update on unmounted component
    };
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
};

export default AuthCallback;