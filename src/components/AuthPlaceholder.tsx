
import React, { useState } from 'react';
import Button from '@/components/Button';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AuthPlaceholder = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real implementation, this would connect to your authentication backend
    toast({
      title: isLogin ? "Logged in successfully" : "Account created",
      description: "Welcome to MyLanguage app!",
    });
    
    navigate('/dashboard');
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-lg border shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isLogin ? 'Sign In' : 'Create Account'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Your name"
            />
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="your@email.com"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="••••••••"
            required
          />
        </div>
        
        <Button type="submit" className="w-full">
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
  );
};

export default AuthPlaceholder;
