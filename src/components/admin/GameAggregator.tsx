
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PragmaticPlayTester from "@/components/games/PragmaticPlayTester";
import GitSlotParkTester from "@/components/games/GitSlotParkTester";
import { useEffect, useState } from "react";
import { getProviderConfig } from "@/config/gameProviders";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Game Aggregator component for admin dashboard
 * Allows testing and management of game provider integrations
 */
const GameAggregator = () => {
  const [activeTab, setActiveTab] = useState("pp");
  const [providers, setProviders] = useState<{id: string, name: string, code: string}[]>([]);
  const [additionalProviders, setAdditionalProviders] = useState<{id: string, name: string, code: string}[]>([]);
  
  useEffect(() => {
    // Get unique provider types
    const uniqueProviders = new Set<string>();
    const providerList: {id: string, name: string, code: string}[] = [];
    const additionalList: {id: string, name: string, code: string}[] = [];
    
    // Get supported providers with available credentials
    const supportedProviders = {
      pp: { name: "Pragmatic Play", code: "PP" },
      gsp: { name: "GitSlotPark", code: "GSP" }
    };
    
    // Check which providers have valid configurations
    Object.entries(supportedProviders).forEach(([key, provider]) => {
      if (!uniqueProviders.has(key)) {
        uniqueProviders.add(key);
        
        // For implemented providers (PP and GSP), check if we have credentials
        const hasConfig = 
          (key === 'pp' && getProviderConfig('ppeur')) || 
          (key === 'gsp' && getProviderConfig('gspeur'));
        
        if (hasConfig) {
          providerList.push({ id: key, name: provider.name, code: provider.code });
        }
      }
    });
    
    // Additional providers that could be integrated
    additionalList.push(
      { id: 'pg', name: 'Play\'n GO', code: 'PG' },
      { id: 'am', name: 'Amatic', code: 'AM' }
    );
    
    setProviders(providerList);
    setAdditionalProviders(additionalList);
    
    // Set default active tab to first provider if available
    if (providerList.length > 0 && !uniqueProviders.has(activeTab)) {
      setActiveTab(providerList[0].id);
    }
  }, [activeTab]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Game Aggregator</h1>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          {providers.map(provider => (
            <TabsTrigger key={provider.id} value={provider.id}>
              {provider.name}
            </TabsTrigger>
          ))}
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Pragmatic Play Integration Tab */}
        <TabsContent value="pp">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pragmatic Play Integration</CardTitle>
                <CardDescription>
                  Test and manage Pragmatic Play games integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PragmaticPlayTester />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* GitSlotPark Integration Tab */}
        <TabsContent value="gsp">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>GitSlotPark Integration</CardTitle>
                <CardDescription>
                  Test and manage GitSlotPark games integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GitSlotParkTester />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Game Provider Settings</CardTitle>
                <CardDescription>
                  Configure game provider integration settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    This section allows you to configure various settings for game provider integrations.
                    You can manage API keys, callback URLs, and other integration settings.
                  </p>
                  
                  <h3 className="text-lg font-semibold mt-4">Integrated Providers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    {providers.map(provider => (
                      <Card key={provider.id} className="bg-slate-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{provider.name}</CardTitle>
                          <CardDescription>Provider Code: {provider.code}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">Status: <span className="text-green-400">Integrated</span></p>
                          <p className="text-sm mt-1">Currency: EUR</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <h3 className="text-lg font-semibold mt-6">Available Providers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    {additionalProviders.map(provider => (
                      <Card key={provider.id} className="bg-slate-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{provider.name}</CardTitle>
                          <CardDescription>Provider Code: {provider.code}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">Status: <span className="text-yellow-400">Not Integrated</span></p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <Alert className="mt-4 bg-yellow-500/10 text-yellow-500 border-yellow-500/50">
                    <AlertDescription>
                      <p className="text-yellow-500">
                        Note: In a production environment, these settings would be managed securely in a server-side database and not exposed in the client-side application.
                      </p>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameAggregator;
