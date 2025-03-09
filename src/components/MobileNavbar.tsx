
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Globe, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileNavbar = () => {
  const location = useLocation();
  
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
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileNavbar;
