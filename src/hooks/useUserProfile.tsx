import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

interface UserProfileData {
  id: string;
  username: string;
  email: string;
  native_language: string;
  learning_language: string;
  proficiency: string;
  bio: string | null;
  avatar: string | null;
  last_active: string;
  is_online: boolean;
  dob: string | null;
  profile_picture: string | null;
  location?: string;
}

interface UserProfileContextType {
  user: UserProfileData | null;
  loading: boolean;
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfileData>) => Promise<boolean>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (): Promise<void> => {
    setLoading(true);
    try {
      // Get current user
      const { data: authData, error: authError } = await supabase.auth.getSession();

      if (authError) {
        console.log('Authentication error:', authError);
        setUser(null);
        setLoading(false);
        return;
      }

      if (!authData.session) {
        console.log('No active session');
        setUser(null);
        setLoading(false);
        return;
      }

      // Get user profile from database
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.session.user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error.message);
        setUser(null);
      } else if (data) {
        setUser(data);
      }
    } catch (err: any) {
      console.error('Error in user profile fetch:', err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfileData>): Promise<boolean> => {
    if (!user) return false;

    // Update user data in Supabase
    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "Could not update user data.",
        variant: "destructive",
      });
      return false;
    } else {
      // Update local state with the new data
      setUser(prev => prev ? { ...prev, ...data } : null);

      // Set up a subscription to the user's profile
      await fetchUserProfile();
      return true;
    }
  };

  // Set up a subscription to real-time changes
  useEffect(() => {
    fetchUserProfile();

    // Subscribe to changes on the users table
    const subscription = supabase
      .channel('users_changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'users',
        filter: user ? `id=eq.${user.id}` : undefined
      }, payload => {
        if (payload.new) {
          setUser(prev => ({ ...prev, ...payload.new as UserProfileData }));
        }
      })
      .subscribe();

    // Cleanup subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserProfileContext.Provider value={{ user, loading, fetchUserProfile, updateUserProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};