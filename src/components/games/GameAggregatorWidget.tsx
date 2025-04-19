
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { gameAggregatorApiService, GameInfo } from "@/services/gameAggregatorApiService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Play, Database, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const GameAggregatorWidget = () => {
  const [activeTab, setActiveTab] = useState("games");
  const [games, setGames] = useState<GameInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null);
  const [gameMode, setGameMode] = useState<'demo' | 'real'>('demo');
  const [isLaunching, setIsLaunching] = useState(false);
  const { isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    fetchGames();
  }, []);
  
  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const response = await gameAggregatorApiService.getGamesList();
      if (response.success && response.data?.games) {
        setGames(response.data.games);
      } else {
        toast.error("Failed to load games");
      }
    } catch (error: any) {
      console.error("Error fetching games:", error);
      toast.error(error.message || "Failed to load games");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGameSelect = (game: GameInfo) => {
    setSelectedGame(game);
  };
  
  const handleLaunchGame = async () => {
    if (!selectedGame) {
      toast.error("Please select a game first");
      return;
    }
    
    if (gameMode === 'real' && !isAuthenticated) {
      toast.error("Please log in to play in real money mode");
      return;
    }
    
    setIsLaunching(true);
    try {
      const gameUrl = await gameAggregatorApiService.launchGame({
        gameId: selectedGame.id,
        playerId: isAuthenticated ? user?.id || 'guest' : 'guest',
        mode: gameMode,
        returnUrl: window.location.href
      });
      
      window.open(gameUrl, '_blank');
      toast.success(`Launched ${selectedGame.name} successfully!`);
    } catch (error: any) {
      console.error("Error launching game:", error);
      toast.error(error.message || "Failed to launch game");
    } finally {
      setIsLaunching(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="games">
            <Play className="mr-2 h-4 w-4" />
            Games
          </TabsTrigger>
          <TabsTrigger value="integration">
            <Database className="mr-2 h-4 w-4" />
            Integration
          </TabsTrigger>
          <TabsTrigger value="api-tester">
            <Search className="mr-2 h-4 w-4" />
            API Tester
          </TabsTrigger>
        </TabsList>
        
        {/* Games Tab */}
        <TabsContent value="games">
          <Card>
            <CardHeader>
              <CardTitle>Available Games</CardTitle>
              <CardDescription>
                Browse and launch games from our aggregator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {isLoading ? (
                      <div className="col-span-full flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-white/70" />
                      </div>
                    ) : games.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-white/70">
                        No games available
                      </div>
                    ) : (
                      games.map((game) => (
                        <Card 
                          key={game.id}
                          className={`cursor-pointer border transition-all duration-200 hover:border-blue-500 ${
                            selectedGame?.id === game.id ? 'border-blue-500 ring-2 ring-blue-500' : ''
                          }`}
                          onClick={() => handleGameSelect(game)}
                        >
                          <CardContent className="p-3">
                            <div className="aspect-video bg-slate-800 rounded mb-2 flex items-center justify-center">
                              {game.thumbnailUrl ? (
                                <img 
                                  src={game.thumbnailUrl} 
                                  alt={game.name} 
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <div className="text-sm text-white/50">{game.name}</div>
                              )}
                            </div>
                            <p className="font-medium truncate">{game.name}</p>
                            <div className="flex justify-between text-xs text-white/70">
                              <span>{game.provider}</span>
                              <span>{game.category}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
                
                <div>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Launch Game</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedGame ? (
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-bold text-lg mb-1">{selectedGame.name}</h3>
                            <p className="text-sm text-white/70">{selectedGame.provider}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="game-mode">Game Mode</Label>
                            <Select 
                              defaultValue={gameMode} 
                              onValueChange={(value) => setGameMode(value as 'demo' | 'real')}
                            >
                              <SelectTrigger id="game-mode">
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="demo">Demo Mode</SelectItem>
                                <SelectItem value="real">Real Money</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            {gameMode === 'real' && !isAuthenticated && (
                              <p className="text-yellow-500 text-xs">
                                You need to log in to play with real money
                              </p>
                            )}
                          </div>
                          
                          <Button 
                            onClick={handleLaunchGame} 
                            disabled={isLaunching || (gameMode === 'real' && !isAuthenticated)}
                            className="w-full"
                          >
                            {isLaunching ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Launching...
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Play Now
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="py-4 text-center text-white/70">
                          Select a game to launch
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Integration Tab */}
        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle>Aggregator Integration</CardTitle>
              <CardDescription>
                Documentation and configuration for the game aggregator integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert className="bg-blue-900/20 border-blue-900">
                  <AlertDescription className="text-blue-400">
                    The Game Aggregator API is integrated using the Seamless Wallet protocol according to the 
                    <a href="https://documenter.getpostman.com/view/25695248/2sA3Qy7VR4" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                      API documentation
                    </a>
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Callback Endpoint</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs bg-slate-800 p-2 rounded block overflow-x-auto">
                        {window.location.origin}/api/seamless/aggregator/callback
                      </code>
                      <p className="text-xs text-white/70 mt-2">
                        This endpoint handles incoming wallet transactions from the game providers
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Authentication</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Requests are authenticated using API key and HMAC-SHA256 signatures
                      </p>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-xs text-white/70">API Key:</span>
                          <span className="text-xs font-mono">********</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-white/70">Secret Key:</span>
                          <span className="text-xs font-mono">********</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Supported Game Providers</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-slate-800 p-3 rounded">
                      <p className="font-semibold">Pragmatic Play</p>
                      <p className="text-xs text-green-400">Integrated</p>
                    </div>
                    <div className="bg-slate-800 p-3 rounded">
                      <p className="font-semibold">PG Soft</p>
                      <p className="text-xs text-green-400">Integrated</p>
                    </div>
                    <div className="bg-slate-800 p-3 rounded">
                      <p className="font-semibold">Evolution</p>
                      <p className="text-xs text-yellow-400">In Progress</p>
                    </div>
                    <div className="bg-slate-800 p-3 rounded">
                      <p className="font-semibold">NetEnt</p>
                      <p className="text-xs text-yellow-400">In Progress</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* API Tester Tab */}
        <TabsContent value="api-tester">
          <Card>
            <CardHeader>
              <CardTitle>API Tester</CardTitle>
              <CardDescription>
                Test API endpoints and wallet callbacks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="endpoint">API Endpoint</Label>
                  <Select defaultValue="/games/list">
                    <SelectTrigger id="endpoint">
                      <SelectValue placeholder="Select endpoint" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="/games/list">GET /games/list</SelectItem>
                      <SelectItem value="/games/launch">POST /games/launch</SelectItem>
                      <SelectItem value="/wallet">POST /wallet</SelectItem>
                      <SelectItem value="/player/balance">GET /player/balance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="request-body">Request Body</Label>
                  <div className="relative mt-1">
                    <div className="h-48 rounded border border-slate-700 bg-slate-800 p-2 overflow-auto">
                      <pre className="text-xs font-mono">
{`{
  "game_id": "game1",
  "player_id": "player123",
  "currency": "USD",
  "mode": "demo"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
                
                <Button>
                  Send Request
                </Button>
                
                <div className="pt-4 border-t border-slate-700">
                  <Label>Response</Label>
                  <div className="mt-1 h-48 rounded border border-slate-700 bg-slate-800 p-2 overflow-auto">
                    <pre className="text-xs font-mono">
{`{
  "success": true,
  "data": {
    "gameUrl": "https://launch.demo-games.com/play?game=game1&token=demo-12345&mode=demo"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameAggregatorWidget;
