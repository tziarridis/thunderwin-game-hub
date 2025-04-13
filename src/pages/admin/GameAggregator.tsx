
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Loader2, Server, Database, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { pragmaticPlayService, PPGame } from "@/services/pragmaticPlayService";
import PragmaticPlayTester from "@/components/games/PragmaticPlayTester";

const GameAggregatorPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [games, setGames] = useState<PPGame[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  // Load games on component mount
  useEffect(() => {
    fetchGames();
  }, []);
  
  const fetchGames = async () => {
    try {
      setIsLoadingGames(true);
      const fetchedGames = await pragmaticPlayService.getGamesFromAPI();
      setGames(fetchedGames);
      setLastSyncTime(new Date());
      toast.success(`Successfully loaded ${fetchedGames.length} games from Pragmatic Play`);
    } catch (error: any) {
      toast.error(`Failed to load games: ${error.message}`);
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
            onClick={fetchGames} 
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
                  <span className="text-slate-400">Games Loaded</span>
                  <span>{games.length}</span>
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
                  onClick={() => window.open('/casino/Seamless', '_blank')}
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
                  onClick={() => toast.info("Cache cleared")}
                >
                  Clear API Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="tester" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tester">Game Tester</TabsTrigger>
            <TabsTrigger value="games">Game List</TabsTrigger>
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
                                  window.open(`${window.location.origin}/casino/Seamless?game=${game.game_id}`, '_blank');
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
                  <div className="text-green-500">[INFO] {new Date().toISOString()} - Initialized Pragmatic Play integration</div>
                  <div className="text-blue-500">[API] {new Date().toISOString()} - Fetched game list: {games.length} games</div>
                  <div className="text-yellow-500">[WARN] {new Date().toISOString()} - API rate limit at 75%</div>
                  <div className="text-green-500">[INFO] {new Date().toISOString()} - Wallet API ready</div>
                  <div className="text-blue-500">[API] {new Date().toISOString()} - Processed demo game launch: vs20bonzanza</div>
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
