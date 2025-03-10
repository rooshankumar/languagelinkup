import { useEffect } from "react";
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
import { createClient } from '@supabase/supabase-js'


// Initialize analytics with placeholder tracking ID
// This would be replaced with your actual Google Analytics tracking ID
initializeAnalytics("G-XXXXXXXXXX");

// Supabase client initialization (replace with your actual details)
const supabase = createClient('czubndssgwedqqzlsazn.supabase.co', 'YOUR_SUPABASE_ANON_KEY');

// Function to create the user_languages table if it doesn't exist
async function setupDatabase() {
  try {
    const { data, error } = await supabase.rpc('create_user_languages_table'); // Assumes you have an rpc function for this
    if (error) {
      console.error("Error setting up database:", error);
      throw error; // Re-throw the error to be handled by the caller.
    } else {
      console.log("Database setup successful:", data);
    }

  } catch (error) {
    console.error("Failed to set up the database:", error);
    // Handle the error appropriately (e.g., show an error message to the user).
  }
}


// Page tracker component to handle analytics
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
  </QueryClientProvider>
);

useEffect(() => {
    // Run database setup on app initialization
    setupDatabase().catch(console.error);
  }, []);

export default App;