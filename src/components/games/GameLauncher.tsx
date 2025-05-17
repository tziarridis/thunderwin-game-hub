
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
// import { gameAggregatorService } from "@/services/gameAggregatorService"; // Not used directly if launchGame hook is used
import { useGames } from "@/hooks/useGames";
import { Game, GameLaunchOptions } from "@/types"; // Use GameLaunchOptions from main types
import { trackEvent } from "@/utils/analytics";

interface GameLauncherProps {
  game?: Game;
  gameId?: string; // If game object is not available
  gameName?: string; // Fallback name
  buttonText?: string;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  className?: string;
  currency?: string;
  platform?: "web" | "mobile";
  mode?: 'real' | 'demo'; // Add mode prop
}

const GameLauncher = ({
  game,
  gameId,
  gameName: propGameName, // Renamed to avoid conflict
  buttonText = "Play Now",
  variant = "default",
  className = "",
  currency, // Currency can be passed or taken from user context
  platform = "web",
  mode = 'real', // Default to 'real' mode
}: GameLauncherProps) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { launchGame, games, getGameById } = useGames(); 
  
  const handleLaunchGame = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to play games");
      return;
    }
    
    try {
      setIsLaunching(true);
      
      let gameDataToLaunch = game;
      if (!gameDataToLaunch && gameId) {
        // Attempt to find game in context or fetch if not found
        const foundGame = games.find(g => g.id === gameId) || await getGameById(gameId);
        if (!foundGame) {
          toast.error("Game details not found.");
          setIsLaunching(false);
          return;
        }
        gameDataToLaunch = foundGame;
      }

      if (!gameDataToLaunch) {
        toast.error("Game information not provided.");
        setIsLaunching(false);
        return;
      }
      
      const gameTitleForAnalytics = gameDataToLaunch.title || propGameName || "Unknown Game";
      trackEvent('game_launch_click', {
        gameId: gameDataToLaunch.id,
        gameName: gameTitleForAnalytics,
      });
      
      const launchOptions: GameLaunchOptions = {
        mode, 
        playerId: user.id,
        currency: currency || user.currency || 'EUR', // Prioritize prop, then user, then default
        language: 'en', // Default or from user profile
        platform,
        returnUrl: window.location.href
      };
        
      const gameUrl = await launchGame(gameDataToLaunch, launchOptions); 
        
      if (gameUrl) {
        window.open(gameUrl, "_blank");
        toast.success(`Launching ${gameDataToLaunch.title}`);
        trackEvent('game_launch_success', {
          gameId: gameDataToLaunch.id,
          gameName: gameDataToLaunch.title
        });
      } else {
        // Error already toasted by launchGame hook typically
        // If not, uncomment: toast.error("Failed to generate game URL");
      }
    } catch (error: any) {
      console.error("Error launching game:", error);
      toast.error(error.message || "Failed to launch game");
      trackEvent('game_launch_error', {
        gameId: game?.id || gameId || 'unknown',
        error: error.message || "Unknown error"
      });
    } finally {
      setIsLaunching(false);
    }
  };
  
  return (
    <Button 
      onClick={handleLaunchGame} 
      variant={variant} 
      className={className}
      disabled={isLaunching || (!game && !gameId)} 
    >
      {isLaunching ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Launching...
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
};

export default GameLauncher;
