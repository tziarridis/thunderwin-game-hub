
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Clock, Ban, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ResponsibleGamblingProps {
  userId: string;
}

export const ResponsibleGambling = ({ userId }: ResponsibleGamblingProps) => {
  const { user } = useAuth();
  const [dailyLimit, setDailyLimit] = useState<number>(0);
  const [weeklyLimit, setWeeklyLimit] = useState<number>(0);
  const [monthlyLimit, setMonthlyLimit] = useState<number>(0);
  const [selfExclusionPeriod, setSelfExclusionPeriod] = useState<string>('none');
  const [timeReminder, setTimeReminder] = useState<number>(60);
  const [timeReminderEnabled, setTimeReminderEnabled] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const handleSaveLimits = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          daily_deposit_limit: dailyLimit,
          weekly_deposit_limit: weeklyLimit,
          monthly_deposit_limit: monthlyLimit,
          self_exclusion_until: selfExclusionPeriod !== 'none' 
            ? new Date(Date.now() + getSelfExclusionDays(selfExclusionPeriod) * 24 * 60 * 60 * 1000).toISOString()
            : null,
          time_reminder_minutes: timeReminderEnabled ? timeReminder : null
        });
        
      if (error) throw error;
      
      toast.success('Your responsible gambling settings have been updated');
    } catch (error: any) {
      toast.error('Failed to update settings: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getSelfExclusionDays = (period: string): number => {
    switch (period) {
      case '24h': return 1;
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '6m': return 180;
      case '1y': return 365;
      case 'permanent': return 3650; // 10 years (effectively permanent)
      default: return 0;
    }
  };

  return (
    <Card className="w-full mb-8">
      <CardHeader className="bg-amber-500/10">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle>Responsible Gambling</CardTitle>
        </div>
        <CardDescription>
          Set personal limits and controls to help manage your gameplay
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <div>
          <h3 className="font-medium text-lg mb-2">Deposit Limits</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Set daily, weekly, and monthly deposit limits to control your spending
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily-limit">Daily Limit ($)</Label>
              <Input 
                id="daily-limit" 
                type="number" 
                min="0"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(parseInt(e.target.value) || 0)}
                placeholder="Enter daily limit"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weekly-limit">Weekly Limit ($)</Label>
              <Input 
                id="weekly-limit" 
                type="number"
                min="0" 
                value={weeklyLimit}
                onChange={(e) => setWeeklyLimit(parseInt(e.target.value) || 0)}
                placeholder="Enter weekly limit"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monthly-limit">Monthly Limit ($)</Label>
              <Input 
                id="monthly-limit" 
                type="number"
                min="0" 
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(parseInt(e.target.value) || 0)}
                placeholder="Enter monthly limit"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-lg mb-2">Self-exclusion</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Take a break from gambling by setting a self-exclusion period
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="self-exclusion">Self-exclusion period</Label>
            <Select value={selfExclusionPeriod} onValueChange={setSelfExclusionPeriod}>
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
            
            {selfExclusionPeriod === 'permanent' && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-200 rounded-lg flex items-start">
                <Ban className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  Permanent self-exclusion is a serious step. Your account will be closed and you will not be able to open a new account in the future. Please contact customer support if you need help or want to discuss alternatives.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-lg mb-2">Session Time Limits</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Set up reminders to take breaks during your gaming sessions
          </p>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="time-reminder" 
              checked={timeReminderEnabled}
              onCheckedChange={setTimeReminderEnabled}
            />
            <Label htmlFor="time-reminder">Enable session time reminders</Label>
          </div>
          
          {timeReminderEnabled && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="reminder-time">Remind me every (minutes)</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input 
                  id="reminder-time" 
                  type="number" 
                  min="5"
                  max="240"
                  value={timeReminder}
                  onChange={(e) => setTimeReminder(parseInt(e.target.value) || 60)}
                  className="w-[120px]"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4 border-t pt-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            These responsible gambling tools are designed to help you stay in control of your gaming. 
            Once set, deposit limits cannot be increased for 24 hours. Self-exclusion periods cannot be reversed once set.
          </p>
        </div>
        
        <div className="flex justify-end w-full">
          <Button 
            onClick={handleSaveLimits}
            disabled={isSubmitting}
            className="w-full md:w-auto"
          >
            {isSubmitting ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ResponsibleGambling;
