import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import { toast } from '@/hooks/use-toast';
import { Languages } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client
import { validateEnv } from "@/lib/env";

// Verify supabase is imported
console.log("Supabase imported:", !!supabase);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    validateEnv();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Input validation
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      if (!isLogin && !name) {
        throw new Error("Name is required for signup");
      }

      // Process email and password
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();
      
      if (isLogin) {
        // 🔐 LOGIN USER WITH SUPABASE
        console.log("Attempting login with:", cleanEmail);
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (error) {
          console.error("Login error:", error);
          throw error;
        }
        
        if (data && data.user) {
          console.log("Login successful, user:", data.user.id);
          toast({
            title: "Logged in successfully",
            description: `Welcome back to MyLanguage, ${data.user.email}!`,
          });
          
          navigate('/dashboard');
        } else {
          throw new Error("No user data returned. Please try again.");
        }
      } else {
        // ✨ SIGN UP USER WITH SUPABASE
        console.log("Attempting signup with:", cleanEmail);
        
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: { username: name.trim() },
          },
        });

        if (error) {
          console.error("Signup error:", error);
          throw error;
        }
        
        if (data.user) {
          console.log("Signup successful, user:", data.user.id);
          
          // Check if email confirmation is required
          if (data.session) {
            // User is automatically signed in
            toast({
              title: "Account created successfully",
              description: "Welcome to MyLanguage!",
            });
            navigate('/onboarding');
          } else {
            // Email confirmation is required
            toast({
              title: "Verification email sent",
              description: "Please check your email to confirm your account.",
            });
          }
        } else {
          throw new Error("Signup failed. Please try again.");
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
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