
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const UserGamblingLimits = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [limits, setLimits] = useState({
    dailyLimit: 0,
    weeklyLimit: 0,
    monthlyLimit: 0
  });

  useEffect(() => {
    const fetchLimits = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('wallets')
          .select('deposit_limit_daily, deposit_limit_weekly, deposit_limit_monthly')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching gambling limits:', error);
        } else if (data) {
          setLimits({
            dailyLimit: data.deposit_limit_daily || 0,
            weeklyLimit: data.deposit_limit_weekly || 0,
            monthlyLimit: data.deposit_limit_monthly || 0
          });
        }
      } catch (err) {
        console.error('Error fetching limits:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLimits();
  }, [user?.id]);

  const handleSaveLimits = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to set limits');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('wallets')
        .update({
          deposit_limit_daily: limits.dailyLimit,
          deposit_limit_weekly: limits.weeklyLimit,
          deposit_limit_monthly: limits.monthlyLimit
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast.success('Gambling limits updated successfully');
    } catch (error: any) {
      console.error('Error saving limits:', error);
      toast.error('Failed to update gambling limits');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Deposit Limits</h3>
        <p className="text-sm text-muted-foreground">
          Set daily, weekly, and monthly deposit limits to help control your gambling.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="daily-limit">Daily Deposit Limit ($)</Label>
          <Input
            id="daily-limit"
            type="number"
            min="0"
            step="1"
            value={limits.dailyLimit}
            onChange={(e) => setLimits({ ...limits, dailyLimit: parseFloat(e.target.value) || 0 })}
            placeholder="Enter daily limit"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="weekly-limit">Weekly Deposit Limit ($)</Label>
          <Input
            id="weekly-limit"
            type="number"
            min="0"
            step="1"
            value={limits.weeklyLimit}
            onChange={(e) => setLimits({ ...limits, weeklyLimit: parseFloat(e.target.value) || 0 })}
            placeholder="Enter weekly limit"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="monthly-limit">Monthly Deposit Limit ($)</Label>
          <Input
            id="monthly-limit"
            type="number"
            min="0"
            step="1"
            value={limits.monthlyLimit}
            onChange={(e) => setLimits({ ...limits, monthlyLimit: parseFloat(e.target.value) || 0 })}
            placeholder="Enter monthly limit"
          />
        </div>

        <Button onClick={handleSaveLimits} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Limits'
          )}
        </Button>
      </div>

      <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md">
        <p className="text-sm text-amber-800 dark:text-amber-400">
          Note: Changing your deposit limits may not take effect immediately. Some changes may require a cooling-off period before they are applied.
        </p>
      </div>
    </div>
  );
};

export default UserGamblingLimits;
