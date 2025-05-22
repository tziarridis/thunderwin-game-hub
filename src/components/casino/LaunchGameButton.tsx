
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Game, GameLaunchOptions } from '@/types';
import { useGames } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, LogIn } from 'lucide-react'; 

interface LaunchGameButtonProps extends ButtonProps {
  game: Game;
  mode: 'real' | 'demo';
  buttonText?: string;
}

const LaunchGameButton: React.FC<LaunchGameButtonProps> = ({ game, mode, buttonText, children, ...props }) => {
  const { launchGame } = useGames();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handlePlay = async () => {
    if (!game) {
      toast.error("Game data missing.");
      return;
    }

    if (mode === 'real' && !isAuthenticated) {
      toast.info("Please log in to play for real money.", {
        action: {
          label: "Log In",
          onClick: () => navigate('/login'),
        },
      });
      return;
    }
    
    if (mode === 'demo' && game.only_real === true) { // Check if only_real is explicitly true
        toast.info("This game is available for real play only.");
        return;
    }


    try {
      const launchOptions: GameLaunchOptions = {
        mode,
        user_id: user?.id,
        username: user?.user_metadata?.username || user?.email?.split('@')[0],
        currency: user?.user_metadata?.currency || 'USD',
        platform: 'web',
        language: user?.user_metadata?.language || 'en',
        returnUrl: `${window.location.origin}/casino`
      };

      const gameUrl = await launchGame(game, launchOptions);
      if (gameUrl) {
        window.open(gameUrl, '_blank');
      } else {
        toast.error("Could not launch game. The game might be unavailable or already launched.");
        navigate(`/casino/game/${game.slug || game.id}`);
      }
    } catch (e: any) {
      toast.error(`Error launching game: ${(e as Error).message}`); // Type assertion
      navigate(`/casino/game/${game.slug || game.id}`);
    }
  };

  const defaultText = mode === 'real' ? "Play Real" : "Play Demo";
  const icon = mode === 'real' ? <PlayCircle className="mr-2 h-4 w-4" /> : <PlayCircle className="mr-2 h-4 w-4" />;
  
  if (mode === 'real' && !isAuthenticated && game.only_demo !== true) { // Check if not explicitly demo_only
    return (
        <Button onClick={() => navigate('/login')} {...props}>
            <LogIn className="mr-2 h-4 w-4" /> Log In to Play
        </Button>
    );
  }
  
  if (mode === 'demo' && game.only_real === true) { // Check if only_real is explicitly true
    return (
        <Button {...props} disabled>
            <PlayCircle className="mr-2 h-4 w-4" /> Demo Unavailable
        </Button>
    );
  }

  return (
    <Button onClick={handlePlay} {...props}>
      {icon}
      {children || buttonText || defaultText}
    </Button>
  );
};

export default LaunchGameButton;

