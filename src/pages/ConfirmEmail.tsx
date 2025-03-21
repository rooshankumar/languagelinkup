
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get('token');
  const [oldEmail, setOldEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    if (!token) {
      toast({ title: "Error", description: "Invalid email confirmation link" });
      navigate('/auth');
      return;
    }
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) throw error;
      setOldEmail(user.email || '');
      setNewEmail(searchParams.get('new_email') || '');
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
      navigate('/auth');
    }
  };

  const handleConfirm = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast({ title: "Success", description: "Email updated successfully" });
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    }
  };

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
