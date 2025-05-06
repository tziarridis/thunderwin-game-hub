import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Bell, Shield, Eye, Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserSettingsProps {
  userId: string;
}

export const UserSettings = ({ userId }: UserSettingsProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Default settings
  const [settings, setSettings] = useState({
    notifications: {
      emailMarketing: false,
      promotions: true,
      accountAlerts: true,
      gameNotifications: false,
    },
    privacy: {
      showOnlineStatus: true,
      showPlayingStatus: true,
      publicProfile: false,
    },
    display: {
      darkMode: true,
      hideBalance: false,
      language: 'en',
      timeFormat: '24h',
    },
    gambling: {
      dailyDepositLimit: 100,
      weeklyDepositLimit: 500,
      monthlyDepositLimit: 2000,
      reminderInterval: 60, // minutes
    }
  });
  
  // Fetch user settings from database if available
  useEffect(() => {
    const fetchSettings = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        // Check if we have a 'wallets' table entry with hide_balance field
        const { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .select('hide_balance, currency')
          .eq('user_id', userId)
          .single();
          
        if (walletData) {
          // Update the corresponding setting
          setSettings(prev => ({
            ...prev,
            display: {
              ...prev.display,
              hideBalance: walletData.hide_balance || false,
            }
          }));
        }
        
        // We could check for other tables as they're created
        // For now, we'll use default settings for anything not in database
        
      } catch (error) {
        console.error("Error fetching user settings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [userId]);
  
  const saveSettings = async () => {
    if (!userId) return;
    
    setSaving(true);
    try {
      // Save settings that map to existing tables
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ 
          hide_balance: settings.display.hideBalance 
        })
        .eq('user_id', userId);
      
      if (walletError) throw walletError;
      
      // Other settings would be saved when tables are created
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };
  
  const handleChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-casino-thunder-green" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2 md:mr-0 lg:mr-2" />
              <span className="hidden md:inline-block lg:inline-block">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2 md:mr-0 lg:mr-2" />
              <span className="hidden md:inline-block lg:inline-block">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="display">
              <Eye className="h-4 w-4 mr-2 md:mr-0 lg:mr-2" />
              <span className="hidden md:inline-block lg:inline-block">Display</span>
            </TabsTrigger>
            <TabsTrigger value="gambling">
              <Globe className="h-4 w-4 mr-2 md:mr-0 lg:mr-2" />
              <span className="hidden md:inline-block lg:inline-block">Gambling</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={`notify-${key}`} className="flex-1">
                    {key === 'emailMarketing' ? 'Email marketing' : 
                     key === 'promotions' ? 'Promotions and bonuses' :
                     key === 'accountAlerts' ? 'Account alerts' : 'Game notifications'}
                  </Label>
                  <Switch 
                    id={`notify-${key}`}
                    checked={value} 
                    onCheckedChange={(checked) => handleChange('notifications', key, checked)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(settings.privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={`privacy-${key}`} className="flex-1">
                    {key === 'showOnlineStatus' ? 'Show online status' : 
                     key === 'showPlayingStatus' ? 'Show what game I\'m playing' : 'Public profile'}
                  </Label>
                  <Switch 
                    id={`privacy-${key}`}
                    checked={value} 
                    onCheckedChange={(checked) => handleChange('privacy', key, checked)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="display" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="display-hideBalance" className="flex-1">
                  Hide balance
                </Label>
                <Switch 
                  id="display-hideBalance"
                  checked={settings.display.hideBalance} 
                  onCheckedChange={(checked) => handleChange('display', 'hideBalance', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="display-darkMode" className="flex-1">
                  Dark mode
                </Label>
                <Switch 
                  id="display-darkMode"
                  checked={settings.display.darkMode} 
                  onCheckedChange={(checked) => handleChange('display', 'darkMode', checked)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <Select 
                  value={settings.display.language}
                  onValueChange={(value) => handleChange('display', 'language', value)}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="timeFormat">Time format</Label>
                <Select 
                  value={settings.display.timeFormat}
                  onValueChange={(value) => handleChange('display', 'timeFormat', value)}
                >
                  <SelectTrigger id="timeFormat">
                    <SelectValue placeholder="Select time format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="gambling" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dailyLimit">Daily deposit limit</Label>
                <Input
                  id="dailyLimit"
                  type="number"
                  min="0"
                  value={settings.gambling.dailyDepositLimit}
                  onChange={(e) => handleChange('gambling', 'dailyDepositLimit', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="weeklyLimit">Weekly deposit limit</Label>
                <Input
                  id="weeklyLimit"
                  type="number"
                  min="0"
                  value={settings.gambling.weeklyDepositLimit}
                  onChange={(e) => handleChange('gambling', 'weeklyDepositLimit', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="monthlyLimit">Monthly deposit limit</Label>
                <Input
                  id="monthlyLimit"
                  type="number"
                  min="0"
                  value={settings.gambling.monthlyDepositLimit}
                  onChange={(e) => handleChange('gambling', 'monthlyDepositLimit', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="reminderInterval">Session reminder (minutes)</Label>
                <Select 
                  value={settings.gambling.reminderInterval.toString()}
                  onValueChange={(value) => handleChange('gambling', 'reminderInterval', parseInt(value))}
                >
                  <SelectTrigger id="reminderInterval">
                    <SelectValue placeholder="Select reminder interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Disabled</SelectItem>
                    <SelectItem value="30">Every 30 minutes</SelectItem>
                    <SelectItem value="60">Every 60 minutes</SelectItem>
                    <SelectItem value="120">Every 2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSettings;
