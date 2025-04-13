import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, RefreshCw, Database, BarChart2, Tag, Zap, Edit, Trash2, Eye } from "lucide-react";
import WinningRoller from "@/components/casino/WinningRoller";
import { gameAggregatorService } from "@/services/gameAggregatorService";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { availableProviders } from "@/config/gameProviders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import GameForm from "@/components/admin/GameForm";
import { useGames } from "@/hooks/useGames";
import { Game } from "@/types";

const GameAggregator: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState({
    isRunning: false,
    lastSync: '',
    nextScheduledSync: '',
    status: 'idle',
  });
  
  const [syncResults, setSyncResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [syncProgress, setSyncProgress] = useState(0);
  const [currentProvider, setCurrentProvider] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const navigate = useNavigate();
  
  // Use Games hook to connect with Games Management
  const { 
    games, 
    loading, 
    totalGames,
    addGame,
    updateGame,
    deleteGame,
    importGamesFromAggregator
  } = useGames();
  
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
      
      // Show progress for demo
      setSyncProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.floor(Math.random() * 10);
        });
        
        // Simulate provider changes
        setCurrentProvider(availableProviders[Math.floor(Math.random() * availableProviders.length)].name);
      }, 800);
      
      const results = await gameAggregatorService.triggerSync();
      setSyncResults(results);
      
      // Update sync status
      const newStatus = await gameAggregatorService.getSyncStatus();
      setSyncStatus(newStatus);
      
      clearInterval(progressInterval);
      setSyncProgress(100);
      
      // Import synced games to the game management system
      await importGamesFromAggregator();
      
      setTimeout(() => {
        toast.success("Game sync completed successfully and imported to game management");
      }, 500);
    } catch (error) {
      console.error("Error during sync:", error);
      toast.error("Game sync failed");
      setSyncStatus(prev => ({ ...prev, isRunning: false, status: 'error' }));
      setSyncProgress(0);
    }
  };

  const handleViewGame = (gameId: string) => {
    navigate(`/casino/game/${gameId}`);
  };
  
  const handleEditGame = (game: Game) => {
    setSelectedGame(game);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteGame = async (gameId: string) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      try {
        await deleteGame(gameId);
        toast.success("Game deleted successfully");
      } catch (error) {
        console.error("Failed to delete game:", error);
        toast.error("Failed to delete game");
      }
    }
  };
  
  const handleUpdateGame = async (gameData: Game | Omit<Game, 'id'>) => {
    try {
      if ('id' in gameData) {
        await updateGame(gameData as Game);
      } else {
        await addGame(gameData);
      }
      setIsEditDialogOpen(false);
      toast.success("Game updated successfully");
    } catch (error) {
      console.error("Failed to update game:", error);
      toast.error("Failed to update game");
    }
  };
  
  const handleManageGames = () => {
    navigate('/admin/games');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Game Aggregator</h1>
          <p className="text-white/60">Manage game integrations across multiple providers</p>
        </div>
        <div className="flex gap-2">
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
          <Button 
            onClick={handleManageGames}
            className="bg-white/10 hover:bg-white/20"
          >
            Manage Games
          </Button>
        </div>
      </div>
      
      {syncStatus.isRunning && (
        <Card className="border-casino-thunder-green/50 bg-casino-thunder-green/5">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <h3 className="text-lg font-medium">Sync in Progress</h3>
                <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">Active</Badge>
              </div>
              
              <Progress value={syncProgress} className="h-2" />
              
              <div className="flex justify-between text-sm">
                <span>Processing provider: {currentProvider}</span>
                <span>{syncProgress}% complete</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Sync Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
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
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Game Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-800 p-3 rounded-md">
                    <div>
                      <div className="text-white/70 text-sm">Total Games</div>
                      <div className="text-xl font-bold">{totalGames || 4372}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between bg-slate-800 p-3 rounded-md">
                    <div>
                      <div className="text-white/70 text-sm">Active Games</div>
                      <div className="text-xl font-bold">{Math.floor(totalGames * 0.9) || 3891}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between bg-slate-800 p-3 rounded-md">
                    <div>
                      <div className="text-white/70 text-sm">Providers</div>
                      <div className="text-xl font-bold">{availableProviders.length}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Tag className="h-5 w-5 text-purple-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Popular Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Slots</span>
                      <span className="text-sm text-white/70">61%</span>
                    </div>
                    <Progress value={61} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Live Casino</span>
                      <span className="text-sm text-white/70">22%</span>
                    </div>
                    <Progress value={22} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Table Games</span>
                      <span className="text-sm text-white/70">12%</span>
                    </div>
                    <Progress value={12} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Jackpots</span>
                      <span className="text-sm text-white/70">5%</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {syncResults && (
            <Card className="bg-slate-900 border-slate-800 mt-6">
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
                          <h3 className="font-semibold">
                            {availableProviders.find(p => p.id === providerId)?.name || providerId}
                          </h3>
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
          
          <Card className="w-full mt-6">
            <CardHeader>
              <CardTitle className="text-xl">Latest Game Winners</CardTitle>
            </CardHeader>
            <CardContent>
              <WinningRoller />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="games">
          <Card className="bg-slate-800">
            <CardHeader>
              <CardTitle>All Games</CardTitle>
              <CardDescription>
                List of all games from connected providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center my-8">
                  <Loader2 className="h-8 w-8 animate-spin text-casino-thunder-green" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Game ID</TableHead>
                      <TableHead>Game Name</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {games && games.length > 0 ? games.slice(0, 5).map((game, i) => (
                      <TableRow key={game.id}>
                        <TableCell>{game.id}</TableCell>
                        <TableCell>{game.title}</TableCell>
                        <TableCell>
                          {typeof game.provider === 'string' 
                            ? game.provider 
                            : (game.provider as any)?.name || 'Unknown'}
                        </TableCell>
                        <TableCell className="capitalize">{game.category}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            game.isNew 
                              ? "bg-blue-500/20 text-blue-400" 
                              : game.isPopular
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-green-500/20 text-green-400"
                          }>
                            {game.isNew 
                              ? 'New' 
                              : game.isPopular
                                ? 'Popular' 
                                : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleViewGame(game.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleEditGame(game)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500"
                              onClick={() => handleDeleteGame(game.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No games found. Run a sync to import games.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
              <div className="text-center pt-4">
                <Button variant="outline" onClick={handleManageGames}>
                  View All Games
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="providers">
          <Card className="bg-slate-800">
            <CardHeader>
              <CardTitle>Game Providers</CardTitle>
              <CardDescription>
                Connected game providers and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableProviders.map((provider, index) => (
                  <div key={provider.id} className="bg-slate-700 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">{provider.name}</h3>
                      <Badge variant="outline" className={index % 5 === 0 ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}>
                        {index % 5 === 0 ? "Syncing" : "Connected"}
                      </Badge>
                    </div>
                    <div className="text-sm text-white/70 space-y-1">
                      <div>Provider ID: {provider.id}</div>
                      <div>Currency: {provider.currency}</div>
                      <div>Code: {provider.code}</div>
                      <div>Games: {100 + (index * 23) % 900}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card className="bg-slate-800">
            <CardHeader>
              <CardTitle>Game Statistics</CardTitle>
              <CardDescription>
                Player engagement and statistics across providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BarChart2 className="h-16 w-16 text-casino-thunder-green/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Enhanced Statistics View Coming Soon</h3>
                  <p className="text-white/70 max-w-md">
                    Detailed game statistics will be available after syncing games and collecting usage data.
                    Check back after running a complete sync.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Game Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Game</DialogTitle>
          </DialogHeader>
          {selectedGame && (
            <GameForm 
              onSubmit={handleUpdateGame} 
              initialData={selectedGame}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameAggregator;
