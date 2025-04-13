
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
    // For real money mode, check if user is authenticated and has sufficient balance
    if (mode === 'real') {
      if (!isAuthenticated) {
        toast.error("Please log in to play with real money");
        return;
      }
      
      // Check if user has sufficient balance (assuming minimum bet is 1)
      if (user && user.balance < 1) {
        toast.error("Insufficient balance. Please deposit funds to continue.");
        return;
      }
    }
    
    try {
      setIsLaunching(true);
      const gameUrl = await launchGame(game, { 
        mode, 
        providerId,
        playerId: isAuthenticated ? user?.id || 'guest' : 'guest'
      });
      
      // Open the game in a new window
      if (gameUrl) {
        window.open(gameUrl, '_blank');
        toast.success(`Game launched: ${game.title}`);
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
