
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Game } from '@/types';
import { useGames } from '@/hooks/useGames';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { gameProviderService } from '@/services/gameProviderService';
import { pragmaticPlayService } from '@/services/pragmaticPlayService';

interface LaunchGameProps {
  game: Game;
  mode?: 'real' | 'demo';
  buttonText?: string;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  className?: string;
  provider?: string;
}

const LaunchGame = ({ 
  game, 
  mode = 'demo', 
  buttonText = 'Play Game', 
  variant = 'default',
  className = '',
  provider = 'ppeur'
}: LaunchGameProps) => {
  const { launchGame, launchingGame } = useGames();
  const { isAuthenticated, user } = useAuth();
  const [isLaunching, setIsLaunching] = useState(false);
  
  const handleLaunch = async () => {
    try {
      setIsLaunching(true);
      
      // Force demo mode if user is not authenticated
      const actualMode = (!isAuthenticated && mode === 'real') ? 'demo' : mode;
      
      if (!isAuthenticated && mode === 'real') {
        toast.warning("Please log in to play in real money mode");
      }
      
      // Determine if this is a Pragmatic Play game from the ID
      const isPragmaticGame = game.id.includes('pp_') || 
                              provider.includes('pp') || 
                              game.provider?.toLowerCase().includes('pragmatic');
      
      let gameUrl;
      
      if (isPragmaticGame) {
        // Extract the PP game code from the game ID or use it directly
        const ppGameCode = game.id.includes('pp_') 
          ? game.id.replace('pp_', '') 
          : game.id;
          
        // Launch using pragmaticPlayService
        gameUrl = await pragmaticPlayService.launchGame({
          playerId: isAuthenticated ? user?.id || 'guest' : 'guest',
          gameCode: ppGameCode,
          mode: actualMode,
          returnUrl: window.location.origin + '/casino'
        });
      } else {
        // Launch using gameProviderService
        gameUrl = await gameProviderService.getLaunchUrl({
          providerId: provider,
          gameId: game.id,
          playerId: isAuthenticated ? user?.id : 'demo',
          mode: actualMode,
          returnUrl: window.location.origin + '/casino'
        });
      }
      
      // Open the game URL
      window.open(gameUrl, '_blank');
      
    } catch (error: any) {
      console.error('Error launching game:', error);
      toast.error(`Failed to launch game: ${error.message || 'Unknown error'}`);
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
