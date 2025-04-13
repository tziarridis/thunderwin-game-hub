
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { pragmaticPlayService, PPGame } from "@/services/pragmaticPlayService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Component for testing Pragmatic Play integration
 */
const PragmaticPlayTester = () => {
  const [gameCode, setGameCode] = useState("vs20bonzanza");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [gameList, setGameList] = useState<PPGame[]>([]);
  const [activeTab, setActiveTab] = useState("launch");
  const { isAuthenticated, user } = useAuth();
  
  // Fetch games on component mount
  useEffect(() => {
    fetchGames();
  }, []);
  
  const fetchGames = async () => {
    setIsLoadingGames(true);
    try {
      // Try to fetch games from API
      const games = await pragmaticPlayService.getGamesFromAPI();
      setGameList(games);
      toast.success(`Loaded ${games.length} games from Pragmatic Play`);
    } catch (error: any) {
      toast.error(`Failed to load games: ${error.message}`);
      // Fallback to static list
      const staticGames = pragmaticPlayService.getAvailableGames().map(game => ({
        game_id: game.code,
        game_name: game.name,
        game_type: 'slots',
        platform: ['web', 'mobile'],
        has_demo: true,
        provider: 'Pragmatic Play',
        rtp: 96.5,
        volatility: 'high',
        features: ['freespin', 'bonus'],
        theme: ['fruit', 'classic']
      }));
      setGameList(staticGames);
    } finally {
      setIsLoadingGames(false);
    }
  };
  
  const handleLaunchGame = async () => {
    if (!gameCode) {
      toast.error("Please enter a game code");
      return;
    }
    
    setIsLoading(true);
    try {
      const gameUrl = await pragmaticPlayService.launchGame({
        playerId: isAuthenticated ? user?.id || 'guest' : 'guest',
        gameCode: gameCode,
        mode: 'demo',
        returnUrl: window.location.href
      });
      
      // Open game in new window
      window.open(gameUrl, '_blank');
      toast.success("Game launched successfully!");
    } catch (error: any) {
      toast.error(`Failed to launch game: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // List of popular PP games for quick selection
  const popularGames = [
    { code: 'vs20bonzanza', name: 'Sweet Bonanza' },
    { code: 'vs20doghouse', name: 'The Dog House' },
    { code: 'vs10wolfgold', name: 'Wolf Gold' },
    { code: 'vs20fparty2', name: 'Fruit Party 2' }
  ];
  
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle>Pragmatic Play Tester</CardTitle>
        <CardDescription>
          Test the Pragmatic Play integration by launching games or exploring the available games list
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="launch">Launch Game</TabsTrigger>
            <TabsTrigger value="games">Game List</TabsTrigger>
            <TabsTrigger value="api">API Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="launch" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="game-code">Game Code</Label>
              <Input 
                id="game-code" 
                placeholder="e.g. vs20bonzanza" 
                value={gameCode} 
                onChange={(e) => setGameCode(e.target.value)}
                className="bg-slate-800 border-slate-700"
              />
              <p className="text-xs text-slate-400">
                Enter a Pragmatic Play game code to launch the game
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Quick Select</Label>
              <div className="flex flex-wrap gap-2">
                {popularGames.map(game => (
                  <Button 
                    key={game.code}
                    variant="outline" 
                    size="sm"
                    onClick={() => setGameCode(game.code)}
                    className={gameCode === game.code ? "bg-casino-thunder-green text-black" : ""}
                  >
                    {game.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Select from All Games</Label>
              <Select value={gameCode} onValueChange={setGameCode}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Select a game" />
                </SelectTrigger>
                <SelectContent>
                  {gameList.map(game => (
                    <SelectItem key={game.game_id} value={game.game_id}>
                      {game.game_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleLaunchGame} 
              disabled={isLoading}
              className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Launching...
                </>
              ) : "Launch Game"}
            </Button>
          </TabsContent>
          
          <TabsContent value="games">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Available Games ({gameList.length})</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchGames}
                  disabled={isLoadingGames}
                >
                  {isLoadingGames ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="ml-2">Refresh</span>
                </Button>
              </div>
              
              <div className="bg-slate-950 p-4 rounded-md border border-slate-800 overflow-auto max-h-80">
                {isLoadingGames ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-casino-thunder-green" />
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left p-2">Game ID</th>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">RTP</th>
                        <th className="text-left p-2">Demo</th>
                        <th className="text-left p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gameList.map(game => (
                        <tr key={game.game_id} className="border-b border-slate-800">
                          <td className="p-2 font-mono text-xs">{game.game_id}</td>
                          <td className="p-2">{game.game_name}</td>
                          <td className="p-2 capitalize">{game.game_type}</td>
                          <td className="p-2">{game.rtp}%</td>
                          <td className="p-2">{game.has_demo ? 'Yes' : 'No'}</td>
                          <td className="p-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setGameCode(game.game_id);
                                setActiveTab('launch');
                              }}
                            >
                              Select
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="api">
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-1">API Credentials</h3>
                <div className="bg-slate-950 p-4 rounded-md border border-slate-800">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="font-semibold pr-4 py-1">Agent ID:</td>
                        <td className="font-mono">{PP_AGENT_ID}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-1">API Token:</td>
                        <td className="font-mono">{PP_API_TOKEN.substring(0, 8)}...{PP_API_TOKEN.substring(PP_API_TOKEN.length - 8)}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-1">Secret Key:</td>
                        <td className="font-mono">{PP_SECRET_KEY.substring(0, 8)}...{PP_SECRET_KEY.substring(PP_SECRET_KEY.length - 8)}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-1">Currency:</td>
                        <td>{PP_CURRENCY}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-1">API Base URL:</td>
                        <td className="font-mono">{PP_API_BASE}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">API Endpoints</h3>
                <div className="bg-slate-950 p-4 rounded-md border border-slate-800">
                  <div className="space-y-2">
                    <div>
                      <div className="font-medium">Launch Game (Real Money)</div>
                      <div className="font-mono text-xs">{PP_API_BASE}/v1/launchgame</div>
                    </div>
                    <div>
                      <div className="font-medium">Launch Game (Demo)</div>
                      <div className="font-mono text-xs">{PP_API_BASE}/v1/game/demo/{'{gamecode}'}</div>
                    </div>
                    <div>
                      <div className="font-medium">Get Game List</div>
                      <div className="font-mono text-xs">{PP_API_BASE}/v1/gamelist</div>
                    </div>
                    <div>
                      <div className="font-medium">Seamless Wallet Callback</div>
                      <div className="font-mono text-xs">{window.location.origin}/casino/seamless</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-xs text-slate-400">
          <p>Note: This integration uses real API endpoints with the following credentials:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Agent ID: {PP_AGENT_ID}</li>
            <li>Currency: {PP_CURRENCY}</li>
            <li>Environment: Production</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PragmaticPlayTester;
