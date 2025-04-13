
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Game } from '@/types';
import { useGames } from '@/hooks/useGames';
import { Loader2 } from 'lucide-react';

interface LaunchGameProps {
  game: Game;
  mode?: 'real' | 'demo';
  buttonText?: string;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

const LaunchGame = ({ 
  game, 
  mode = 'demo', 
  buttonText = 'Play Game', 
  variant = 'default',
  className = ''
}: LaunchGameProps) => {
  const { launchGame, launchingGame } = useGames();
  const [isLaunching, setIsLaunching] = useState(false);
  
  const handleLaunch = async () => {
    try {
      setIsLaunching(true);
      await launchGame(game, { mode });
    } catch (error) {
      console.error('Error launching game:', error);
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
