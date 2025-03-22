
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user) {
      if (!profile || !profile.onboarding_completed) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, profile, navigate]);

  return null;
};

export default AuthCallback;
