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
      .from('profiles')
      .select('onboarded')
      .eq('id', data.user?.id)
      .single();

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
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as AuthError };
  }
}

// ✅ Google OAuth Sign In
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `https://5a26870e-ba06-436d-b121-ac78f2ab02e5-00-35yf96lqew2dc.pike.replit.dev:3001/auth/callback`, // Change if hosting elsewhere
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
