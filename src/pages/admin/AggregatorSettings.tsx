
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Server, Database, Settings, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AggregatorSettings = () => {
  const [apiEndpoint, setApiEndpoint] = useState("https://api.gameprovider.com/v1");
  const [agentId, setAgentId] = useState("thunderwin_casino");
  const [apiToken, setApiToken] = useState("api_key_token_here");
  const [secretKey, setSecretKey] = useState("secret_key_here");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isConnectionValid, setIsConnectionValid] = useState<boolean | null>(null);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState("12");
  const [activeProviders, setActiveProviders] = useState([
    { id: "pragmatic", name: "Pragmatic Play", active: true },
    { id: "evolution", name: "Evolution Gaming", active: true },
    { id: "netent", name: "NetEnt", active: true },
    { id: "playtech", name: "Playtech", active: false },
    { id: "microgaming", name: "Microgaming", active: true },
    { id: "blueprint", name: "Blueprint Gaming", active: false }
  ]);

  const handleSaveSettings = () => {
    // In a real application, we would save these settings to the backend
    toast.success("Aggregator settings saved successfully");
  };

  const handleTestConnection = () => {
    setIsTestingConnection(true);
    setIsConnectionValid(null);
    
    // Simulate API connection test
    setTimeout(() => {
      // In a real app, this would be an actual API call
      const success = Math.random() > 0.2; // 80% success rate for demo
      setIsTestingConnection(false);
      setIsConnectionValid(success);
      
      if (success) {
        toast.success("Connection successful to the aggregator API!");
      } else {
        toast.error("Connection failed. Please check your credentials.");
      }
    }, 2000);
  };

  const toggleProviderActive = (providerId: string) => {
    setActiveProviders(prev => 
      prev.map(provider => 
        provider.id === providerId ? { ...provider, active: !provider.active } : provider
      )
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Game Aggregator Settings</h1>
        <Button 
          className="bg-casino-thunder-green hover:bg-casino-thunder-green/80 text-black"
          onClick={handleSaveSettings}
        >
          Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="api">
            <Server className="mr-2 h-4 w-4" />
            API Configuration
          </TabsTrigger>
          <TabsTrigger value="providers">
            <Database className="mr-2 h-4 w-4" />
            Game Providers
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general settings for the game aggregator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Platform Name</Label>
                  <Input id="name" placeholder="Enter platform name" defaultValue="ThunderWin Casino" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select defaultValue="EUR">
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                      <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                      <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Default Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
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
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="UTC">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                      <SelectItem value="CST">Central Time (CST)</SelectItem>
                      <SelectItem value="MST">Mountain Time (MST)</SelectItem>
                      <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Automatic Game Synchronization</h3>
                    <p className="text-sm text-slate-400">Automatically sync games from providers</p>
                  </div>
                  <Switch checked={autoSync} onCheckedChange={setAutoSync} />
                </div>
                
                {autoSync && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="syncInterval">Sync Interval (hours)</Label>
                      <Select value={syncInterval} onValueChange={setSyncInterval}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Every hour</SelectItem>
                          <SelectItem value="6">Every 6 hours</SelectItem>
                          <SelectItem value="12">Every 12 hours</SelectItem>
                          <SelectItem value="24">Every 24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Configure API settings for the game aggregator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiEndpoint">API Endpoint</Label>
                  <Input 
                    id="apiEndpoint" 
                    placeholder="Enter API endpoint" 
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agentId">Agent ID</Label>
                  <Input 
                    id="agentId" 
                    placeholder="Enter agent ID" 
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiToken">API Token</Label>
                  <Input 
                    id="apiToken" 
                    placeholder="Enter API token" 
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    type="password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secretKey">Secret Key</Label>
                  <Input 
                    id="secretKey" 
                    placeholder="Enter secret key" 
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    type="password"
                  />
                </div>
              </div>
              
              {isConnectionValid !== null && (
                <div className={`p-4 rounded-md ${isConnectionValid ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <div className="flex items-center">
                    {isConnectionValid ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span>
                      {isConnectionValid 
                        ? 'Connection successful! Your API credentials are valid.' 
                        : 'Connection failed. Please check your API credentials and try again.'}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 mt-4">
                <Button 
                  onClick={handleSaveSettings}
                  className="bg-casino-thunder-green hover:bg-casino-thunder-green/80 text-black"
                >
                  Save API Settings
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Game Providers</CardTitle>
              <CardDescription>Manage which game providers are active in your casino.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeProviders.map(provider => (
                  <div key={provider.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <h3 className="font-medium">{provider.name}</h3>
                      <p className="text-sm text-slate-400">Provider ID: {provider.id}</p>
                    </div>
                    <Switch 
                      checked={provider.active} 
                      onCheckedChange={() => toggleProviderActive(provider.id)} 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security settings for the game aggregator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                  <Input id="ipWhitelist" placeholder="Enter IP whitelist (comma separated)" defaultValue="127.0.0.1, 192.168.1.1" />
                  <p className="text-xs text-slate-400 mt-1">Separate multiple IPs with commas. Leave empty to allow all IPs.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rateLimiting">Rate Limiting (requests per minute)</Label>
                  <Input id="rateLimiting" placeholder="Enter rate limit" defaultValue="500" type="number" />
                </div>
                
                <div className="space-y-3 pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Enable SSL Verification</h3>
                      <p className="text-sm text-slate-400">Enforce SSL certificate validation</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">IP Geolocation Filtering</h3>
                      <p className="text-sm text-slate-400">Filter requests based on country</p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Request Logging</h3>
                      <p className="text-sm text-slate-400">Log all API requests</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                </div>
              </div>
              
              <Button 
                className="bg-casino-thunder-green hover:bg-casino-thunder-green/80 text-black"
                onClick={handleSaveSettings}
              >
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AggregatorSettings;
