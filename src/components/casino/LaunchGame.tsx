import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Game } from "@/types";
import { useGames } from "@/hooks/useGames";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { walletService } from "@/services/walletService";
import { gameAggregatorService } from "@/services/gameAggregatorService";
import { GameLaunchOptions } from "@/types";
import { trackEvent } from "@/utils/analytics";
import { DbWallet } from '@/types';

interface LaunchGameProps {
  game: Game;
  mode?: 'real' | 'demo';
  buttonText?: string;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  className?: string;
  providerId?: string;
  currency?: string;
  language?: string;
  platform?: 'web' | 'mobile';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const LaunchGame = ({ 
  game, 
  mode = 'demo', 
  buttonText = 'Play Game', 
  variant = 'default',
  className = '',
  providerId = 'ppeur',
  currency = 'USD',
  language = 'en',
  platform = 'web',
  size = 'default'
}: LaunchGameProps) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const { isAuthenticated, user, refreshWalletBalance } = useAuth();
  
  const handleLaunch = async () => {
    if (mode === 'real' && !isAuthenticated) {
      toast.error("Please log in to play in real money mode");
      return;
    }
    
    try {
      setIsLaunching(true);
      const playerId = isAuthenticated ? user?.id || 'guest' : 'guest';
      
      if (mode === 'real' && isAuthenticated && user?.id) {
        const { data: walletData, error } = await walletService.getWalletByUserId(user.id);
        if (error) throw error;
        
        const singleWallet = walletData as DbWallet | null;
        if (!singleWallet || singleWallet.balance <= 0) {
          toast.error("Insufficient funds. Please deposit to play in real money mode.");
          setIsLaunching(false);
          return;
        }
      }
      
      console.log(`Launching game ${game.id} with provider ${providerId} for player ${playerId}`, {
        mode,
        language,
        currency,
        platform
      });
      
      const response = await gameAggregatorService.createSession(
        game.id!,
        playerId,
        currency,
        platform
      );
      
      if (response.success && response.gameUrl) {
        const gameWindow = window.open(response.gameUrl, '_blank');
        
        if (!gameWindow) {
          throw new Error("Pop-up blocker might be preventing the game from opening. Please allow pop-ups for this site.");
        }
        
        toast.success(`Game launched: ${game.title}`);
        
        if (mode === 'real' && isAuthenticated) {
          setTimeout(() => {
            refreshWalletBalance();
          }, 5000); 
        }
      } else {
        throw new Error(response.errorMessage || "Failed to generate game URL");
      }
      
    } catch (error: any) {
      console.error('Error launching game:', error);
      toast.error(`Error launching game: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLaunching(false);
    }
  };
  
  return (
    <Button 
      variant={variant}
      onClick={handleLaunch}
      disabled={isLaunching}
      className={className}
      size={size}
    >
      {isLaunching ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Launching...
        </>
      ) : buttonText}
    </Button>
  );
};

export default LaunchGame;
