
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
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session || !session.session) {
        navigate("/");
        return;
      }

      const user = session.session.user;

      if (!user.email_confirmed_at) {
        navigate("/verify-email");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (error || !profile) {
        console.error("Profile fetch error:", error);
        navigate("/onboarding");
        return;
      }

      if (!profile.onboarding_completed) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    };

    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Redirecting...</span>
    </div>
  );
};

export default AuthCallback;
