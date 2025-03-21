
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [oldEmail, setOldEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast({ 
        title: "Error", 
        description: "Invalid email confirmation link",
        variant: "destructive"
      });
      navigate('/auth-error');
      return;
    }
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      setIsLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      setOldEmail(user?.email || '');
      setNewEmail(searchParams.get('new_email') || '');
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

  const handleConfirm = async () => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email_change'
      });

      if (error) throw error;

      toast({ 
        title: "Success", 
        description: "Email updated successfully" 
      });
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto mt-16 p-6">
        <p>Verifying email confirmation...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-6">Confirm Email Change</h1>
      <p className="mb-6">
        You're updating your email on RoshLingua from {oldEmail} → {newEmail}
      </p>
      <Button onClick={handleConfirm} className="w-full">
        Confirm Email Change
      </Button>
    </div>
  );
};

export default ConfirmEmail;
