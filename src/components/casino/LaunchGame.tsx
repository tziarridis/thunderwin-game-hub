
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Game } from '@/types';
import { useGames } from '@/hooks/useGames';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { walletService } from '@/services/walletService';

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
}

const LaunchGame = ({ 
  game, 
  mode = 'demo', 
  buttonText = 'Play Game', 
  variant = 'default',
  className = '',
  providerId,
  currency = 'USD',
  language = 'en',
  platform = 'web'
}: LaunchGameProps) => {
  const { launchGame, launchingGame } = useGames();
  const [isLaunching, setIsLaunching] = useState(false);
  const { isAuthenticated, user } = useAuth();
  
  const handleLaunch = async () => {
    if (mode === 'real' && !isAuthenticated) {
      toast.error("Please log in to play in real money mode");
      return;
    }
    
    try {
      setIsLaunching(true);
      const playerId = isAuthenticated ? user?.id || 'guest' : 'guest';
      
      // Check wallet balance for real money play
      if (mode === 'real' && isAuthenticated && user?.id) {
        const wallet = await walletService.getWalletByUserId(user.id);
        if (!wallet || wallet.balance <= 0) {
          toast.error("Insufficient funds. Please deposit to play in real money mode.");
          setIsLaunching(false);
          return;
        }
      }
      
      // Determine provider ID based on game ID if not provided
      let gameProviderId = providerId;
      if (!gameProviderId) {
        if (typeof game.id === 'string') {
          if (game.id.startsWith('pp_')) {
            gameProviderId = 'ppeur';
          } else if (game.id.startsWith('gsp_')) {
            gameProviderId = 'gspeur';
          } else if (game.id.startsWith('infin_')) {
            gameProviderId = 'infineur';
          } else {
            gameProviderId = 'ppeur'; // Default
          }
        } else {
          gameProviderId = 'ppeur'; // Default for number IDs
        }
      }
      
      console.log(`Launching game ${game.id} with provider ${gameProviderId} for player ${playerId}`, {
        mode,
        language,
        currency,
        platform
      });
      
      // Extract the actual game code if needed
      const gameCode = typeof game.id === 'string' && 
        (game.id.startsWith('pp_') || game.id.startsWith('gsp_') || game.id.startsWith('infin_'))
        ? game.id.split('_')[1] 
        : game.game_code || game.game_id;
        
      // Create a properly formatted game object for the launchGame function
      const gameToLaunch = {
        ...game,
        game_code: gameCode,
        game_id: gameCode
      };
      
      const gameUrl = await launchGame(gameToLaunch, { 
        mode, 
        providerId: gameProviderId,
        playerId,
        language,
        currency,
        platform,
        returnUrl: window.location.href
      });
      
      console.log("Generated game URL:", gameUrl);
      
      if (gameUrl) {
        const gameWindow = window.open(gameUrl, '_blank');
        
        if (!gameWindow) {
          throw new Error("Pop-up blocker might be preventing the game from opening. Please allow pop-ups for this site.");
        }
        
        toast.success(`Game launched: ${game.title || game.name}`);
      } else {
        throw new Error("Failed to generate game URL");
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
      disabled={isLaunching || launchingGame}
      className={className}
    >
      {isLaunching || launchingGame ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Launching...
        </>
      ) : buttonText}
    </Button>
  );
};

export default LaunchGame;
