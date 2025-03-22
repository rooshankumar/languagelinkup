
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const MagicLink = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast({ 
        title: "Error", 
        description: "Invalid login link",
        variant: "destructive" 
      });
      navigate('/auth-error');
      return;
    }
    handleMagicLink();
  }, [token]);

  const handleMagicLink = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'magiclink'
      });

      if (error) throw error;

      toast({ 
        title: "Success", 
        description: "Logged in successfully" 
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive"
      });
      navigate('/auth-error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-6">Magic Link Login</h1>
      {isLoading ? (
        <p>Verifying your login...</p>
      ) : (
        <Button onClick={() => navigate('/auth')}>Return to Login</Button>
      )}
    </div>
  );
};

export default MagicLink;
