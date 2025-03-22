import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import { toast } from '@/hooks/use-toast';
import { Languages } from 'lucide-react';
import { supabase } from "../lib/supabaseClient"; // Import Supabase client

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // 🔐 LOGIN USER WITH SUPABASE
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (!data.user) throw new Error("Authentication failed - no user data returned");

        // ✅ Check if user exists in the database
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError || !userData || !userData.native_language || !userData.learning_language) {
          console.warn("User data incomplete, redirecting to onboarding...");
          navigate('/onboarding'); // Redirect if user data is missing or incomplete
          return;
        }

        toast({
          title: "Logged in successfully",
          description: `Welcome back to MyLanguage, ${data.user.email}!`,
        });

        navigate('/community'); // ✅ Go directly to community

      } else {
        // ✨ SIGN UP USER WITH SUPABASE
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: name, full_name: name }, // Store name in metadata
          },
        });

        if (error) throw error;
        if (!data.user) throw new Error("Account creation failed - no user data returned");

        // ✅ Insert user data into 'users' table on signup
        const { error: insertError } = await supabase.from('users').insert([
          {
            id: data.user.id,  // Ensure the ID matches the Supabase Auth UUID
            username: name,
            email,
            native_language: null,  // Will be set in onboarding
            learning_language: null,  // Will be set in onboarding
            proficiency: null,
            bio: null,
            avatar: null,
            dob: null,
            profile_picture: null,
            last_active: new Date().toISOString(),
            is_online: true,
          }
        ]);
        
        if (insertError) {
          console.error('Error inserting user data:', insertError.message);
          // Continue anyway as the user might have been created in Auth but not yet in the users table
        }

        toast({
          title: "Account created successfully",
          description: "Welcome to MyLanguage! Complete onboarding to get started.",
        });

        navigate('/onboarding'); // ✅ Ensure new users go to onboarding
      }
    } catch (error: any) {
      console.error('Authentication error:', error.message);
      toast({
        title: "Authentication failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-background/60">
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Languages className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">MyLanguage</h1>
        </div>

        <div className="bg-card p-8 rounded-xl shadow-lg border border-border/40">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isLogin ? 'Welcome Back' : 'Join MyLanguage'}
          </h2>
          
          <Button 
            variant="outline" 
            className="w-full mb-4 flex items-center justify-center gap-2"
            onClick={() => supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${window.location.origin}/auth/callback`
              }
            })}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded-md border border-input bg-background"
                  placeholder="Enter your name"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded-md border border-input bg-background"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded-md border border-input bg-background"
                placeholder="••••••••"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full mt-6" 
              isLoading={isLoading}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
