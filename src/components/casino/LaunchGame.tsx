import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Game, GameLaunchOptions, Wallet } from '@/types'; // Changed DbWallet to Wallet
import { pragmaticPlayService } from '@/services/providers/pragmaticPlayService'; // Example provider service
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ResponsiveEmbed from '@/components/ResponsiveEmbed'; // Assuming this component exists

interface LaunchGameProps {
  game: Game;
  options: GameLaunchOptions;
  wallet?: Wallet | null; // Changed DbWallet to Wallet
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
        // Assuming pragmaticPlayService.getGameLaunchUrl returns a promise that resolves to a URL string
        // and that options are correctly passed to this service.
        const url = await pragmaticPlayService.getGameLaunchUrl(game.game_id || game.id.toString(), game, options);
        setLaunchUrl(url);
      } catch (err: any) {
        setError(err.message || 'Failed to launch game');
        toast.error(err.message || 'Failed to launch game');
      } finally {
        setIsLoading(false);
      }
    };

    loadGame();
  }, [game, options]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!launchUrl) {
    return (
      <div className="flex h-full items-center justify-center">
        Unable to generate game URL.
      </div>
    );
  }

  return (
    <ResponsiveEmbed src={launchUrl} title={`Launching ${game.title}`} />
  );
};

export default LaunchGame;
