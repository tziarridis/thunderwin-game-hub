
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  GlobeLock, 
  Shield, 
  Bell, 
  RefreshCw, 
  DollarSign, 
  Mail, 
  Clock, 
  Save,
  Database,
  Layout
} from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "ThunderWin Casino",
    siteUrl: "https://thunderwin.com",
    supportEmail: "support@thunderwin.com",
    maintenance: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    forcePasswordChange: 90,
    requireTwoFactor: false,
    ipWhitelist: ""
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    loginAlerts: true,
    withdrawalAlerts: true,
    depositAlerts: true,
    maintenanceAlerts: true
  });

  const [limitsSettings, setLimitsSettings] = useState({
    minDeposit: 10,
    maxDeposit: 10000,
    minWithdrawal: 20,
    maxWithdrawal: 5000,
    dailyWithdrawalLimit: 15000
  });

  const [databaseSettings, setDatabaseSettings] = useState({
    backupSchedule: "daily",
    retentionDays: 30,
    compression: true,
    autoCleanup: true
  });

  const [interfaceSettings, setInterfaceSettings] = useState({
    showSportsSection: true,
  });

  const handleGeneralChange = (field: string, value: any) => {
    setGeneralSettings({
      ...generalSettings,
      [field]: value
    });
  };

  const handleSecurityChange = (field: string, value: any) => {
    setSecuritySettings({
      ...securitySettings,
      [field]: value
    });
  };

  const handleNotificationChange = (field: string, value: any) => {
    setNotificationSettings({
      ...notificationSettings,
      [field]: value
    });
  };

  const handleLimitsChange = (field: string, value: any) => {
    setLimitsSettings({
      ...limitsSettings,
      [field]: value
    });
  };

  const handleDatabaseChange = (field: string, value: any) => {
    setDatabaseSettings({
      ...databaseSettings,
      [field]: value
    });
  };

  const handleInterfaceChange = (field: string, value: any) => {
    setInterfaceSettings({
      ...interfaceSettings,
      [field]: value
    });
    
    // Save immediately to localStorage for the interface settings
    localStorage.setItem("backoffice_interface_settings", JSON.stringify({
      ...interfaceSettings,
      [field]: value
    }));
    
    toast.info(`${field === 'showSportsSection' ? 'Sports section' : field} visibility updated.`);
  };

  const saveSettings = () => {
    // In a real implementation, this would save to the backend
    localStorage.setItem("backoffice_general_settings", JSON.stringify(generalSettings));
    localStorage.setItem("backoffice_security_settings", JSON.stringify(securitySettings));
    localStorage.setItem("backoffice_notification_settings", JSON.stringify(notificationSettings));
    localStorage.setItem("backoffice_limits_settings", JSON.stringify(limitsSettings));
    localStorage.setItem("backoffice_database_settings", JSON.stringify(databaseSettings));
    localStorage.setItem("backoffice_interface_settings", JSON.stringify(interfaceSettings));
    
    toast.success("Settings saved successfully");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
          <p className="text-white/60">Configure system-wide settings for the ThunderWin platform</p>
        </div>
        <Button 
          className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
          onClick={saveSettings}
        >
          <Save className="mr-2 h-4 w-4" />
          Save All Settings
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 bg-casino-thunder-dark">
          <TabsTrigger value="general" className="data-[state=active]:bg-casino-thunder-green data-[state=active]:text-black">
            General
          </TabsTrigger>
          <TabsTrigger value="interface" className="data-[state=active]:bg-casino-thunder-green data-[state=active]:text-black">
            Interface
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-casino-thunder-green data-[state=active]:text-black">
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-casino-thunder-green data-[state=active]:text-black">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="limits" className="data-[state=active]:bg-casino-thunder-green data-[state=active]:text-black">
            Limits & Restrictions
          </TabsTrigger>
          <TabsTrigger value="database" className="data-[state=active]:bg-casino-thunder-green data-[state=active]:text-black">
            Database
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="bg-casino-thunder-dark border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <GlobeLock className="mr-2 text-casino-thunder-green" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic configuration settings for the casino platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Casino Name</Label>
                  <Input 
                    id="siteName" 
                    value={generalSettings.siteName}
                    onChange={(e) => handleGeneralChange('siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Casino Website URL</Label>
                  <Input 
                    id="siteUrl" 
                    value={generalSettings.siteUrl}
                    onChange={(e) => handleGeneralChange('siteUrl', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email Address</Label>
                  <Input 
                    id="supportEmail" 
                    value={generalSettings.supportEmail}
                    onChange={(e) => handleGeneralChange('supportEmail', e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="maintenance"
                    checked={generalSettings.maintenance}
                    onCheckedChange={(checked) => handleGeneralChange('maintenance', checked)}
                  />
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setGeneralSettings({
                    siteName: "ThunderWin Casino",
                    siteUrl: "https://thunderwin.com",
                    supportEmail: "support@thunderwin.com",
                    maintenance: false
                  });
                  toast.info("General settings reset to default values");
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset to Default
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Interface Settings */}
        <TabsContent value="interface">
          <Card className="bg-casino-thunder-dark border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Layout className="mr-2 text-casino-thunder-green" />
                Interface Settings
              </CardTitle>
              <CardDescription>
                Configure navigation and visibility of website sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Sports Section</Label>
                    <p className="text-sm text-muted-foreground">Enable or disable the sports betting section of the website</p>
                  </div>
                  <Switch
                    checked={interfaceSettings.showSportsSection}
                    onCheckedChange={(checked) => handleInterfaceChange('showSportsSection', checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setInterfaceSettings({
                    showSportsSection: true
                  });
                  localStorage.setItem("backoffice_interface_settings", JSON.stringify({
                    showSportsSection: true
                  }));
                  toast.info("Interface settings reset to default values");
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset to Default
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="bg-casino-thunder-dark border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Shield className="mr-2 text-casino-thunder-green" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input 
                    id="maxLoginAttempts" 
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => handleSecurityChange('maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input 
                    id="sessionTimeout" 
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forcePasswordChange">Force Password Change (days)</Label>
                  <Input 
                    id="forcePasswordChange" 
                    type="number"
                    value={securitySettings.forcePasswordChange}
                    onChange={(e) => handleSecurityChange('forcePasswordChange', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ipWhitelist">Admin IP Whitelist (comma separated)</Label>
                  <Input 
                    id="ipWhitelist" 
                    placeholder="e.g. 192.168.1.1, 10.0.0.1"
                    value={securitySettings.ipWhitelist}
                    onChange={(e) => handleSecurityChange('ipWhitelist', e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="requireTwoFactor"
                    checked={securitySettings.requireTwoFactor}
                    onCheckedChange={(checked) => handleSecurityChange('requireTwoFactor', checked)}
                  />
                  <Label htmlFor="requireTwoFactor">Require 2FA for Admins</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card className="bg-casino-thunder-dark border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Bell className="mr-2 text-casino-thunder-green" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure email and system notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send email notifications to administrators</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify admins of failed login attempts</p>
                  </div>
                  <Switch
                    checked={notificationSettings.loginAlerts}
                    onCheckedChange={(checked) => handleNotificationChange('loginAlerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Withdrawal Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify admins of large withdrawals</p>
                  </div>
                  <Switch
                    checked={notificationSettings.withdrawalAlerts}
                    onCheckedChange={(checked) => handleNotificationChange('withdrawalAlerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Deposit Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify admins of large deposits</p>
                  </div>
                  <Switch
                    checked={notificationSettings.depositAlerts}
                    onCheckedChange={(checked) => handleNotificationChange('depositAlerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Alerts</Label>
                    <p className="text-sm text-muted-foreground">Send notifications before scheduled maintenance</p>
                  </div>
                  <Switch
                    checked={notificationSettings.maintenanceAlerts}
                    onCheckedChange={(checked) => handleNotificationChange('maintenanceAlerts', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Limits Settings */}
        <TabsContent value="limits">
          <Card className="bg-casino-thunder-dark border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <DollarSign className="mr-2 text-casino-thunder-green" />
                Limits & Restrictions
              </CardTitle>
              <CardDescription>
                Configure deposit and withdrawal limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minDeposit">Minimum Deposit ($)</Label>
                  <Input 
                    id="minDeposit" 
                    type="number"
                    value={limitsSettings.minDeposit}
                    onChange={(e) => handleLimitsChange('minDeposit', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDeposit">Maximum Deposit ($)</Label>
                  <Input 
                    id="maxDeposit" 
                    type="number"
                    value={limitsSettings.maxDeposit}
                    onChange={(e) => handleLimitsChange('maxDeposit', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minWithdrawal">Minimum Withdrawal ($)</Label>
                  <Input 
                    id="minWithdrawal" 
                    type="number"
                    value={limitsSettings.minWithdrawal}
                    onChange={(e) => handleLimitsChange('minWithdrawal', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxWithdrawal">Maximum Withdrawal ($)</Label>
                  <Input 
                    id="maxWithdrawal" 
                    type="number"
                    value={limitsSettings.maxWithdrawal}
                    onChange={(e) => handleLimitsChange('maxWithdrawal', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyWithdrawalLimit">Daily Withdrawal Limit ($)</Label>
                  <Input 
                    id="dailyWithdrawalLimit" 
                    type="number"
                    value={limitsSettings.dailyWithdrawalLimit}
                    onChange={(e) => handleLimitsChange('dailyWithdrawalLimit', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Settings */}
        <TabsContent value="database">
          <Card className="bg-casino-thunder-dark border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Database className="mr-2 text-casino-thunder-green" />
                Database Management
              </CardTitle>
              <CardDescription>
                Configure database backup and maintenance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="backupSchedule">Backup Schedule</Label>
                  <select 
                    id="backupSchedule"
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={databaseSettings.backupSchedule}
                    onChange={(e) => handleDatabaseChange('backupSchedule', e.target.value)}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retentionDays">Retention Period (days)</Label>
                  <Input 
                    id="retentionDays" 
                    type="number"
                    value={databaseSettings.retentionDays}
                    onChange={(e) => handleDatabaseChange('retentionDays', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="compression"
                    checked={databaseSettings.compression}
                    onCheckedChange={(checked) => handleDatabaseChange('compression', checked)}
                  />
                  <Label htmlFor="compression">Enable Compression</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoCleanup"
                    checked={databaseSettings.autoCleanup}
                    onCheckedChange={(checked) => handleDatabaseChange('autoCleanup', checked)}
                  />
                  <Label htmlFor="autoCleanup">Auto Cleanup Old Backups</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => {
                  toast.success("Database backup triggered", {
                    description: "A manual backup has been initiated and will complete shortly."
                  });
                }}
              >
                Run Manual Backup
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
