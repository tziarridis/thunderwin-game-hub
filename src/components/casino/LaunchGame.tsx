
import React from 'react';
import { Game, GameLaunchOptions } from '@/types/game';
import { useGames } from '@/hooks/useGames'; // Fixed import
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LaunchGameProps {
  game: Game;
  options: GameLaunchOptions;
  children: React.ReactNode;
}

const LaunchGame: React.FC<LaunchGameProps> = ({ game, options, children }) => {
  const { launchGame } = useGames();

  const handleLaunch = async () => {
    const url = await launchGame(game, options);
    if (url) {
      window.open(url, '_blank'); // Or use a game launcher modal
    } else {
      // Error already handled by launchGame via toast
    }
  };

  return <div onClick={handleLaunch} style={{ cursor: 'pointer' }}>{children}</div>;
};

export default LaunchGame;
