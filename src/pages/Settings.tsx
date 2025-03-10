
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Settings as SettingsIcon, Moon, Sun, Bell } from 'lucide-react';
import Button from '@/components/Button';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast({
      title: `${!darkMode ? 'Dark' : 'Light'} mode activated`,
      description: `App theme has been changed to ${!darkMode ? 'dark' : 'light'} mode`,
    });
  };
  
  const toggleNotifications = () => {
    setNotifications(!notifications);
    toast({
      title: `Notifications ${!notifications ? 'enabled' : 'disabled'}`,
      description: `You will ${!notifications ? 'now' : 'no longer'} receive notifications`,
    });
  };
  
  const settingsSections = [
    {
      id: 'profile',
      name: 'Profile',
      icon: User,
      description: 'Update your profile information',
      action: () => navigate('/profile'),
    },
    {
      id: 'password',
      name: 'Password Reset',
      icon: Lock,
      description: 'Change your password',
      action: () => {
        toast({
          title: "Feature coming soon",
          description: "Password reset will be available soon",
        });
      },
    },
  ];
  
  const preferenceSections = [
    {
      id: 'theme',
      name: 'Dark Mode',
      icon: darkMode ? Sun : Moon,
      description: 'Toggle between light and dark mode',
      toggle: true,
      state: darkMode,
      action: toggleDarkMode,
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      description: 'Enable or disable notifications',
      toggle: true,
      state: notifications,
      action: toggleNotifications,
    },
  ];
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Account Settings
          </h2>
          <div className="space-y-4">
            {settingsSections.map((section) => (
              <div 
                key={section.id}
                className="p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={section.action}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md text-primary">
                      <section.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{section.name}</h3>
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            Preferences
          </h2>
          <div className="space-y-4">
            {preferenceSections.map((section) => (
              <div 
                key={section.id}
                className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md text-primary">
                      <section.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{section.name}</h3>
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                  
                  {section.toggle && (
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={section.state}
                        onChange={section.action}
                      />
                      <div className="relative w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
