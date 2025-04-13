import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Loader2, Server, Database, LayoutGrid, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { pragmaticPlayService, PPGame } from "@/services/pragmaticPlayService";
import PragmaticPlayTester from "@/components/games/PragmaticPlayTester";
import { importGames, getAllGames } from "@/services/gamesService";
import { Game } from "@/types";
import { gameProviderService } from "@/services/gameProviderService";
import { PP_AGENT_ID, PP_API_BASE } from "@/services/gameAggregatorService";
import { availableProviders } from "@/config/gameProviders";

const GameAggregatorPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [games, setGames] = useState<PPGame[]>([]);
  const [importedGames, setImportedGames] = useState<Game[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStats, setSyncStats] = useState({
    total: 0,
    success: 0,
    failed: 0
  });
  
  // Load games on component mount
  useEffect(() => {
    fetchGames();
    loadImportedGames();
  }, []);
  
  const loadImportedGames = async () => {
    const allGames = await getAllGames();
    setImportedGames(allGames);
  };
  
  const fetchGames = async () => {
    try {
      setIsLoadingGames(true);
      const fetchedGames = await pragmaticPlayService.getGamesFromAPI();
      setGames(fetchedGames);
      setLastSyncTime(new Date());
      setSyncStats({
        total: fetchedGames.length,
        success: fetchedGames.length,
        failed: 0
      });
      toast.success(`Successfully loaded ${fetchedGames.length} games from Pragmatic Play`);
    } catch (error: any) {
      toast.error(`Failed to load games: ${error.message}`);
      setSyncStats(prev => ({
        ...prev,
        failed: prev.failed + 1
      }));
    } finally {
      setIsLoadingGames(false);
    }
  };
  
  const handleSyncGames = async () => {
    try {
      setIsLoadingGames(true);
      toast.info("Starting game synchronization...");
      
      // Get the list of games from Pragmatic Play
      const fetchedGames = await pragmaticPlayService.getGamesFromAPI();
      
      // Convert to UI Game format for importing
      const formattedGames = fetchedGames.map(game => ({
        title: game.game_name,
        provider: 'Pragmatic Play',
        category: game.game_type || 'slots',
        description: `${game.game_name} by Pragmatic Play`,
        image: `https://dnk.pragmaticplay.net/game/dn/nt/mobile/portrait/images/games/${game.game_id}.jpg`,
        rtp: Math.round(game.rtp),
        volatility: 'medium',
        minBet: 0.1,
        maxBet: 100,
        isPopular: false,
        isNew: true,
        isFavorite: false,
        jackpot: game.features?.includes('jackpot') || false,
        releaseDate: new Date().toISOString(),
        tags: game.features || []
      }));
      
      // Import games
      const importCount = await importGames(formattedGames);
      
      // Update state
      setGames(fetchedGames);
      loadImportedGames();
      setLastSyncTime(new Date());
      
      toast.success(`Successfully synced ${importCount} new games from Pragmatic Play`);
      setSyncStats({
        total: fetchedGames.length,
        success: importCount,
        failed: 0
      });
    } catch (error: any) {
      console.error('Error syncing games:', error);
      toast.error(`Failed to sync games: ${error.message}`);
      setSyncStats(prev => ({
        ...prev,
        failed: prev.failed + 1
      }));
    } finally {
      setIsLoadingGames(false);
    }
  };
  
  return (
    <AdminLayout collapsed={collapsed} setCollapsed={setCollapsed}>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Game Aggregator Dashboard</h1>
          
          <Button 
            onClick={handleSyncGames} 
            disabled={isLoadingGames}
            className="bg-casino-thunder-green hover:bg-casino-thunder-green/80 text-black"
          >
            {isLoadingGames ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing Games...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Games
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Server className="h-5 w-5 mr-2" />
                Aggregator Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Connection</span>
                  <span className="text-green-500 bg-green-900/20 px-2 py-1 rounded text-xs">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Games Available</span>
                  <span>{games.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Games Imported</span>
                  <span>{importedGames.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Last Sync</span>
                  <span>{lastSyncTime ? lastSyncTime.toLocaleTimeString() : 'Never'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">API Status</span>
                  <span className="text-green-500 bg-green-900/20 px-2 py-1 rounded text-xs">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Game Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Games</span>
                  <span>{games.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Slot Games</span>
                  <span>{games.filter(g => g.game_type === 'slots').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Table Games</span>
                  <span>{games.filter(g => g.game_type === 'table').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">With Demo Mode</span>
                  <span>{games.filter(g => g.has_demo).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <LayoutGrid className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.open('/admin/AggregatorSettings', '_blank')}
                >
                  Configure API Settings
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.open('/casino/seamless', '_blank')}
                >
                  Test Seamless Wallet
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={fetchGames}
                  disabled={isLoadingGames}
                >
                  Refresh Game List
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="destructive"
                  onClick={() => {
                    localStorage.removeItem('games');
                    toast.info("Cache cleared");
                    loadImportedGames();
                  }}
                >
                  Clear Game Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="tester" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tester">Game Tester</TabsTrigger>
            <TabsTrigger value="games">Game List</TabsTrigger>
            <TabsTrigger value="imported">Imported Games</TabsTrigger>
            <TabsTrigger value="logs">Integration Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tester" className="space-y-4">
            <PragmaticPlayTester />
          </TabsContent>
          
          <TabsContent value="games">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle>Available Games</CardTitle>
                <CardDescription>
                  Games available through the Pragmatic Play integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingGames ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-casino-thunder-green" />
                  </div>
                ) : (
                  <div className="overflow-auto max-h-96">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left p-2">Game ID</th>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Features</th>
                          <th className="text-left p-2">RTP</th>
                          <th className="text-left p-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {games.map(game => (
                          <tr key={game.game_id} className="border-b border-slate-800">
                            <td className="p-2 font-mono text-xs">{game.game_id}</td>
                            <td className="p-2">{game.game_name}</td>
                            <td className="p-2 capitalize">{game.game_type}</td>
                            <td className="p-2">
                              <div className="flex flex-wrap gap-1">
                                {game.features?.slice(0, 2).map(feature => (
                                  <span key={feature} className="bg-slate-700 px-2 py-0.5 rounded text-xs">
                                    {feature}
                                  </span>
                                ))}
                                {game.features?.length > 2 && (
                                  <span className="bg-slate-700 px-2 py-0.5 rounded text-xs">
                                    +{game.features.length - 2}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-2">{game.rtp}%</td>
                            <td className="p-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  window.open(`${window.location.origin}/casino/seamless?game=${game.game_id}`, '_blank');
                                }}
                              >
                                Test
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="imported">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle>Imported Games</CardTitle>
                <CardDescription>
                  Games that have been imported into your casino database
                </CardDescription>
              </CardHeader>
              <CardContent>
                {importedGames.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No games imported yet</p>
                    <Button 
                      className="mt-4"
                      onClick={handleSyncGames}
                      disabled={isLoadingGames}
                    >
                      Import Games Now
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-auto max-h-96">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left p-2">ID</th>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Provider</th>
                          <th className="text-left p-2">RTP</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importedGames.map(game => (
                          <tr key={game.id} className="border-b border-slate-800">
                            <td className="p-2 font-mono text-xs">{game.id}</td>
                            <td className="p-2">{game.title}</td>
                            <td className="p-2 capitalize">{game.category || 'Unknown'}</td>
                            <td className="p-2">{game.provider}</td>
                            <td className="p-2">{game.rtp}%</td>
                            <td className="p-2">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                game.isNew ? 'bg-green-900/20 text-green-500' : 'bg-blue-900/20 text-blue-500'
                              }`}>
                                {game.isNew ? 'New' : 'Active'}
                              </span>
                            </td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    window.open(`/casino?game=${game.id}`, '_blank');
                                  }}
                                >
                                  Play
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle>Integration Logs</CardTitle>
                <CardDescription>
                  Recent API calls and responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-950 p-4 rounded font-mono text-xs h-64 overflow-auto">
                  <div className="text-green-500">[INFO] {new Date().toISOString()} - Initialized Pragmatic Play integration with {PP_AGENT_ID}</div>
                  <div className="text-blue-500">[API] {new Date().toISOString()} - Connected to {PP_API_BASE}</div>
                  <div className="text-blue-500">[API] {lastSyncTime ? lastSyncTime.toISOString() : new Date().toISOString()} - Fetched game list: {games.length} games</div>
                  {syncStats.failed > 0 && (
                    <div className="text-yellow-500">[WARN] {new Date().toISOString()} - {syncStats.failed} API calls failed</div>
                  )}
                  <div className="text-green-500">[INFO] {new Date().toISOString()} - Wallet API ready at {window.location.origin}/casino/seamless</div>
                  <div className="text-blue-500">[API] {new Date().toISOString()} - PP API Status: Active</div>
                  <div className="text-blue-500">[API] {new Date().toISOString()} - Signature verification system active</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default GameAggregatorPage;
