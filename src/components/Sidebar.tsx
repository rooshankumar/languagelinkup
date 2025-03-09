
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MessageCircle, Globe, Settings, User, LogOut, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    {
      label: 'Messages',
      icon: MessageCircle,
      href: '/chats',
    },
    {
      label: 'Community',
      icon: Globe,
      href: '/community',
    },
    {
      label: 'Dashboard',
      icon: Languages,
      href: '/dashboard',
    },
    {
      label: 'Profile',
      icon: User,
      href: '/profile',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
    },
  ];
  
  const handleLogout = async () => {
    try {
      // This will connect to your backend logout endpoint later
      console.log('Logging out');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      
      // Navigate to auth page
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className={cn("w-64 bg-sidebar-background border-r border-border fixed top-0 bottom-0 flex flex-col z-40", className)}>
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <Languages className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">LinguaLink</span>
        </Link>
      </div>
      
      <nav className="mt-6 flex-1">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
                          (item.href !== '/' && location.pathname.startsWith(item.href));
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t mt-auto">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-md transition-colors hover:bg-destructive/10 text-destructive"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
