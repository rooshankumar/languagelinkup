import { useLocation, useNavigate, Link } from 'react-router-dom';
import { MessageCircle, Globe, Settings, LogOut, Languages, Book, Users, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

const MobileNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      label: 'Dashboard',
      icon: Languages,
      href: '/dashboard',
    },
    {
      label: 'Messages',
      icon: MessageCircle,
      href: '/chats',
    },
    {
      label: 'Community',
      icon: Users,
      href: '/community',
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
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href));

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center space-y-1 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavbar;