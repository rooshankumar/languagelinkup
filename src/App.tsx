import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from './contexts/ThemeContext'; // Added ThemeProvider import
import MobileNavbar from "./components/MobileNavbar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import ChatList from "./pages/ChatList";
import Community from "./pages/Community";
import CommunityList from "./pages/CommunityList";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Blog from "./pages/Blog";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Legal from "./pages/Legal";
import AppLayout from "./components/AppLayout";
import { initializeAnalytics, trackPageView } from "./utils/analytics";
import ResetPassword from "./pages/ResetPassword"; // Importing ResetPassword component
import ConfirmEmail from "./pages/ConfirmEmail"; // Importing ConfirmEmail component
import MagicLink from "./pages/MagicLink"; // Importing MagicLink component

initializeAnalytics("G-XXXXXXXXXX");

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
  const isAuthenticated = true;
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider> {/* Added ThemeProvider */}
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <PageTracker />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/confirm-email" element={<ConfirmEmail />} />
                <Route path="/magic-login" element={<MagicLink />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<Blog />} />
                <Route path="/legal/:page" element={<Legal />} />

                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/chats" element={<ChatList />} />
                  <Route path="/chat/:id" element={<Chat />} />
                  <Route path="/community" element={<Navigate to="/community/list" replace />} />
                  <Route path="/community/list" element={<CommunityList />} />
                  <Route path="/community/:userId" element={<Community />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>

                <Route path="/messages" element={<Navigate to="/chats" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <HideMobileNavInChat />
            </TooltipProvider>
          </ThemeProvider> {/* Added ThemeProvider closing tag */}
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;