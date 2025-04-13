
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, RefreshCw, Database } from "lucide-react";
import WinningRoller from "@/components/casino/WinningRoller";
import { gameAggregatorService } from "@/services/gameAggregatorService";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { availableProviders } from "@/config/gameProviders";

const GameAggregator: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState({
    isRunning: false,
    lastSync: '',
    nextScheduledSync: '',
    status: 'idle',
  });
  
  const [syncResults, setSyncResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("games");
  
  // Fetch initial sync status
  useEffect(() => {
    const fetchSyncStatus = async () => {
      try {
        const status = await gameAggregatorService.getSyncStatus();
        setSyncStatus(status);
      } catch (error) {
        console.error("Error fetching sync status:", error);
      }
    };
    
    fetchSyncStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(fetchSyncStatus, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const handleSyncNow = async () => {
    if (syncStatus.isRunning) {
      toast.info("Sync is already in progress");
      return;
    }
    
    try {
      setSyncStatus(prev => ({ ...prev, isRunning: true, status: 'syncing' }));
      toast.info("Game sync started");
      
      const results = await gameAggregatorService.triggerSync();
      setSyncResults(results);
      
      // Update sync status
      const newStatus = await gameAggregatorService.getSyncStatus();
      setSyncStatus(newStatus);
      
      toast.success("Game sync completed");
    } catch (error) {
      console.error("Error during sync:", error);
      toast.error("Game sync failed");
      setSyncStatus(prev => ({ ...prev, isRunning: false, status: 'error' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Game Aggregator</h1>
        <Button 
          onClick={handleSyncNow} 
          disabled={syncStatus.isRunning}
          className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
        >
          {syncStatus.isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing Games...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Games Now
            </>
          )}
        </Button>
      </div>
      
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-xl">Sync Status</CardTitle>
          <CardDescription>
            Current status of the game aggregator synchronization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 p-3 rounded-md">
              <div className="text-white/70 text-sm mb-1">Status</div>
              <div className="font-semibold flex items-center">
                {syncStatus.status === 'idle' && (
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-400">Idle</Badge>
                )}
                {syncStatus.status === 'syncing' && (
                  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">Syncing</Badge>
                )}
                {syncStatus.status === 'error' && (
                  <Badge variant="outline" className="bg-red-500/20 text-red-400">Error</Badge>
                )}
              </div>
            </div>
            
            <div className="bg-slate-800 p-3 rounded-md">
              <div className="text-white/70 text-sm mb-1">Last Sync</div>
              <div className="font-semibold">
                {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : 'Never'}
              </div>
            </div>
            
            <div className="bg-slate-800 p-3 rounded-md">
              <div className="text-white/70 text-sm mb-1">Next Scheduled Sync</div>
              <div className="font-semibold">
                {syncStatus.nextScheduledSync ? new Date(syncStatus.nextScheduledSync).toLocaleString() : 'Not scheduled'}
              </div>
            </div>
            
            <div className="bg-slate-800 p-3 rounded-md">
              <div className="text-white/70 text-sm mb-1">Configured Providers</div>
              <div className="font-semibold">{availableProviders.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {syncResults && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl">Latest Sync Results</CardTitle>
            <CardDescription>
              Results from the most recent game synchronization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(syncResults.results).map(([providerId, result]: [string, any]) => (
                <div key={providerId} className="bg-slate-800 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <h3 className="font-semibold">{availableProviders.find(p => p.id === providerId)?.name || providerId}</h3>
                      <Badge className="ml-2" variant={result.success ? "default" : "destructive"}>
                        {result.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  
                  {result.success ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/70">Games Added:</span> {result.gamesAdded}
                      </div>
                      <div>
                        <span className="text-white/70">Games Updated:</span> {result.gamesUpdated}
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-400 text-sm">{result.error}</div>
                  )}
                </div>
              ))}
              
              <div className="text-sm text-white/70">
                Sync completed at {new Date(syncResults.timestamp).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Latest Game Winners</CardTitle>
        </CardHeader>
        <CardContent>
          <WinningRoller />
        </CardContent>
      </Card>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="games">
          <GamesList />
        </TabsContent>
        
        <TabsContent value="providers">
          <ProvidersList />
        </TabsContent>
        
        <TabsContent value="stats">
          <GamesStatistics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const GamesList: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Games</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-800 p-6 rounded-md text-center">
          <Database className="h-12 w-12 text-casino-thunder-green mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Game Database Ready</h3>
          <p className="text-white/70 mb-4">
            The game database is ready to be populated. Click the "Sync Games Now" button 
            at the top of the page to fetch games from all configured providers.
          </p>
          <p className="text-sm text-white/50">
            After syncing, you can manage individual games in the Games Management section.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const ProvidersList: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Providers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableProviders.map(provider => (
            <div key={provider.id} className="bg-slate-800 p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{provider.name}</h3>
                <Badge>{provider.currency}</Badge>
              </div>
              <div className="text-sm text-white/70">
                Provider ID: {provider.id}
              </div>
              <div className="text-sm text-white/70">
                Code: {provider.code}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const GamesStatistics: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-800 p-6 rounded-md text-center">
          <h3 className="text-lg font-semibold mb-2">Statistics Coming Soon</h3>
          <p className="text-white/70">
            Detailed game statistics will be available after syncing games and collecting usage data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameAggregator;
