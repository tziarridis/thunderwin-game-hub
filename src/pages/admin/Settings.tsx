
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { toast } = useToast();
  const [interfaceSettings, setInterfaceSettings] = useState({
    showSportsSection: true,
    theme: 'dark',
    language: 'en',
    maintenanceMode: false,
    registrationEnabled: true,
    depositEnabled: true,
    withdrawalEnabled: true,
  });

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedSettings = localStorage.getItem('backoffice_interface_settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setInterfaceSettings(prev => ({ ...prev, ...parsedSettings }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('backoffice_interface_settings', JSON.stringify(interfaceSettings));
  }, [interfaceSettings]);

  const handleToggleSettings = (key: string, value: boolean) => {
    setInterfaceSettings(prev => ({ ...prev, [key]: value }));
    
    // Show toast notification
    toast({
      title: `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${value ? 'Enabled' : 'Disabled'}`,
      description: `The setting has been successfully updated.`,
    });
  };

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your settings have been successfully saved.',
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Interface Settings</CardTitle>
                <CardDescription>
                  Configure what features are available on the website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-base" htmlFor="showSportsSection">Show Sports Section</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      When disabled, the Sports tab won't appear in the navigation menu
                    </p>
                  </div>
                  <Switch
                    id="showSportsSection"
                    checked={interfaceSettings.showSportsSection}
                    onCheckedChange={(checked) => handleToggleSettings('showSportsSection', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-base" htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      When enabled, site visitors will see a maintenance notice
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={interfaceSettings.maintenanceMode}
                    onCheckedChange={(checked) => handleToggleSettings('maintenanceMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-base" htmlFor="registrationEnabled">Registration</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Allow new users to register on the platform
                    </p>
                  </div>
                  <Switch
                    id="registrationEnabled"
                    checked={interfaceSettings.registrationEnabled}
                    onCheckedChange={(checked) => handleToggleSettings('registrationEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>
                  Basic information about your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input id="siteName" defaultValue="ThunderWin Casino" />
                </div>
                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea 
                    id="siteDescription" 
                    defaultValue="Experience the thrill of online casino gaming with ThunderWin Casino." 
                  />
                </div>
                <div>
                  <Label htmlFor="timeZone">Time Zone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger>
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">Eastern Time (ET)</SelectItem>
                      <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                      <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Button className="mt-6 bg-green-600 hover:bg-green-700" onClick={handleSave}>
            Save Settings
          </Button>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select 
                  defaultValue={interfaceSettings.theme}
                  onValueChange={(value) => setInterfaceSettings(prev => ({ ...prev, theme: value }))}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark Theme</SelectItem>
                    <SelectItem value="light">Light Theme</SelectItem>
                    <SelectItem value="system">System Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="language">Language</Label>
                <Select 
                  defaultValue={interfaceSettings.language}
                  onValueChange={(value) => setInterfaceSettings(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
                Save Appearance Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security options for your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base" htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Require two-factor authentication for admin access
                  </p>
                </div>
                <Switch id="twoFactorAuth" defaultChecked={true} />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base" htmlFor="loginAttempts">Maximum Login Attempts</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Number of failed login attempts before account lockout
                  </p>
                </div>
                <Input id="loginAttempts" className="w-20 text-right" defaultValue="5" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
                Save Security Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure payment options and limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base" htmlFor="depositEnabled">Deposits</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow users to make deposits
                  </p>
                </div>
                <Switch
                  id="depositEnabled"
                  checked={interfaceSettings.depositEnabled}
                  onCheckedChange={(checked) => handleToggleSettings('depositEnabled', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base" htmlFor="withdrawalEnabled">Withdrawals</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow users to make withdrawal requests
                  </p>
                </div>
                <Switch
                  id="withdrawalEnabled"
                  checked={interfaceSettings.withdrawalEnabled}
                  onCheckedChange={(checked) => handleToggleSettings('withdrawalEnabled', checked)}
                />
              </div>
              
              <div>
                <Label htmlFor="minDeposit">Minimum Deposit</Label>
                <div className="flex items-center">
                  <span className="mr-2">$</span>
                  <Input id="minDeposit" className="w-24" defaultValue="10" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="maxWithdrawal">Maximum Withdrawal</Label>
                <div className="flex items-center">
                  <span className="mr-2">$</span>
                  <Input id="maxWithdrawal" className="w-24" defaultValue="10000" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
                Save Payment Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure email and system notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base" htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Send notifications via email
                  </p>
                </div>
                <Switch id="emailNotifications" defaultChecked={true} />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base" htmlFor="pushNotifications">Push Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Send push notifications to users
                  </p>
                </div>
                <Switch id="pushNotifications" defaultChecked={true} />
              </div>
              
              <div>
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input id="supportEmail" defaultValue="support@thunderwin.com" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
                Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
