
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { gameAggregatorService } from "@/services/gameAggregatorService";
import { useGames } from "@/hooks/useGames";
import { Game } from "@/types";
import { trackEvent } from "@/utils/analytics";

interface GameLauncherProps {
  game?: Game;
  gameId?: string;
  gameName?: string;
  buttonText?: string;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  className?: string;
  currency?: string;
  platform?: "web" | "mobile";
}

const GameLauncher = ({
  game,
  gameId,
  gameName = "Game",
  buttonText = "Play Now",
  variant = "default",
  className = "",
  currency = "EUR",
  platform = "web"
}: GameLauncherProps) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { launchGame, games } = useGames();
  
  const handleLaunchGame = async () => {
    // Check if user is logged in
    if (!isAuthenticated || !user) {
      toast.error("Please log in to play games");
      return;
    }
    
    try {
      setIsLaunching(true);
      
      // Track analytics event
      trackEvent('game_launch_click', {
        gameId: game?.id || gameId || 'unknown',
        gameName: game?.title || gameName || 'Unknown Game',
      });
      
      // Use provided game object, or find the game in our games list if only gameId is provided
      const gameData = game || (gameId ? games.find(g => g.id === gameId) : null);
      
      if (!gameData && !gameId) {
        throw new Error("Game information not provided");
      }
      
      // If we have a game object, use launchGame hook method
      if (gameData) {
        const launchOptions = {
          playerId: user.id,
          mode: 'real',
          currency: currency || user?.currency || 'EUR',
          language: 'en',
          platform,
          returnUrl: window.location.href
        };
        
        const gameUrl = await launchGame(gameData, launchOptions);
        
        if (gameUrl) {
          window.open(gameUrl, "_blank");
          toast.success(`Launching ${gameData.title}`);
          trackEvent('game_launch_success', {
            gameId: gameData.id,
            gameName: gameData.title
          });
        } else {
          throw new Error("Failed to generate game URL");
        }
      } 
      // If we only have gameId, use gameAggregatorService directly
      else if (gameId) {
        const response = await gameAggregatorService.createSession(
          gameId,
          user.id,
          currency || user?.currency || 'EUR',
          platform as 'web' | 'mobile'
        );
        
        if (response.success && response.gameUrl) {
          window.open(response.gameUrl, "_blank");
          toast.success(`Launching ${gameName}`);
          trackEvent('game_launch_success', {
            gameId,
            gameName
          });
        } else {
          throw new Error(response.errorMessage || "Failed to generate game URL");
        }
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
      disabled={isLaunching}
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
