import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { gameAggregatorService } from "@/services/gameAggregatorService";
import { useGames } from "@/hooks/useGames";
import { Game } from "@/types";
import { GameLaunchOptions } from "@/types/additional"; // Use new type
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
  const { launchGame, games } = useGames(); // games list from useGames
  
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
      
      const gameData = game || (gameId ? games.find(g => g.id === gameId) : null);
      
      if (!gameData && !gameId) {
        // throw new Error("Game information not provided");
        // Fallback to gameName if gameId is also not available
        if (!gameName || gameName === "Game") {
            throw new Error("Game information not provided");
        }
        // If only gameName is provided, we cannot launch, but can avoid throwing if it's just for display
        console.warn("Attempting to launch with minimal info, might fail:", { gameName });
        // Potentially, we might not have a gameData object here if only gameName is passed.
        // The logic below assumes we have at least gameId or gameData.
      }
      
      // If we have a game object, use launchGame hook method
      if (gameData) {
        const launchOptions: GameLaunchOptions = { // Use GameLaunchOptions
          playerId: user.id,
          mode: 'real', // Assuming real mode for this launcher
          currency: currency || user?.currency || 'EUR',
          language: 'en', // Default or from user profile
          platform,
          returnUrl: window.location.href
        };
        
        const gameUrl = await launchGame(gameData, launchOptions); // Pass options
        
        // If in demo mode or for specific providers, open in new tab
        // For real mode, sometimes it's better to launch in an iframe or redirect
        // This logic can be customized
        if (gameUrl) {
          window.open(gameUrl, "_blank");
          toast.success(`Launching ${gameData.title}`);
          trackEvent('game_launch_success', {
            gameId: gameData.id,
            gameName: gameData.title
          });
        } else {
          // Error already toasted by launchGame
          // throw new Error("Failed to generate game URL"); 
        }
      } 
      // If we only have gameId, use gameAggregatorService directly
      else if (gameId) {
        // ... keep existing code (gameAggregatorService.createSession, window.open, toast, trackEvent)
        const response = await gameAggregatorService.createSession(
          gameId,
          user.id,
          currency || user?.currency || 'EUR',
          platform as 'web' | 'mobile'
        );
        
        if (response.success && response.gameUrl) {
          window.open(response.gameUrl, "_blank");
          toast.success(`Launching ${gameName}`); // Use gameName if gameData is not available
          trackEvent('game_launch_success', {
            gameId,
            gameName
          });
        } else {
          throw new Error(response.errorMessage || "Failed to generate game URL");
        }
      } else {
         throw new Error("Game data or Game ID is required to launch.");
      }
    } catch (error: any) {
      // ... keep existing code (console.error, toast.error, trackEvent)
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
    // ... keep existing code (Button JSX)
    <Button 
      onClick={handleLaunchGame} 
      variant={variant} 
      className={className}
      disabled={isLaunching || (!game && !gameId)} // Disable if no game/gameId
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
