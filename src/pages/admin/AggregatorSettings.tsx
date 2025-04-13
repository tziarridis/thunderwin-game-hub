
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Server, Database, Settings, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const AggregatorSettings = () => {
  const [apiEndpoint, setApiEndpoint] = useState("https://apipg.slotgamesapi.com");
  const [agentId, setAgentId] = useState("captaingambleEUR");
  const [apiToken, setApiToken] = useState("275c535c8c014b59bedb2a2d6fe7d37b");
  const [secretKey, setSecretKey] = useState("bbd0551e144c46d19975f985e037c9b0");

  const handleSaveSettings = () => {
    // In a real application, we would save these settings to the backend
    toast.success("Aggregator settings saved successfully");
  };

  const handleTestConnection = () => {
    toast.success("Connection successful to the aggregator API!");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Aggregator Settings</h1>
        <div className="flex space-x-2">
          <Link to="/casino/gitslotpark-seamless" target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Seamless Wallet
            </Button>
          </Link>
        </div>
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
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="mr-2 h-4 w-4" />
            Database
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general settings for the game aggregator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Platform Name</Label>
                  <Input id="name" placeholder="Enter platform name" defaultValue="ThunderWin Casino" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Input id="currency" placeholder="Enter default currency" defaultValue="EUR" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Default Language</Label>
                  <Input id="language" placeholder="Enter default language" defaultValue="en" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" placeholder="Enter timezone" defaultValue="UTC" />
                </div>
              </div>
              <Button className="mt-4" onClick={handleSaveSettings}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Configure API settings for the game aggregator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <div className="flex gap-4 mt-4">
                <Button onClick={handleSaveSettings}>Save API Settings</Button>
                <Button variant="outline" onClick={handleTestConnection}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Test Connection
                </Button>
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
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                <Input id="ipWhitelist" placeholder="Enter IP whitelist (comma separated)" defaultValue="127.0.0.1, 192.168.1.1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rateLimiting">Rate Limiting (requests per minute)</Label>
                <Input id="rateLimiting" placeholder="Enter rate limit" defaultValue="500" type="number" />
              </div>
              <Button className="mt-4" onClick={handleSaveSettings}>Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Database Settings</CardTitle>
              <CardDescription>Configure database settings for the game aggregator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dbHost">Database Host</Label>
                <Input id="dbHost" placeholder="Enter database host" defaultValue="localhost" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbName">Database Name</Label>
                <Input id="dbName" placeholder="Enter database name" defaultValue="game_aggregator" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbUser">Database User</Label>
                <Input id="dbUser" placeholder="Enter database user" defaultValue="admin" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbPassword">Database Password</Label>
                <Input id="dbPassword" placeholder="Enter database password" type="password" defaultValue="password" />
              </div>
              <Button className="mt-4" onClick={handleSaveSettings}>Save Database Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AggregatorSettings;
