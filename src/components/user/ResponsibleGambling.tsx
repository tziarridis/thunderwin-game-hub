import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Ban, Clock, Info, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserGamblingLimits from './UserGamblingLimits';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

interface SelfExclusionSettings {
  exclusion_period: string | null;
  exclusion_until: string | null;
}

interface SessionSettings {
  time_reminder_enabled: boolean;
  reminder_interval_minutes: number;
}

export const ResponsibleGambling = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selfExclusionSettings, setSelfExclusionSettings] = useState<SelfExclusionSettings>({
    exclusion_period: 'none',
    exclusion_until: null
  });
  const [sessionSettings, setSessionSettings] = useState<SessionSettings>({
    time_reminder_enabled: false,
    reminder_interval_minutes: 60
  });
  
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        // Fetch self exclusion settings
        const { data, error } = await supabase
          .from('wallets')
          .select('exclusion_period, exclusion_until, time_reminder_enabled, reminder_interval_minutes')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          if (error.code !== 'PGRST116') { // Not found error
            console.error("Error fetching responsible gambling settings:", error);
            toast.error("Failed to load settings");
          }
          return;
        }
        
        if (data) {
          setSelfExclusionSettings({
            exclusion_period: data.exclusion_period || 'none',
            exclusion_until: data.exclusion_until || null
          });
          
          setSessionSettings({
            time_reminder_enabled: data.time_reminder_enabled || false,
            reminder_interval_minutes: data.reminder_interval_minutes || 60
          });
        }
      } catch (error: any) {
        console.error("Error fetching responsible gambling settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [user?.id]);
  
  const handleSelfExclusion = async (period: string) => {
    if (!user?.id) {
      toast.error("You must be logged in to set exclusion period");
      return;
    }
    
    try {
      let exclusionUntil: string | null = null;
      
      if (period !== 'none') {
        const now = new Date();
        
        switch (period) {
          case '24h': 
            now.setDate(now.getDate() + 1);
            break;
          case '7d':
            now.setDate(now.getDate() + 7);
            break;
          case '30d':
            now.setDate(now.getDate() + 30);
            break;
          case '90d':
            now.setDate(now.getDate() + 90);
            break;
          case '6m':
            now.setMonth(now.getMonth() + 6);
            break;
          case '1y':
            now.setFullYear(now.getFullYear() + 1);
            break;
          case 'permanent':
            // For permanent exclusion, set date far in future
            now.setFullYear(now.getFullYear() + 100);
            break;
        }
        
        exclusionUntil = now.toISOString();
      }
      
      const { error } = await supabase
        .from('wallets')
        .update({
          exclusion_period: period,
          exclusion_until: exclusionUntil,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setSelfExclusionSettings({
        exclusion_period: period,
        exclusion_until: exclusionUntil
      });
      
      if (period === 'none') {
        toast.success('Self-exclusion period removed');
      } else {
        toast.success(`Self-exclusion period set to ${period}`);
      }
    } catch (error: any) {
      console.error("Error setting exclusion period:", error);
      toast.error('Failed to update exclusion period');
    }
  };
  
  const handleTimeReminderToggle = async (enabled: boolean) => {
    if (!user?.id) {
      toast.error("You must be logged in to update settings");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('wallets')
        .update({
          time_reminder_enabled: enabled,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setSessionSettings(prev => ({
        ...prev,
        time_reminder_enabled: enabled
      }));
      
      if (enabled) {
        toast.success('Time reminders enabled');
      } else {
        toast.success('Time reminders disabled');
      }
    } catch (error: any) {
      console.error("Error updating time reminder settings:", error);
      toast.error('Failed to update reminder settings');
    }
  };
  
  const handleReminderIntervalChange = async (interval: string) => {
    if (!user?.id) return;
    
    const intervalMinutes = parseInt(interval);
    
    try {
      const { error } = await supabase
        .from('wallets')
        .update({
          reminder_interval_minutes: intervalMinutes,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setSessionSettings(prev => ({
        ...prev,
        reminder_interval_minutes: intervalMinutes
      }));
      
      toast.success(`Reminder interval updated to ${intervalMinutes === 0 ? 'disabled' : `${intervalMinutes} minutes`}`);
    } catch (error: any) {
      console.error("Error updating reminder interval:", error);
      toast.error('Failed to update reminder interval');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-casino-thunder-green" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="limits" className="w-full">
      <TabsList className="w-full overflow-x-auto">
        <TabsTrigger value="limits">Deposit Limits</TabsTrigger>
        <TabsTrigger value="exclusion">Self-Exclusion</TabsTrigger>
        <TabsTrigger value="session">Session Limits</TabsTrigger>
        <TabsTrigger value="tips">Responsible Gaming Tips</TabsTrigger>
      </TabsList>
      
      <TabsContent value="limits">
        <UserGamblingLimits userId={user?.id || ''} />
      </TabsContent>
      
      <TabsContent value="exclusion">
        <Card className="w-full">
          <CardHeader className="bg-amber-500/10">
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-amber-500" />
              <CardTitle>Self-exclusion</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Take a break from gambling by setting a self-exclusion period. During this time, you won't be able to access your account.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="self-exclusion">Self-exclusion period</Label>
              <Select 
                value={selfExclusionSettings.exclusion_period || 'none'} 
                onValueChange={handleSelfExclusion}
              >
                <SelectTrigger id="self-exclusion" className="w-full md:w-[240px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No exclusion</SelectItem>
                  <SelectItem value="24h">24 hours</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
                  <SelectItem value="6m">6 months</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selfExclusionSettings.exclusion_until && selfExclusionSettings.exclusion_period !== 'none' && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                <p className="text-sm flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-amber-500" />
                  {selfExclusionSettings.exclusion_period === 'permanent' 
                    ? 'You have permanently excluded yourself from gambling on this platform.' 
                    : `Your exclusion period ends on ${new Date(selfExclusionSettings.exclusion_until).toLocaleDateString()}`
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="session">
        <Card className="w-full">
          <CardHeader className="bg-amber-500/10">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <CardTitle>Session Time Limits</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Set up reminders to take breaks during your gaming sessions
            </p>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="time-reminder" 
                checked={sessionSettings.time_reminder_enabled} 
                onCheckedChange={handleTimeReminderToggle} 
              />
              <Label htmlFor="time-reminder">Enable session time reminders</Label>
            </div>
            
            {sessionSettings.time_reminder_enabled && (
              <div className="mt-4">
                <Label htmlFor="reminder-interval">Reminder interval</Label>
                <Select 
                  value={sessionSettings.reminder_interval_minutes.toString()} 
                  onValueChange={handleReminderIntervalChange}
                >
                  <SelectTrigger id="reminder-interval" className="w-full md:w-[240px] mt-2">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">Every 15 minutes</SelectItem>
                    <SelectItem value="30">Every 30 minutes</SelectItem>
                    <SelectItem value="45">Every 45 minutes</SelectItem>
                    <SelectItem value="60">Every 60 minutes</SelectItem>
                    <SelectItem value="90">Every 90 minutes</SelectItem>
                    <SelectItem value="120">Every 2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="tips">
        <Card className="w-full">
          <CardHeader className="bg-blue-500/10">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              <CardTitle>Responsible Gaming Tips</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <ul className="list-disc pl-5 space-y-2">
              <li>Set a budget before you start playing and stick to it</li>
              <li>Take regular breaks from gambling</li>
              <li>Don't chase losses - accept them as part of the cost of entertainment</li>
              <li>Don't gamble when you're upset, stressed or depressed</li>
              <li>Balance gambling with other leisure activities</li>
              <li>Don't view gambling as a way to make money</li>
            </ul>
            
            <div className="mt-4 pt-4 border-t">
              <p className="font-medium mb-2">Need help?</p>
              <Button variant="outline" className="mr-2">
                Contact Support
              </Button>
              <Button variant="secondary">
                Problem Gambling Resources
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ResponsibleGambling;
