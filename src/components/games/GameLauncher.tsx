
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { gameAggregatorService } from "@/services/gameAggregatorService";

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
  
  const handleLaunchGame = async () => {
    // Check if user is logged in
    if (!isAuthenticated || !user) {
      toast.error("Please log in to play games");
      return;
    }
    
    try {
      setIsLaunching(true);
      
      // Create game session
      const result = await gameAggregatorService.createSession(
        gameId,
        user.id,
        currency,
        platform
      );
      
      if (result.success && result.gameUrl) {
        // Open game in new window
        window.open(result.gameUrl, "_blank");
        toast.success(`Launching ${gameName}`);
      } else {
        throw new Error(result.errorMessage || "Failed to launch game");
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
