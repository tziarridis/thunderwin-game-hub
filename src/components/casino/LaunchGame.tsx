
import React from 'react';
import { Game, GameLaunchOptions } from '@/types/game';
import { useGamesData } from '@/hooks/useGames'; // Changed to useGamesData
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LaunchGameProps {
  game: Game;
  options: GameLaunchOptions;
  children: React.ReactNode;
}

const LaunchGame: React.FC<LaunchGameProps> = ({ game, options, children }) => {
  const { launchGame } = useGamesData(); // Use context function

  const handleLaunch = async () => {
    const url = await launchGame(game, options); // Call context function
    if (url) {
      window.open(url, '_blank'); // Or use a game launcher modal
    } else {
      // Error already handled by launchGame via toast
    }
  };

  return <div onClick={handleLaunch} style={{ cursor: 'pointer' }}>{children}</div>;
};

export default LaunchGame;
