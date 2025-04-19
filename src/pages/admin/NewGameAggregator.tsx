
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { gameAggregatorApiService } from "@/services/gameAggregatorApiService";
import GameAggregatorWidget from "@/components/games/GameAggregatorWidget";
import { Loader2, RotateCw, ChevronRight, ExternalLink, Server, Database, Globe } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const NewGameAggregator = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [syncStats, setSyncStats] = useState({
    totalGames: 0,
    activeProviders: 0,
    lastSyncDate: "",
    nextSyncDate: ""
  });
  
  useEffect(() => {
    fetchSyncStats();
  }, []);
  
  const fetchSyncStats = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch actual data
      // For demo, we'll use mock data
      const mockResponse = await new Promise<any>(resolve => {
        setTimeout(() => {
          resolve({
            totalGames: 246,
            activeProviders: 4,
            lastSyncDate: new Date().toISOString(),
            nextSyncDate: new Date(Date.now() + 3600000).toISOString()
          });
        }, 800);
      });
      
      setSyncStats(mockResponse);
    } catch (error: any) {
      console.error("Error fetching sync stats:", error);
      toast.error(error.message || "Failed to fetch sync stats");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSyncGames = async () => {
    setIsLoading(true);
    toast.info("Starting game sync...");
    
    try {
      // In a real implementation, this would trigger a sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Games synced successfully!");
      fetchSyncStats();
    } catch (error: any) {
      console.error("Error syncing games:", error);
      toast.error(error.message || "Failed to sync games");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Game Aggregator Admin</h1>
        <div className="flex space-x-2">
          <Link to="/casino/aggregator-seamless">
            <Button variant="outline" size="sm">
              <Server className="mr-2 h-4 w-4" />
              Wallet Dashboard
            </Button>
          </Link>
          <Link to="/api/seamless/aggregator/callback" target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Callback Endpoint
            </Button>
          </Link>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">
            <Database className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="games">
            <Globe className="mr-2 h-4 w-4" />
            Game Management
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white/70">Total Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white/70" />
                  ) : (
                    syncStats.totalGames
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white/70">Active Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white/70" />
                  ) : (
                    syncStats.activeProviders
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white/70">Last Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white/70" />
                  ) : (
                    syncStats.lastSyncDate ? new Date(syncStats.lastSyncDate).toLocaleString() : "Never"
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white/70">Next Scheduled Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white/70" />
                  ) : (
                    syncStats.nextSyncDate ? new Date(syncStats.nextSyncDate).toLocaleString() : "Not scheduled"
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Game Aggregator Status</CardTitle>
                  <CardDescription>
                    Overview of the game aggregator integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">API Configuration</h3>
                        <Badge className="bg-green-600 hover:bg-green-700">Connected</Badge>
                      </div>
                      <div className="bg-slate-900 rounded-md p-3 text-sm">
                        <p>
                          <span className="text-white/70">API Endpoint:</span>{" "}
                          <code>https://api.gameaggregator.com</code>
                        </p>
                        <p className="mt-1">
                          <span className="text-white/70">API Version:</span>{" "}
                          <span>v1.0</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold">Provider Status</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center p-2 bg-slate-900 rounded-md">
                          <span>Pragmatic Play</span>
                          <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-900 rounded-md">
                          <span>PG Soft</span>
                          <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-900 rounded-md">
                          <span>NetEnt</span>
                          <Badge className="bg-yellow-600 hover:bg-yellow-700">Pending</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-900 rounded-md">
                          <span>Evolution</span>
                          <Badge className="bg-yellow-600 hover:bg-yellow-700">Pending</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Game Sync</CardTitle>
                  <CardDescription>
                    Manually trigger game synchronization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Alert className="bg-blue-900/20 border-blue-900">
                      <AlertDescription className="text-blue-400">
                        Syncing games will fetch the latest game data from all configured providers
                      </AlertDescription>
                    </Alert>
                    
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700" 
                      disabled={isLoading}
                      onClick={handleSyncGames}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RotateCw className="mr-2 h-4 w-4" />
                          Sync Games Now
                        </>
                      )}
                    </Button>
                    
                    <div className="text-sm text-white/70">
                      Last sync: {isLoading ? (
                        <Loader2 className="inline h-3 w-3 animate-spin text-white/70" />
                      ) : (
                        syncStats.lastSyncDate ? new Date(syncStats.lastSyncDate).toLocaleString() : "Never"
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-4">
                <Link to="/casino/aggregator-seamless" className="w-full">
                  <Button variant="outline" className="w-full">
                    <span>Go to Seamless Wallet Dashboard</span>
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="games">
          <GameAggregatorWidget />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewGameAggregator;
