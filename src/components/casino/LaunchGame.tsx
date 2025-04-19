
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
}

const LaunchGame = ({ 
  game, 
  mode = 'demo', 
  buttonText = 'Play Game', 
  variant = 'default',
  className = '',
  providerId = 'ppeur' // Default to Pragmatic Play EUR
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
      
      const gameUrl = await launchGame(game, { 
        mode, 
        providerId,
        playerId,
        returnUrl: window.location.href
      });
      
      // Handle successful launch
      window.open(gameUrl, '_blank');
      toast.success(`Game launched: ${game.title}`);
      
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
