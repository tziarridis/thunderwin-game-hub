import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Game, GameLaunchOptions, Wallet } from '@/types'; // Changed DbWallet to Wallet
import { gameAggregatorService } from '@/services/gameAggregatorService'; // Assuming you have this service
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ResponsiveEmbed from '@/components/ResponsiveEmbed'; // Assuming this component exists

interface AggregatorGameLauncherProps {
  game: Game;
  options: GameLaunchOptions;
  wallet?: Wallet | null; // Changed DbWallet to Wallet
}

const AggregatorGameLauncher: React.FC<AggregatorGameLauncherProps> = ({ game, options, wallet }) => {
  const [launchUrl, setLaunchUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadGame = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!game.provider_slug || !game.game_id) {
          throw new Error("Provider slug or game ID is missing.");
        }
        const url = await gameAggregatorService.getGameLaunchUrl(game.provider_slug, game.game_id, options);
        setLaunchUrl(url);
      } catch (err: any) {
        setError(err.message || 'Failed to launch game');
        toast.error(`Failed to launch game: ${err.message || 'Unknown error'}`);
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
        <p className="ml-2">Loading game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {launchUrl ? (
        <ResponsiveEmbed src={launchUrl} />
      ) : (
        <div className="flex h-full items-center justify-center">
          <p>Waiting to launch game...</p>
        </div>
      )}
    </div>
  );
};

export default AggregatorGameLauncher;
