
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabaseClient';

const Settings = () => {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    chat: true,
    dailyReminders: true,
    spacedRepetition: true
  });
  const [privacy, setPrivacy] = useState({
    messagePermission: 'everyone',
    profileVisibility: 'public',
    twoFactorAuth: false
  });

  const handlePasswordChange = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    // Implement account deletion logic
    toast({
      title: "Warning",
      description: "Please contact support to delete your account",
      variant: "destructive",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <Button 
            variant="destructive" 
            onClick={async () => {
              try {
                await supabase.auth.signOut();
                toast({
                  title: "Success",
                  description: "Logged out successfully"
                });
                navigate('/login');
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to log out",
                  variant: "destructive"
                });
              }
            }}
          >
            Log Out
          </Button>
        </div>

        <TabsContent value="account">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>Change Password</Label>
                <Input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button onClick={handlePasswordChange}>Update Password</Button>
              </div>
              <div className="pt-4 border-t">
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, [key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Who can send you messages?</Label>
                  <select
                    className="w-full p-2 rounded-md border"
                    value={privacy.messagePermission}
                    onChange={(e) => setPrivacy(prev => ({
                      ...prev,
                      messagePermission: e.target.value
                    }))}
                  >
                    <option value="everyone">Everyone</option>
                    <option value="friends">Friends Only</option>
                    <option value="none">No One</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <select
                    className="w-full p-2 rounded-md border"
                    value={privacy.profileVisibility}
                    onChange={(e) => setPrivacy(prev => ({
                      ...prev,
                      profileVisibility: e.target.value
                    }))}
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Two-Factor Authentication</Label>
                  <Switch
                    checked={privacy.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      setPrivacy(prev => ({ ...prev, twoFactorAuth: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add remaining tabs content similarly */}
      </Tabs>
    </div>
  );
};

export default Settings;
