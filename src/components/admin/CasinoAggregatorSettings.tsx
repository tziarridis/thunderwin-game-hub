
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AlertCircle, Save, Settings2, Globe, Key, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProviderSettings {
  name: string;
  enabled: boolean;
  apiEndpoint: string;
  agentId: string;
  secretKey: string;
  callbackUrl: string;
  currency: string;
}

/**
 * Casino Aggregator Settings Component
 * Admin interface for configuring game providers
 */
const CasinoAggregatorSettings = () => {
  // Default settings for Pragmatic Play
  const [ppSettings, setPPSettings] = useState<ProviderSettings>({
    name: "Pragmatic Play",
    enabled: true,
    apiEndpoint: "demo.pragmaticplay.net",
    agentId: "testpartner",
    secretKey: "testsecret",
    callbackUrl: `${window.location.origin}/casino/seamless`,
    currency: "USD"
  });

  // Settings for other providers (can be expanded)
  const [otherProviders, setOtherProviders] = useState<ProviderSettings[]>([
    {
      name: "Evolution Gaming",
      enabled: false,
      apiEndpoint: "",
      agentId: "",
      secretKey: "",
      callbackUrl: `${window.location.origin}/casino/seamless/evolution`,
      currency: "USD"
    },
    {
      name: "NetEnt",
      enabled: false,
      apiEndpoint: "",
      agentId: "",
      secretKey: "",
      callbackUrl: `${window.location.origin}/casino/seamless/netent`,
      currency: "USD"
    }
  ]);

  const [activeTab, setActiveTab] = useState("pragmatic-play");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      // In a real implementation, this would save settings to your backend
      // For now, we'll just simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Provider settings saved successfully");
      
      // In production, you would update your configuration service
      // and potentially restart any affected services
    } catch (error: any) {
      toast.error(`Failed to save settings: ${error.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const updatePPSetting = (key: keyof ProviderSettings, value: any) => {
    setPPSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Casino Game Aggregator Settings</h1>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>

      <Alert variant="warning" className="bg-yellow-900/20 border-yellow-900/50 text-yellow-500">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          These settings affect the integration with game providers. Incorrect settings may cause games to malfunction.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pragmatic-play">Pragmatic Play</TabsTrigger>
          <TabsTrigger value="evolution" disabled={!otherProviders[0].enabled}>Evolution Gaming</TabsTrigger>
          <TabsTrigger value="netent" disabled={!otherProviders[1].enabled}>NetEnt</TabsTrigger>
        </TabsList>

        <TabsContent value="pragmatic-play" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings2 className="mr-2 h-5 w-5" />
                Pragmatic Play Integration
              </CardTitle>
              <CardDescription>
                Configure your Pragmatic Play casino integration settings
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Provider Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable this game provider
                  </p>
                </div>
                <Switch 
                  checked={ppSettings.enabled} 
                  onCheckedChange={(checked) => updatePPSetting('enabled', checked)} 
                />
              </div>

              <div className="pt-4 border-t space-y-4">
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="pp-api-endpoint" className="flex items-center">
                      <Globe className="mr-2 h-4 w-4" />
                      API Endpoint
                    </Label>
                    <Input
                      id="pp-api-endpoint"
                      value={ppSettings.apiEndpoint}
                      onChange={(e) => updatePPSetting('apiEndpoint', e.target.value)}
                      placeholder="e.g. api.pragmaticplay.net"
                    />
                    <p className="text-xs text-muted-foreground">
                      The base URL for Pragmatic Play API requests
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pp-agent-id" className="flex items-center">
                      <Key className="mr-2 h-4 w-4" />
                      Agent ID
                    </Label>
                    <Input
                      id="pp-agent-id"
                      value={ppSettings.agentId}
                      onChange={(e) => updatePPSetting('agentId', e.target.value)}
                      placeholder="Your Pragmatic Play agent ID"
                    />
                    <p className="text-xs text-muted-foreground">
                      Provided by Pragmatic Play
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pp-secret-key" className="flex items-center">
                      <Lock className="mr-2 h-4 w-4" />
                      Secret Key
                    </Label>
                    <Input
                      id="pp-secret-key"
                      type="password"
                      value={ppSettings.secretKey}
                      onChange={(e) => updatePPSetting('secretKey', e.target.value)}
                      placeholder="Your Pragmatic Play secret key"
                    />
                    <p className="text-xs text-muted-foreground">
                      Used for transaction signature verification
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pp-callback-url">
                      Callback URL
                    </Label>
                    <Input
                      id="pp-callback-url"
                      value={ppSettings.callbackUrl}
                      onChange={(e) => updatePPSetting('callbackUrl', e.target.value)}
                      placeholder="https://your-domain.com/api/callbacks/pragmatic"
                    />
                    <p className="text-xs text-muted-foreground">
                      URL that Pragmatic Play will call for transactions
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pp-currency">Currency</Label>
                    <Select 
                      value={ppSettings.currency} 
                      onValueChange={(value) => updatePPSetting('currency', value)}
                    >
                      <SelectTrigger id="pp-currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Default currency for games
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Technical settings for API integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pp-api-version">API Version</Label>
                <Select defaultValue="v1">
                  <SelectTrigger id="pp-api-version">
                    <SelectValue placeholder="Select API version" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v1">Version 1.0</SelectItem>
                    <SelectItem value="v2">Version 2.0 (Beta)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The Pragmatic Play API version to use
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pp-timeout">Request Timeout (ms)</Label>
                <Input
                  id="pp-timeout"
                  type="number"
                  defaultValue={30000}
                  placeholder="30000"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum time to wait for API responses
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="pp-debug" />
                <Label htmlFor="pp-debug">Enable Debug Mode</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolution" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolution Gaming Integration</CardTitle>
              <CardDescription>
                Settings for Evolution Gaming live casino
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="evolution-enabled">Enable Evolution Gaming</Label>
                <Switch 
                  id="evolution-enabled"
                  checked={otherProviders[0].enabled}
                  onCheckedChange={(checked) => {
                    const updated = [...otherProviders];
                    updated[0].enabled = checked;
                    setOtherProviders(updated);
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Enable this provider to configure its settings
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="netent" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>NetEnt Integration</CardTitle>
              <CardDescription>
                Settings for NetEnt games
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="netent-enabled">Enable NetEnt</Label>
                <Switch 
                  id="netent-enabled"
                  checked={otherProviders[1].enabled}
                  onCheckedChange={(checked) => {
                    const updated = [...otherProviders];
                    updated[1].enabled = checked;
                    setOtherProviders(updated);
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Enable this provider to configure its settings
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CasinoAggregatorSettings;
