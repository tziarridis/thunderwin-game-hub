
import React from 'react';
import { Game, GameLaunchOptions } from '@/types/game';
import { useGamesData } from '@/hooks/useGames'; // Changed to useGamesData
import { Button, ButtonProps } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

interface LaunchGameButtonProps extends ButtonProps {
  game: Game;
  launchOptions: GameLaunchOptions;
  buttonText?: string;
}

const LaunchGameButton: React.FC<LaunchGameButtonProps> = ({ game, launchOptions, buttonText = "Play", children, ...props }) => {
  const { launchGame } = useGamesData(); // Use context function

  const handleLaunch = async () => {
    const url = await launchGame(game, launchOptions); // Call context function
    if (url) {
      window.open(url, '_blank'); // Or use a game launcher modal
    } else {
      // Error handled by launchGame
    }
  };

  return (
    <Button onClick={handleLaunch} {...props}>
      {children || (
        <>
          <PlayCircle className="mr-2 h-4 w-4" /> {buttonText}
        </>
      )}
    </Button>
  );
};

export default LaunchGameButton;
