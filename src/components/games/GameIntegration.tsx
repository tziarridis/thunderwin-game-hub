
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface GameIntegrationProps {
  gameId: string;
  providerName?: string;
  onGameLoad?: () => void;
  onError?: (error: string) => void;
}

const GameIntegration = ({ 
  gameId, 
  providerName = "Default Provider",
  onGameLoad,
  onError
}: GameIntegrationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGameLoaded, setIsGameLoaded] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Simulated function to load a game from an aggregator
  const loadGame = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to play this game");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call to game aggregator
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsGameLoaded(true);
      toast.success("Game loaded successfully");
      
      if (onGameLoad) {
        onGameLoad();
      }
    } catch (error) {
      const errorMessage = "Failed to load game";
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
      {!isGameLoaded ? (
        <div className="flex flex-col items-center justify-center p-8 bg-casino-thunder-dark rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Load "{gameId}" from {providerName}</h3>
          <p className="text-white/60 mb-6 text-center">
            This game is provided by our game aggregator service.
            Click below to load the game.
          </p>
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
            Game ID: {gameId} | Provider: {providerName}
          </div>
        </div>
      ) : (
        <div className="relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center bg-casino-thunder-dark/80">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Game Loaded!</h3>
              <p className="text-white/60 mb-4">
                In a real implementation, the game iframe would be loaded here
                from the aggregator's API.
              </p>
              <Button 
                onClick={() => setIsGameLoaded(false)} 
                variant="outline"
              >
                Close Game
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameIntegration;
