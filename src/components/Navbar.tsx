
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Languages, LayoutDashboard, MessageSquare, Users, UserCircle, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleLogout = async () => {
    try {
      // This will connect to your backend logout endpoint later
      toast({
        title: "Logged out successfully",
        description: "You have been logged out",
      });
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive"
      });
    }
  };
  
  const navItems = [
    { path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
    { path: '/chats', icon: <MessageSquare className="h-5 w-5" />, label: 'Messages' },
    { path: '/community', icon: <Users className="h-5 w-5" />, label: 'Community' },
    { path: '/profile', icon: <UserCircle className="h-5 w-5" />, label: 'Profile' },
  ];
  
  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <Languages className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">MyLanguage</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors
                  ${isActive(item.path) 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                  }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2
                ${isActive(item.path) 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                }`}
              onClick={closeMenu}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => {
              closeMenu();
              handleLogout();
            }}
            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 text-foreground/70 hover:text-foreground hover:bg-muted"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
