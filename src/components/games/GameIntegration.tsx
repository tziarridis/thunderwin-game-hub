
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, GamepadIcon, RefreshCw } from "lucide-react";
import { pragmaticPlayService, PPGame } from "@/services/pragmaticPlayService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";

interface GameIntegrationProps {
  gameId?: string;
  providerName?: string;
  onGameLoad?: () => void;
  onError?: (error: string) => void;
}

const GameIntegration = ({ 
  gameId = "vs20bonzanza", 
  providerName = "Pragmatic Play",
  onGameLoad,
  onError
}: GameIntegrationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [gameList, setGameList] = useState<PPGame[]>([]);
  const [selectedGame, setSelectedGame] = useState(gameId);
  const [gameMode, setGameMode] = useState<'demo' | 'real'>('demo');
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
      
      // If the default game isn't in the list, select the first game
      if (games.length > 0 && !games.some(g => g.game_id === selectedGame)) {
        setSelectedGame(games[0].game_id);
      }
    } catch (error: any) {
      console.error('Error fetching games:', error);
      onError?.(error.message || 'Failed to fetch games');
      
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

  // Function to launch a Pragmatic Play game
  const loadGame = async () => {
    if (gameMode === 'real' && !isAuthenticated) {
      toast.error("Please log in to play with real money");
      return;
    }

    setIsLoading(true);
    try {
      // Get game URL from Pragmatic Play service
      const gameUrl = await pragmaticPlayService.launchGame({
        playerId: isAuthenticated ? user?.id || 'guest' : 'guest',
        gameCode: selectedGame,
        mode: gameMode,
        returnUrl: window.location.href
      });
      
      // Open game in new window
      window.open(gameUrl, '_blank');
      
      toast.success(`${providerName} game launched successfully`);
      
      if (onGameLoad) {
        onGameLoad();
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to load game";
      toast.error(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Card className="bg-casino-thunder-dark rounded-lg border border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center">
            <GamepadIcon className="h-12 w-12 text-casino-thunder-green mb-4" />
            <h3 className="text-lg font-semibold mb-4">Play {providerName} Games</h3>
            
            <div className="w-full max-w-sm space-y-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="game-select">Select Game</Label>
                  {isLoadingGames ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white/50" />
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2" 
                      onClick={fetchGames}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh
                    </Button>
                  )}
                </div>
                <Select value={selectedGame} onValueChange={setSelectedGame}>
                  <SelectTrigger id="game-select" className="bg-slate-800/50 border-slate-700/50">
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
              
              <div className="space-y-2">
                <Label htmlFor="mode-select">Game Mode</Label>
                <RadioGroup value={gameMode} onValueChange={(value) => setGameMode(value as 'demo' | 'real')} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="demo" id="demo-mode" />
                    <Label htmlFor="demo-mode" className="cursor-pointer">Demo Mode</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="real" id="real-mode" />
                    <Label htmlFor="real-mode" className="cursor-pointer">Real Money</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <Button 
              onClick={loadGame} 
              disabled={isLoading || isLoadingGames || !selectedGame}
              className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Game...
                </>
              ) : "Launch Game"}
            </Button>
            
            <div className="mt-4 text-xs text-white/50">
              Provider: {providerName} | {gameList.find(g => g.game_id === selectedGame)?.game_name || selectedGame}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameIntegration;
