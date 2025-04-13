
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { gameProviderService } from "@/services/gameProviderService";
import { toast } from "sonner";
import { Gamepad, Settings, Server, Database, Globe } from "lucide-react";
import PragmaticPlayTester from "@/components/games/PragmaticPlayTester";

const GameAggregator = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [testMode, setTestMode] = useState<'demo' | 'real'>('demo');
  const [testGameCode, setTestGameCode] = useState("vs20bonzanza");
  const providers = gameProviderService.getSupportedProviders();

  const handleTestGame = async () => {
    try {
      const launchUrl = await gameProviderService.getLaunchUrl({
        gameId: testGameCode,
        providerId: "ppeur", // Default to Pragmatic Play EUR
        mode: testMode,
        playerId: "test_player_" + Date.now()
      });
      
      window.open(launchUrl, "_blank");
      toast.success("Game launched successfully!");
    } catch (error: any) {
      toast.error(`Failed to launch game: ${error.message || "Unknown error"}`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Game Aggregator Management</h1>
        <p className="text-muted-foreground">
          Manage and test game provider integrations, including Pragmatic Play
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            <Gamepad className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="pragmatic">
            <Globe className="mr-2 h-4 w-4" />
            Pragmatic Play
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Provider Settings
          </TabsTrigger>
          <TabsTrigger value="api">
            <Server className="mr-2 h-4 w-4" />
            API Configuration
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="mr-2 h-4 w-4" />
            Game Database
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <Card key={provider.id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>{provider.name}</CardTitle>
                  <CardDescription>Currency: {provider.currency}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Provider Code: {provider.code}</p>
                  <p className="mb-4">Games Count: {provider.gamesCount}</p>
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setActiveTab(provider.code.toLowerCase());
                        if (provider.code === 'PP') setActiveTab('pragmatic');
                      }}
                    >
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pragmatic">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Pragmatic Play Integration</CardTitle>
                <CardDescription>
                  Test and manage Pragmatic Play game integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="game-code">Game Code</Label>
                  <Input 
                    id="game-code" 
                    value={testGameCode}
                    onChange={(e) => setTestGameCode(e.target.value)}
                    placeholder="e.g. vs20bonzanza"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a Pragmatic Play game code to test
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mode">Game Mode</Label>
                  <Select value={testMode} onValueChange={(value) => setTestMode(value as 'demo' | 'real')}>
                    <SelectTrigger id="mode">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demo">Demo Mode</SelectItem>
                      <SelectItem value="real">Real Money Mode</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleTestGame} className="w-full">
                  Launch Test Game
                </Button>

                <div className="mt-4 pt-4 border-t border-slate-700">
                  <h3 className="text-sm font-medium mb-2">Integration Details</h3>
                  <ul className="text-xs space-y-1">
                    <li>Agent ID: captaingambleEUR</li>
                    <li>API Endpoint: apipg.slotgamesapi.com</li>
                    <li>Callback URL: /casino/seamless</li>
                    <li>Currency: EUR</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <PragmaticPlayTester />
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Provider Settings</CardTitle>
              <CardDescription>Configure game provider settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Configure provider-specific settings, credentials, and options.</p>
              <div className="mt-4">
                <Button variant="outline" onClick={() => window.location.href = '/admin/aggregator-settings'}>
                  Go to Provider Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Configure API endpoints and credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="callback-url">Seamless Wallet Callback URL</Label>
                  <Input 
                    id="callback-url" 
                    value="/casino/seamless"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    This is the endpoint where game providers will send transaction callbacks
                  </p>
                </div>
                
                <div className="mt-6">
                  <Button variant="outline" onClick={() => window.location.href = '/casino/seamless'}>
                    View Seamless Integration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Game Database</CardTitle>
              <CardDescription>Manage game database and synchronization</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Configure game database settings and synchronization schedule.
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Last game sync:</span>
                  <span>Never</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total games in database:</span>
                  <span>0</span>
                </div>
                <Button variant="outline">
                  Sync Games from Provider
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameAggregator;
