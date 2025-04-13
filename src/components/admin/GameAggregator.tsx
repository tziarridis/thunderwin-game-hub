
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PragmaticPlayTester from "@/components/games/PragmaticPlayTester";
import GitSlotParkTester from "@/components/games/GitSlotParkTester";
import { useEffect, useState } from "react";
import { getProviderConfig } from "@/config/gameProviders";

/**
 * Game Aggregator component for admin dashboard
 * Allows testing and management of game provider integrations
 */
const GameAggregator = () => {
  const [activeTab, setActiveTab] = useState("pp");
  const [providers, setProviders] = useState<{id: string, name: string}[]>([]);
  
  useEffect(() => {
    // Get unique provider types
    const uniqueProviders = new Set<string>();
    const providerList: {id: string, name: string}[] = [];
    
    Object.entries(getProviderConfig("ppeur") ? { pp: "Pragmatic Play", gsp: "GitSlotPark" } : {})
      .forEach(([key, name]) => {
        if (!uniqueProviders.has(key)) {
          uniqueProviders.add(key);
          providerList.push({ id: key, name });
        }
      });
    
    setProviders(providerList);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Game Aggregator</h1>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pp">Pragmatic Play</TabsTrigger>
          <TabsTrigger value="gsp">GitSlotPark</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
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
                  <p className="text-yellow-500">
                    Note: In a production environment, these settings would be managed securely and not exposed in the client-side application.
                  </p>
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
