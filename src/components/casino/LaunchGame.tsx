
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Game } from '@/types';
import { useGames } from '@/hooks/useGames';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface LaunchGameProps {
  game: Game;
  mode?: 'real' | 'demo';
  buttonText?: string;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  className?: string;
  providerId?: string;
  currency?: string;
  language?: string;
}

const LaunchGame = ({ 
  game, 
  mode = 'demo', 
  buttonText = 'Play Game', 
  variant = 'default',
  className = '',
  providerId = 'ppeur', // Default to Pragmatic Play EUR
  currency = 'USD',
  language = 'en'
}: LaunchGameProps) => {
  const { launchGame, launchingGame } = useGames();
  const [isLaunching, setIsLaunching] = useState(false);
  const { isAuthenticated, user } = useAuth();
  
  const handleLaunch = async () => {
    // Check if player is authenticated for real money mode
    if (mode === 'real' && !isAuthenticated) {
      toast.error("Please log in to play in real money mode");
      return;
    }
    
    try {
      setIsLaunching(true);
      
      // Use player ID if authenticated, otherwise use guest
      const playerId = isAuthenticated ? user?.id || 'guest' : 'guest';
      
      console.log(`Launching game ${game.id} with provider ${providerId} for player ${playerId}`);
      
      // Add language and return URL to launch options
      const gameUrl = await launchGame(game, { 
        mode, 
        providerId,
        playerId,
        language,
        currency,
        returnUrl: window.location.href
      });
      
      console.log("Generated game URL:", gameUrl);
      
      // Handle successful launch
      if (gameUrl) {
        const gameWindow = window.open(gameUrl, '_blank');
        
        // Check if popup blocker prevented the window from opening
        if (!gameWindow) {
          throw new Error("Pop-up blocker might be preventing the game from opening. Please allow pop-ups for this site.");
        }
        
        toast.success(`Game launched: ${game.title}`);
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
