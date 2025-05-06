
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Ban, Clock, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserGamblingLimits from './UserGamblingLimits';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const ResponsibleGambling = () => {
  const { user } = useAuth();
  
  const handleSelfExclusion = (period: string) => {
    if (period === 'none') {
      toast.success('Self-exclusion period removed');
    } else {
      toast.success(`Self-exclusion period set to ${period}`);
    }
  };
  
  const handleTimeReminderToggle = (enabled: boolean) => {
    if (enabled) {
      toast.success('Time reminders enabled');
    } else {
      toast.success('Time reminders disabled');
    }
  };

  return (
    <Tabs defaultValue="limits" className="w-full">
      <TabsList>
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
              <Select defaultValue="none" onValueChange={handleSelfExclusion}>
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
              <Switch id="time-reminder" onCheckedChange={handleTimeReminderToggle} />
              <Label htmlFor="time-reminder">Enable session time reminders</Label>
            </div>
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
