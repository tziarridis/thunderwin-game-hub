
import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { availableProviders } from "@/config/gameProviders";
import { toast } from "sonner";

const AggregatorSettings = () => {
  const [activeTab, setActiveTab] = React.useState("general");

  const handleSaveSettings = () => {
    toast.success("Aggregator settings saved successfully");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Aggregator Settings</h1>
          <Button 
            onClick={handleSaveSettings}
            className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
          >
            Save Settings
          </Button>
        </div>

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="sync">Sync Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure general settings for the game aggregator
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="auto-sync" className="flex flex-col space-y-1">
                    <span>Auto Sync Games</span>
                    <span className="font-normal text-sm text-white/70">
                      Automatically sync games from providers on a schedule
                    </span>
                  </Label>
                  <Switch id="auto-sync" defaultChecked />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sync-interval">Sync Interval (hours)</Label>
                  <Input id="sync-interval" type="number" defaultValue="24" className="bg-slate-800 border-slate-700" />
                  <p className="text-sm text-white/70">
                    How often to automatically sync games from providers
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="default-mode">Default Game Launch Mode</Label>
                  <Select defaultValue="demo">
                    <SelectTrigger id="default-mode" className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select default mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demo">Demo Mode</SelectItem>
                      <SelectItem value="real">Real Money</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-white/70">
                    The default mode for launching games when not specified
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="max-games">Maximum Games Per Provider</Label>
                  <Input id="max-games" type="number" defaultValue="500" className="bg-slate-800 border-slate-700" />
                  <p className="text-sm text-white/70">
                    Maximum number of games to sync from each provider (0 for unlimited)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle>Provider Settings</CardTitle>
                <CardDescription>
                  Configure which providers are active and their settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableProviders.map(provider => (
                    <div key={provider.id} className="p-4 border border-slate-800 rounded-md">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{provider.name}</h3>
                          <p className="text-sm text-white/70">ID: {provider.id} | Currency: {provider.currency}</p>
                        </div>
                        <Switch id={`provider-${provider.id}`} defaultChecked />
                      </div>
                      
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor={`integration-mode-${provider.id}`}>Integration Mode</Label>
                          <Select defaultValue="auto">
                            <SelectTrigger id={`integration-mode-${provider.id}`} className="bg-slate-800 border-slate-700">
                              <SelectValue placeholder="Select integration mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="auto">Automatic</SelectItem>
                              <SelectItem value="manual">Manual</SelectItem>
                              <SelectItem value="disabled">Disabled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor={`game-limit-${provider.id}`}>Game Limit</Label>
                          <Input id={`game-limit-${provider.id}`} type="number" defaultValue="100" className="bg-slate-800 border-slate-700" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle>Sync Settings</CardTitle>
                <CardDescription>
                  Configure how games are synchronized from providers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="auto-update" className="flex flex-col space-y-1">
                    <span>Auto Update Existing Games</span>
                    <span className="font-normal text-sm text-white/70">
                      Automatically update existing games with new data from providers
                    </span>
                  </Label>
                  <Switch id="auto-update" defaultChecked />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="remove-missing" className="flex flex-col space-y-1">
                    <span>Remove Missing Games</span>
                    <span className="font-normal text-sm text-white/70">
                      Remove games that are no longer available from the provider
                    </span>
                  </Label>
                  <Switch id="remove-missing" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="default-status">Default Game Status</Label>
                  <Select defaultValue="active">
                    <SelectTrigger id="default-status" className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select default status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-white/70">
                    The default status for newly synced games
                  </p>
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="sync-thumbnails" className="flex flex-col space-y-1">
                    <span>Sync Thumbnails</span>
                    <span className="font-normal text-sm text-white/70">
                      Download and store game thumbnails locally
                    </span>
                  </Label>
                  <Switch id="sync-thumbnails" defaultChecked />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="sync-details" className="flex flex-col space-y-1">
                    <span>Sync Game Details</span>
                    <span className="font-normal text-sm text-white/70">
                      Sync detailed game information like RTP, volatility, etc.
                    </span>
                  </Label>
                  <Switch id="sync-details" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AggregatorSettings;
