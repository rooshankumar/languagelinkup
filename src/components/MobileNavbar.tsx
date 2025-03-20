import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Globe, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

const MobileNavbar = () => {
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
      label: 'Settings',
      icon: Settings,
      href: '/settings',
    },
    
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href));

          return (
            <div key={item.label} className="flex flex-col items-center justify-center w-full h-full transition-colors">
              {item.href ? (
                <Link
                  to={item.href}
                  className={cn(
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              ) : (
                <button
                  onClick={item.onClick}
                  className={cn(
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileNavbar;