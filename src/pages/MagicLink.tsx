
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const MagicLink = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast({ title: "Error", description: "Invalid login link" });
      navigate('/auth');
      return;
    }
    handleMagicLink();
  }, [token]);

  const handleMagicLink = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) throw error;
      toast({ title: "Success", description: "Logged in successfully" });
      navigate('/dashboard');
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
      navigate('/auth');
    }
  };

  return (
    <div className="container max-w-md mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-6">Logging you in...</h1>
      <p>Please wait while we verify your login link.</p>
    </div>
  );
};

export default MagicLink;
