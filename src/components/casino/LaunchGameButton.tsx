
import React from 'react';
import { Game, GameLaunchOptions } from '@/types/game';
import { useGames } from '@/hooks/useGames'; // Corrected to useGames
import { Button, ButtonProps } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

interface LaunchGameButtonProps extends ButtonProps {
  game: Game;
  launchOptions: GameLaunchOptions;
  buttonText?: string;
}

const LaunchGameButton: React.FC<LaunchGameButtonProps> = ({ game, launchOptions, buttonText = "Play", children, ...props }) => {
  const { launchGame } = useGames(); // Use context function from useGames

  const handleLaunch = async () => {
    const url = await launchGame(game, launchOptions);
    if (url) {
      window.open(url, '_blank');
    } else {
      // Error already handled by launchGame in context
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

