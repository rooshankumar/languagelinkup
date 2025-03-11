import React, { useEffect, createContext, useState, useContext } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import ChatList from "./pages/ChatList";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Blog from "./pages/Blog";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Legal from "./pages/Legal";
import AppLayout from "./components/AppLayout";
import { initializeAnalytics, trackPageView } from "./utils/analytics";
import { supabase } from './lib/supabaseClient';

// Initialize analytics with placeholder tracking ID
initializeAnalytics("G-XXXXXXXXXX");


const UserProfileContext = createContext(null);

const UserProfileProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Fetch user profile data on mount (replace with your actual fetching logic)
    const fetchUserProfile = async () => {
      const { data, error } = await supabase.auth.user();
      if (data) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.id)
          .single();
        if (profileData) setUserProfile(profileData);
        else console.error("Profile not found:", profileError);
      } else console.error("User not authenticated:", error);
    };

    fetchUserProfile();
  }, []);


  const updateUserProfile = async (updatedProfile) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updatedProfile)
      .eq('id', userProfile.id);
    if (data) {
      setUserProfile({...userProfile, ...updatedProfile});
    } else {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <UserProfileContext.Provider value={{ userProfile, updateUserProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};


const useUserProfile = () => useContext(UserProfileContext);


const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProfileProvider> {/* Added UserProfileProvider */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PageTracker />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<Blog />} />
            <Route path="/legal/:page" element={<Legal />} />

            {/* App routes with layout */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/chats" element={<ChatList />} />
              <Route path="/chat/:chatId" element={<Chat />} />
              <Route path="/community" element={<Community />} />
              <Route path="/debug/community" element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  {React.createElement(React.lazy(() => import('./pages/DebugCommunity')))}
                </React.Suspense>
              } />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Redirect /chats to ensure it's the main message page */}
            <Route path="/messages" element={<Navigate to="/chats" replace />} />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </UserProfileProvider> {/* Closed UserProfileProvider */}
  </QueryClientProvider>
);

export default App;