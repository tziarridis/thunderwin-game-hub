
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Palette, ShieldCheck, Server, CreditCard, Bell } from 'lucide-react';

// Mock settings data structure
interface GeneralSettings {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  maintenanceMode: boolean;
}
interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  logoUrl?: string;
}
interface SecuritySettings {
  enable2FA: boolean;
  sessionTimeout: number; // minutes
}
interface APISettings {
  gameProviderApiKey: string;
  paymentGatewayKey: string;
}

const AdminSettings = () => {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    siteName: 'ThunderWin Casino',
    siteUrl: 'https://thunderwin.example.com',
    adminEmail: 'admin@thunderwin.example.com',
    maintenanceMode: false,
  });

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'dark',
    primaryColor: '#34D399', // Emerald 400 as an example
  });
  
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    enable2FA: false,
    sessionTimeout: 30,
  });
  
  const [apiSettings, setApiSettings] = useState<APISettings>({
      gameProviderApiKey: "**********",
      paymentGatewayKey: "**********",
  });


  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeneralSettings({ ...generalSettings, [e.target.name]: e.target.value });
  };
  
  const handleAppearanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppearanceSettings({ ...appearanceSettings, [e.target.name]: e.target.value });
  };
  
  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSecuritySettings({ ...securitySettings, [e.target.name]: value });
  };
  
  const handleApiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiSettings({ ...apiSettings, [e.target.name]: e.target.value });
  };


  const handleSaveSettings = (settingsType: string) => {
    // In a real app, this would call an API to save settings
    console.log(`Saving ${settingsType} settings:`, 
      settingsType === 'general' ? generalSettings : 
      settingsType === 'appearance' ? appearanceSettings :
      settingsType === 'security' ? securitySettings :
      apiSettings
    );
    toast.success(`${settingsType.charAt(0).toUpperCase() + settingsType.slice(1)} settings saved successfully! (Mocked)`);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Admin Settings</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          <TabsTrigger value="general"><Globe className="mr-2 h-4 w-4 inline-block" />General</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4 inline-block" />Appearance</TabsTrigger>
          <TabsTrigger value="security"><ShieldCheck className="mr-2 h-4 w-4 inline-block" />Security</TabsTrigger>
          <TabsTrigger value="api"><Server className="mr-2 h-4 w-4 inline-block" />API Keys</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4 inline-block" />Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage basic site information and operational status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input id="siteName" name="siteName" value={generalSettings.siteName} onChange={handleGeneralChange} />
              </div>
              <div>
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input id="siteUrl" name="siteUrl" type="url" value={generalSettings.siteUrl} onChange={handleGeneralChange} />
              </div>
              <div>
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input id="adminEmail" name="adminEmail" type="email" value={generalSettings.adminEmail} onChange={handleGeneralChange} />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                    id="maintenanceMode" 
                    checked={generalSettings.maintenanceMode} 
                    onCheckedChange={(checked) => setGeneralSettings({...generalSettings, maintenanceMode: checked})}
                />
                <Label htmlFor="maintenanceMode">Enable Maintenance Mode</Label>
              </div>
              <Button onClick={() => handleSaveSettings('general')}>Save General Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                 {/* Basic select, consider using ShadCN Select component */}
                <select id="theme" name="theme" value={appearanceSettings.theme} onChange={(e) => setAppearanceSettings({...appearanceSettings, theme: e.target.value as AppearanceSettings['theme']})} className="w-full p-2 border rounded">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                </select>
              </div>
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <Input id="primaryColor" name="primaryColor" type="color" value={appearanceSettings.primaryColor} onChange={handleAppearanceChange} />
              </div>
               <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input id="logoUrl" name="logoUrl" placeholder="https://example.com/logo.png" value={appearanceSettings.logoUrl || ''} onChange={handleAppearanceChange} />
              </div>
              <Button onClick={() => handleSaveSettings('appearance')}>Save Appearance Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Configure security options for users and the admin panel.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Switch 
                            id="enable2FA" 
                            checked={securitySettings.enable2FA}
                            onCheckedChange={(checked) => setSecuritySettings({...securitySettings, enable2FA: checked})}
                        />
                        <Label htmlFor="enable2FA">Enable Two-Factor Authentication (2FA) for Users</Label>
                    </div>
                    <div>
                        <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                        <Input 
                            id="sessionTimeout" 
                            name="sessionTimeout" 
                            type="number" 
                            value={securitySettings.sessionTimeout} 
                            onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value) || 30})} 
                        />
                    </div>
                    <Button onClick={() => handleSaveSettings('security')}>Save Security Settings</Button>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>API Keys & Integrations</CardTitle>
                    <CardDescription>Manage API keys for third-party services.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="gameProviderApiKey">Game Provider API Key</Label>
                        <Input 
                            id="gameProviderApiKey" 
                            name="gameProviderApiKey" 
                            type="password" 
                            value={apiSettings.gameProviderApiKey} 
                            onChange={handleApiChange} 
                        />
                    </div>
                     <div>
                        <Label htmlFor="paymentGatewayKey">Payment Gateway API Key</Label>
                        <Input 
                            id="paymentGatewayKey" 
                            name="paymentGatewayKey" 
                            type="password" 
                            value={apiSettings.paymentGatewayKey} 
                            onChange={handleApiChange} 
                        />
                    </div>
                    <Button onClick={() => handleSaveSettings('API')}>Save API Settings</Button>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Configure email and platform notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">Notification settings are not yet configurable here. (Placeholder)</p>
                    {/* Example:
                    <div className="flex items-center space-x-2">
                        <Switch id="emailOnNewUser" />
                        <Label htmlFor="emailOnNewUser">Email admin on new user registration</Label>
                    </div>
                    <Button disabled>Save Notification Settings</Button>
                    */}
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default AdminSettings;
