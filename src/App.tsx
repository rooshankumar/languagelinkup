import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import MobileNavbar from "./components/MobileNavbar";
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
// Initialize analytics with placeholder tracking ID
// This would be replaced with your actual Google Analytics tracking ID
initializeAnalytics("G-XXXXXXXXXX");

// Using supabase client from supabaseClient.ts
import { supabase } from './lib/supabaseClient';

// No need for special setup since we're using the existing users table


// Page tracker component to handle analytics
const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  return null;
};

const queryClient = new QueryClient();

const HideMobileNavInChat = () => {
  return (
    <Routes>
      <Route path="/chat/*" element={<div className="hidden md:block"><MobileNavbar /></div>} />
      <Route path="*" element={<div className="block"><MobileNavbar /></div>} />
    </Routes>
  );
};

const ProtectedRoute = ({ children }) => {
  // Implement your authentication logic here.  This is a placeholder.
  const isAuthenticated = true; // Replace with actual authentication check
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PageTracker />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<Blog />} />
            <Route path="/legal/:page" element={<Legal />} />

            {/* Protected routes with layout */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/chats" element={<ChatList />} />
              <Route path="/chat/:id" element={<Chat />} />
              <Route path="/community" element={<Community />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Redirect /chats to ensure it's the main message page */}
            <Route path="/messages" element={<Navigate to="/chats" replace />} />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <HideMobileNavInChat />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);


export default App;