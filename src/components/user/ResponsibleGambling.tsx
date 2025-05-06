
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const ResponsibleGambling = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    exclusionPeriod: 'none',
    timeReminderEnabled: false,
    reminderIntervalMinutes: 60
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('wallets')
          .select('exclusion_period, exclusion_until, time_reminder_enabled, reminder_interval_minutes')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching responsible gambling settings:', error);
        } else if (data) {
          setSettings({
            exclusionPeriod: data.exclusion_period || 'none',
            timeReminderEnabled: !!data.time_reminder_enabled,
            reminderIntervalMinutes: data.reminder_interval_minutes || 60
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user?.id]);

  const handleSaveSettings = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to set responsible gambling settings');
      return;
    }

    try {
      setSaving(true);
      
      // Calculate exclusion_until date based on the selected period
      let exclusionUntil = null;
      const now = new Date();
      
      if (settings.exclusionPeriod === '24h') {
        exclusionUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      } else if (settings.exclusionPeriod === '7d') {
        exclusionUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      } else if (settings.exclusionPeriod === '30d') {
        exclusionUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else if (settings.exclusionPeriod === '90d') {
        exclusionUntil = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      } else if (settings.exclusionPeriod === '1y') {
        exclusionUntil = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      } else if (settings.exclusionPeriod === 'permanent') {
        exclusionUntil = new Date(2099, 11, 31); // Far future date for permanent exclusion
      }
      
      const { error } = await supabase
        .from('wallets')
        .update({
          exclusion_period: settings.exclusionPeriod,
          exclusion_until: exclusionUntil?.toISOString(),
          time_reminder_enabled: settings.timeReminderEnabled,
          reminder_interval_minutes: settings.reminderIntervalMinutes
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast.success('Responsible gambling settings updated successfully');
      
      if (settings.exclusionPeriod !== 'none') {
        toast.info('Self-exclusion period has been set. You will not be able to play games until the exclusion period ends.');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Failed to update responsible gambling settings');
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
        <h3 className="text-lg font-medium">Responsible Gambling</h3>
        <p className="text-sm text-muted-foreground">
          Control your gambling behavior with these responsible gambling tools.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="exclusion-period">Self-Exclusion Period</Label>
          <Select 
            value={settings.exclusionPeriod}
            onValueChange={(value) => setSettings({ ...settings, exclusionPeriod: value })}
          >
            <SelectTrigger id="exclusion-period">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Exclusion</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
              <SelectItem value="permanent">Permanent</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            Select a period during which you won't be able to access games
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="time-reminder">Reality Check Reminders</Label>
            <Switch 
              id="time-reminder"
              checked={settings.timeReminderEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, timeReminderEnabled: checked })}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Get reminders about how long you've been playing
          </p>
          
          {settings.timeReminderEnabled && (
            <div className="space-y-2">
              <Label>
                Reminder Interval: {settings.reminderIntervalMinutes} minutes
              </Label>
              <Slider 
                min={15}
                max={120}
                step={5}
                value={[settings.reminderIntervalMinutes]}
                onValueChange={(value) => setSettings({ ...settings, reminderIntervalMinutes: value[0] })}
              />
            </div>
          )}
        </div>

        <Button onClick={handleSaveSettings} disabled={saving}>
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

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-400">
          If you believe you may have a gambling problem, please contact a gambling help organization for support and advice.
        </p>
      </div>
    </div>
  );
};

export default ResponsibleGambling;
