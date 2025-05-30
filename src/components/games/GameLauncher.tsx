
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { gameAggregatorService } from "@/services/gameAggregatorService";
import { useGames } from "@/hooks/useGames";
import { Game } from "@/types";

interface GameLauncherProps {
  gameId: string;
  gameName?: string;
  buttonText?: string;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  className?: string;
  currency?: string;
  platform?: "web" | "mobile";
}

const GameLauncher = ({
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
      
      // Find the game in our games list, or create a fully compliant Game object
      const gameData = games.find(g => g.id === gameId) || {
        id: gameId,
        title: gameName,
        name: gameName,
        provider: "unknown",
        category: "slots",
        image: "/placeholder.svg",
        rtp: 96.0,
        volatility: "medium",
        minBet: 0.1,
        maxBet: 100,
        isPopular: false,
        isNew: false,
        isFavorite: false,
        jackpot: false,
        releaseDate: new Date().toISOString(),
        features: [],
        tags: [],
        description: ""
      } as Game;
      
      // Launch the game using useGames hook
      const gameUrl = await launchGame(gameData, {
        playerId: user.id,
        mode: 'real',
        currency,
        language: 'en',
        platform,
        returnUrl: window.location.href
      });
      
      if (gameUrl) {
        window.open(gameUrl, "_blank");
        toast.success(`Launching ${gameName}`);
      } else {
        throw new Error("Failed to generate game URL");
      }
    } catch (error: any) {
      console.error("Error launching game:", error);
      toast.error(error.message || "Failed to launch game");
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
