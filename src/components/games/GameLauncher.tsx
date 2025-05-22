import React from 'react';
import { Game, GameLaunchOptions } from '@/types/game';
import { useGames } from '@/hooks/useGames'; // Corrected to useGames
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface GameLauncherProps {
  game: Game;
  mode: 'real' | 'demo';
  buttonText?: string;
}

const GameLauncher: React.FC<GameLauncherProps> = ({ game, mode, buttonText = "Play Now" }) => {
  const { launchGame } = useGames();
  const navigate = useNavigate();

  const handleLaunch = async () => {
    const launchOptions: GameLaunchOptions = { mode };
    const url = await launchGame(game, launchOptions);

    if (url) {
      // For an embedded experience, you might use an iframe or a dedicated launch view
      // window.open(url, '_blank'); // Opens in new tab
      navigate('/casino/seamless', { state: { gameUrl: url, gameTitle: game.title } });
    } else {
      toast.error(`Failed to launch ${game.title}. Please try again later.`);
    }
  };

  return (
    <Button onClick={handleLaunch}>
      <PlayCircle className="mr-2 h-4 w-4" />
      {buttonText}
    </Button>
  );
};

export default GameLauncher;
