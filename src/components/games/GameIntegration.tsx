
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, GamepadIcon } from "lucide-react";
import { pragmaticPlayService } from "@/services/pragmaticPlayService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import CurrencyLanguageSelector from "@/components/admin/CurrencyLanguageSelector";

interface GameIntegrationProps {
  gameId: string;
  providerName?: string;
  onGameLoad?: () => void;
  onError?: (error: string) => void;
}

const GameIntegration = ({ 
  gameId, 
  providerName = "Pragmatic Play",
  onGameLoad,
  onError
}: GameIntegrationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGameLoaded, setIsGameLoaded] = useState(false);
  const [selectedGame, setSelectedGame] = useState(gameId);
  const [gameMode, setGameMode] = useState<'demo' | 'real'>('demo');
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedPlatform, setPlatform] = useState("web");
  const { isAuthenticated, user } = useAuth();
  
  // Get available PP games
  const availableGames = pragmaticPlayService.getAvailableGames();

  // Function to launch a Pragmatic Play game
  const loadGame = async () => {
    if (gameMode === 'real' && !isAuthenticated) {
      toast.error("Please log in to play with real money");
      return;
    }

    setIsLoading(true);
    try {
      // Create a player ID (either the authenticated user's ID or a guest ID)
      const playerId = isAuthenticated ? user?.id || 'guest' : 'guest';
      
      console.log(`Launching game: ${selectedGame} for player: ${playerId} in ${gameMode} mode`);
      
      // Get game URL from Pragmatic Play service
      const gameUrl = await pragmaticPlayService.launchGame({
        playerId,
        gameCode: selectedGame,
        mode: gameMode,
        returnUrl: window.location.href,
        language: selectedLanguage,
        currency: selectedCurrency,
        platform: selectedPlatform as 'web' | 'mobile'
      });
      
      console.log("Generated game URL:", gameUrl);
      
      // Open game in new window or iframe
      if (gameUrl) {
        const gameWindow = window.open(gameUrl, '_blank');
        
        // Check if window was opened successfully
        if (!gameWindow) {
          throw new Error("Pop-up blocker might be preventing the game from opening. Please allow pop-ups for this site.");
        }
        
        setIsGameLoaded(true);
        toast.success(`${providerName} game launched successfully`);
        
        if (onGameLoad) {
          onGameLoad();
        }
      } else {
        throw new Error("Failed to generate game URL");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to load game";
      console.error("Error launching game:", errorMessage);
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
      <div className="flex flex-col items-center justify-center p-8 bg-casino-thunder-dark rounded-lg border border-white/10">
        <GamepadIcon className="h-12 w-12 text-casino-thunder-green mb-4" />
        <h3 className="text-lg font-semibold mb-4">Play {providerName} Games</h3>
        
        <div className="w-full max-w-sm space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="game-select">Select Game</Label>
            <Select value={selectedGame} onValueChange={setSelectedGame}>
              <SelectTrigger id="game-select">
                <SelectValue placeholder="Select a game" />
              </SelectTrigger>
              <SelectContent>
                {availableGames.map(game => (
                  <SelectItem key={game.code} value={game.code}>
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mode-select">Game Mode</Label>
            <Select value={gameMode} onValueChange={(value) => setGameMode(value as 'demo' | 'real')}>
              <SelectTrigger id="mode-select">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="demo">Demo Mode</SelectItem>
                <SelectItem value="real">Real Money</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="platform-select">Platform</Label>
            <Select value={selectedPlatform} onValueChange={setPlatform}>
              <SelectTrigger id="platform-select">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Desktop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <CurrencyLanguageSelector
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </div>
        
        <Button 
          onClick={loadGame} 
          disabled={isLoading}
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
          Provider: {providerName} | Selected Game: {selectedGame} | Currency: {selectedCurrency} | Language: {selectedLanguage}
        </div>
      </div>
    </div>
  );
};

export default GameIntegration;
