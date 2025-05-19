
import React, { useState, useEffect } from 'react';
import { Game, GameLaunchOptions } from '@/types';
import { useGames } from '@/hooks/useGames'; // Using the main useGames hook
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import ResponsiveEmbed from '@/components/ResponsiveEmbed';
import { useNavigate, useLocation } from 'react-router-dom';

interface AggregatorGameLauncherProps {
  game: Game; // Game object passed as prop
  mode?: 'real' | 'demo'; // Optional mode, can default or be selected
}

const AggregatorGameLauncher: React.FC<AggregatorGameLauncherProps> = ({ game, mode = 'real' }) => {
  const { launchGame } = useGames(); // useGames provides the launchGame function
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const attemptLaunch = async () => {
      if (!game) {
        setError("Game data is missing.");
        return;
      }

      if (mode === 'real' && !isAuthenticated) {
        toast.info("Please log in to play for real money.");
        navigate('/login', { state: { from: location.pathname } });
        return;
      }

      setIsLoading(true);
      setError(null);

      const launchOptions: GameLaunchOptions = {
        mode,
        user_id: user?.id,
        username: user?.username || user?.email?.split('@')[0],
        currency: user?.user_metadata?.currency || 'USD',
        language: user?.user_metadata?.language || 'en',
        platform: 'web', // Or detect dynamically if needed
        returnUrl: `${window.location.origin}/casino`, // Example return URL
      };
      
      try {
        // launchGame from useGames hook should handle interaction with gameService
        const url = await launchGame(game, launchOptions);
        if (url) {
          setLaunchUrl(url);
        } else {
          setError(`Failed to get launch URL for ${game.title}. The game might be unavailable.`);
          toast.error(`Failed to get launch URL for ${game.title}.`);
        }
      } catch (err: any) {
        console.error(`Error launching game ${game.title}:`, err);
        setError(err.message || `An error occurred while launching ${game.title}.`);
        toast.error(err.message || `Failed to launch ${game.title}.`);
      } finally {
        setIsLoading(false);
      }
    };

    attemptLaunch();
  }, [game, mode, isAuthenticated, user, launchGame, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Launching {game?.title || 'Game'}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 bg-destructive/10 rounded-md">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-semibold text-destructive">Launch Error</p>
        <p className="text-sm text-destructive/80 text-center mb-4">{error}</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  if (launchUrl) {
    return <ResponsiveEmbed src={launchUrl} title={game?.title || 'Game'} />;
  }

  return ( // Fallback if no URL and no error/loading state yet (should be brief)
    <div className="flex items-center justify-center h-64">
      <p>Preparing game...</p>
    </div>
  );
};

export default AggregatorGameLauncher;
