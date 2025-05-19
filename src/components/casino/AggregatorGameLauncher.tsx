
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Game, GameLaunchOptions } from '@/types'; // Corrected import
import { useGames } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ResponsiveEmbed from '@/components/ResponsiveEmbed';
import { Loader2 } from 'lucide-react';
// import { gameAggregatorService } from '@/services/gameAggregatorService'; // Assuming this service exists

const AggregatorGameLauncher: React.FC = () => {
  const { provider, gameCode } = useParams<{ provider: string; gameCode: string }>();
  const { user, isAuthenticated } = useAuth();
  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getGameBySlug, getGameById } = useGames(); // Or some method to fetch game details by provider/code
  const [gameDetails, setGameDetails] = useState<Game | null>(null);

  useEffect(() => {
    const fetchGameDetailsAndLaunch = async () => {
      if (!provider || !gameCode) {
        setError("Provider or game code missing.");
        setLoading(false);
        return;
      }

      try {
        // Attempt to find the game in our DB first for metadata.
        // This might require a specific service method, e.g., gameService.getGameByProviderAndCode(provider, gameCode)
        // For now, trying by slug or ID if gameCode could be either
        let game = await getGameBySlug(gameCode);
        if (!game) game = await getGameById(gameCode);
        setGameDetails(game); // Store fetched game details

        const options: GameLaunchOptions = {
          mode: isAuthenticated ? 'real' : 'demo',
          user_id: user?.id,
          username: user?.user_metadata?.username,
          currency: user?.user_metadata?.currency || 'USD',
          language: user?.user_metadata?.language || 'en',
          platform: 'web',
        };
        
        // This is where you'd call your aggregator service
        // const url = await gameAggregatorService.launchGame(provider, gameCode, options);
        // For placeholder:
        const demoUrl = `https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=${gameCode}&provider=${provider}&lang=en&cur=USD`;
        // In a real scenario, gameAggregatorService.launchGame would be used.
        // setLaunchUrl(url); 
        setLaunchUrl(demoUrl); // Placeholder
        toast.info(`Attempting to launch ${gameCode} from ${provider}.`);

      } catch (err: any) {
        console.error("Error launching aggregator game:", err);
        setError(err.message || "Failed to launch game via aggregator.");
        toast.error(err.message || "Failed to launch game.");
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetailsAndLaunch();
  }, [provider, gameCode, user, isAuthenticated, getGameBySlug, getGameById]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /> <p className="ml-4 text-lg">Loading game...</p></div>;
  }

  if (error) {
    return <div className="text-center py-10"><p className="text-red-500 text-xl">Error: {error}</p></div>;
  }

  if (!launchUrl) {
    return <div className="text-center py-10"><p className="text-xl">Could not retrieve game launch URL.</p></div>;
  }

  return (
    <div className="container mx-auto p-4">
      {gameDetails && <h1 className="text-2xl font-bold text-center mb-4">{gameDetails.title}</h1>}
      <ResponsiveEmbed src={launchUrl} title={gameDetails?.title || gameCode || "Game"} />
    </div>
  );
};

export default AggregatorGameLauncher;

