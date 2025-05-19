
import React from 'react';
// import { useQuery } from '@tanstack/react-query'; // Not used in this version
import { Game, GameLaunchOptions, Wallet } from '@/types'; 
import { pragmaticPlayService } from '@/services/providers/pragmaticPlayService'; 
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ResponsiveEmbed from '@/components/ResponsiveEmbed'; 

interface LaunchGameProps {
  game: Game;
  options: GameLaunchOptions;
  wallet?: Wallet | null; 
}

const LaunchGame: React.FC<LaunchGameProps> = ({ game, options, wallet }) => {
  const [launchUrl, setLaunchUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadGame = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use getLaunchUrl as suggested by previous error analysis
        const url = await pragmaticPlayService.getLaunchUrl( // Changed from getGameLaunchUrl
            {}, // Config object - ensure this is correct for pragmaticPlayService
            game.game_id || game.id.toString(), 
            options.user_id || 'demoUser', // playerId
            options.mode, 
            options.language || 'en', 
            options.currency || 'USD',
            options.platform || 'WEB',
            options.returnUrl
        );
        setLaunchUrl(url);
      } catch (err: any) {
        setError(err.message || 'Failed to launch game');
        toast.error(err.message || 'Failed to launch game');
      } finally {
        setIsLoading(false);
      }
    };

    if (game && options) { // Ensure game and options are provided
        loadGame();
    } else {
        setError("Game data or launch options are missing.");
        setIsLoading(false);
    }

  }, [game, options]); // Rerun if game or options change

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-red-500 p-4">
        <p className="font-semibold">Error launching game:</p>
        <p className="text-sm text-center">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => window.history.back()}>
            Go Back
        </Button>
      </div>
    );
  }

  if (!launchUrl) {
    return ( // This state should ideally be brief or covered by loading/error
      <div className="flex h-full items-center justify-center">
        <p>Preparing game launch...</p>
      </div>
    );
  }

  return (
    <ResponsiveEmbed src={launchUrl} title={`Launching ${game.title}`} />
  );
};

export default LaunchGame;
