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
