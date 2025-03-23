import { supabase } from './supabaseClient';

export type AuthError = {
  message: string;
};

// ✅ Email & Password Sign In
export async function signInWithPassword(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // 🔹 Check if the user has completed onboarding
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('onboarded, id')
      .eq('id', data.user?.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw profileError;
    }

    // If profile doesn't exist or onboarding not completed, redirect
    if (!userProfile?.onboarded) {
      return { data: { ...data, shouldCompleteOnboarding: true }, error: null };
    }

    if (profileError) console.warn('Profile fetch error:', profileError);

    // Redirect user to onboarding if not completed
    if (userProfile && !userProfile.onboarded) {
      window.location.href = '/onboarding';
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as AuthError };
  }
}

// ✅ Email & Password Sign Up
export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          email_confirm_sent: true
        }
      },
    });

    if (error) {
      console.error('Signup error:', error);
      throw error;
    }
    
    console.log('Signup response:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Signup failed:', error);
    return { data: null, error: error as AuthError };
  }
}

// ✅ Google OAuth Sign In
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as AuthError };
  }
}

// ✅ Sign Out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error: error as AuthError };
  }
}