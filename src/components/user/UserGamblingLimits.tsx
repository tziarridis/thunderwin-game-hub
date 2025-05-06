
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UserGamblingLimitsProps {
  userId: string;
}

export const UserGamblingLimits = ({ userId }: UserGamblingLimitsProps) => {
  const [dailyLimit, setDailyLimit] = useState<number>(0);
  const [weeklyLimit, setWeeklyLimit] = useState<number>(0);
  const [monthlyLimit, setMonthlyLimit] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const handleSaveLimits = async () => {
    setIsSubmitting(true);
    
    try {
      // Here we'd normally save to a database
      // For now, we'll just simulate success
      setTimeout(() => {
        toast.success('Your gambling limits have been updated');
        setIsSubmitting(false);
      }, 1000);
    } catch (error: any) {
      toast.error('Failed to update limits');
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full mb-8">
      <CardHeader className="bg-amber-500/10">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle>Gambling Limits</CardTitle>
        </div>
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
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4 border-t pt-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            These responsible gambling tools are designed to help you stay in control of your gaming. 
            Once set, deposit limits cannot be increased for 24 hours.
          </p>
        </div>
        
        <div className="flex justify-end w-full">
          <Button 
            onClick={handleSaveLimits}
            disabled={isSubmitting}
            className="w-full md:w-auto"
          >
            {isSubmitting ? "Saving..." : "Save Limits"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default UserGamblingLimits;
