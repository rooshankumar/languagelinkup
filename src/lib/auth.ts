
import { supabase } from './supabase';
import { toast } from '@/hooks/use-toast';

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    toast({
      title: "Error signing in",
      description: error.message,
      variant: "destructive",
    });
    return { data: null, error };
  }

  return { data, error: null };
}

export async function signUp(email: string, password: string, options?: { data?: { full_name?: string } }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options,
  });

  if (error) {
    toast({
      title: "Error signing up",
      description: error.message,
      variant: "destructive",
    });
    return { data: null, error };
  }

  return { data, error: null };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    toast({
      title: "Error signing out",
      description: error.message,
      variant: "destructive",
    });
  }
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    toast({
      title: "Error signing in with Google",
      description: error.message,
      variant: "destructive",
    });
  }

  return { data, error };
}
