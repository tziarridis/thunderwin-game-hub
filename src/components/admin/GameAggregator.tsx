
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { gameAggregatorService } from "@/services/gameAggregatorService";
import { gameProviderService } from "@/services/gameProviderService";
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

const GameAggregator = () => {
  const [syncState, setSyncState] = useState({
    isSyncing: false,
    results: null,
    lastSync: null,
    error: null,
    progress: 0
  });
  const [providers, setProviders] = useState([]);
  const [syncStats, setSyncStats] = useState({
    totalGames: 0,
    newGames: 0,
    updatedGames: 0,
    failedProviders: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    // Load providers and sync status on component mount
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Get providers
      const supportedProviders = gameProviderService.getSupportedProviders();
      setProviders(supportedProviders);

      // Get sync status
      const syncStatus = await gameAggregatorService.getSyncStatus();
      setSyncState(prev => ({
        ...prev,
        lastSync: syncStatus.lastSync,
        isSyncing: syncStatus.isRunning
      }));
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load provider data"
      });
    }
  };

  const handleSyncGames = async () => {
    try {
      // Start sync
      setSyncState(prev => ({
        ...prev,
        isSyncing: true,
        progress: 0,
        results: null,
        error: null
      }));

      toast({
        title: "Sync Started",
        description: "Game sync has started. This may take a few moments."
      });

      // Simulate progress for UX purposes
      const progressInterval = setInterval(() => {
        setSyncState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 5, 95)
        }));
      }, 300);

      // Trigger actual sync
      const result = await gameAggregatorService.triggerSync();
      clearInterval(progressInterval);

      // Process results
      if (result.success) {
        // Calculate stats
        const stats = {
          totalGames: 0,
          newGames: 0, 
          updatedGames: 0,
          failedProviders: 0
        };

        Object.values(result.results).forEach((r: any) => {
          if (r.success) {
            stats.newGames += r.gamesAdded;
            stats.updatedGames += r.gamesUpdated;
            stats.totalGames += r.gamesAdded + r.gamesUpdated;
          } else {
            stats.failedProviders++;
          }
        });

        setSyncStats(stats);
        setSyncState({
          isSyncing: false,
          results: result.results,
          lastSync: result.timestamp,
          error: null,
          progress: 100
        });

        toast({
          title: "Sync Complete",
          description: `Added ${stats.newGames} new games, updated ${stats.updatedGames} existing games.`
        });
      } else {
        setSyncState({
          isSyncing: false,
          results: result.results,
          lastSync: syncState.lastSync,
          error: "Sync failed for some providers",
          progress: 100
        });

        toast({
          variant: "destructive",
          title: "Sync Issues",
          description: "Some providers failed to sync. Check details below."
        });
      }
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: error.message || "Unknown error occurred",
        progress: 0
      }));

      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: error.message || "Failed to sync games from providers"
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Game Aggregator</h2>
        <Button 
          onClick={handleSyncGames} 
          disabled={syncState.isSyncing}
          className="flex items-center gap-2"
        >
          {syncState.isSyncing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Syncing Games...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Sync Games
            </>
          )}
        </Button>
      </div>

      {/* Sync Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Status</CardTitle>
          <CardDescription>
            Last synced: {formatDate(syncState.lastSync)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {syncState.isSyncing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Syncing games from providers...</span>
                <span>{syncState.progress}%</span>
              </div>
              <Progress value={syncState.progress} className="h-2" />
            </div>
          )}

          {syncState.results && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                <div className="text-2xl font-bold">{syncStats.totalGames}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Total Games</div>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-500">{syncStats.newGames}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">New Games</div>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-500">{syncStats.updatedGames}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Updated Games</div>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-amber-500">{syncStats.failedProviders}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Failed Providers</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Providers Tab */}
      <Tabs defaultValue="providers">
        <TabsList>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="results">Sync Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="providers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Providers</CardTitle>
              <CardDescription>
                Game providers integrated with your casino
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Games</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell className="font-medium">{provider.name}</TableCell>
                      <TableCell>{provider.code}</TableCell>
                      <TableCell>{provider.currency}</TableCell>
                      <TableCell>{provider.gamesCount || "Unknown"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Results</CardTitle>
              <CardDescription>
                Results from the last synchronization attempt
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!syncState.results ? (
                <div className="text-center py-6 text-slate-500">
                  No sync results available. Run a sync to see results here.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Games Added</TableHead>
                      <TableHead>Games Updated</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(syncState.results).map(([id, result]: [string, any]) => (
                      <TableRow key={id}>
                        <TableCell className="font-medium">
                          {providers.find(p => p.id === id)?.name || id} 
                          ({providers.find(p => p.id === id)?.currency || "Unknown"})
                        </TableCell>
                        <TableCell>
                          {result.success ? (
                            <Badge className="bg-green-50 text-green-700 border-green-200">
                              Success
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              Failed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{result.gamesAdded || 0}</TableCell>
                        <TableCell>{result.gamesUpdated || 0}</TableCell>
                        <TableCell className="text-red-500 text-sm">
                          {result.error || "None"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-slate-500">
                Last sync: {formatDate(syncState.lastSync)}
              </div>
              {syncState.error && (
                <div className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {syncState.error}
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameAggregator;
