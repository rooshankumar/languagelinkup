
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast({ 
        title: "Error", 
        description: "Invalid or expired reset link",
        variant: "destructive"
      });
      navigate('/auth-error');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({ 
        title: "Error", 
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast({ 
        title: "Success", 
        description: "Password updated successfully" 
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container max-w-md mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password"
          required
          minLength={8}
        />
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          required
          minLength={8}
        />
        <Button type="submit" className="w-full">Reset Password</Button>
      </form>
    </div>
  );
};

export default ResetPassword;
