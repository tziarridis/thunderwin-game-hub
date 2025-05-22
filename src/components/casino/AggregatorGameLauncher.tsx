import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Game, GameLaunchOptions, GameStatusEnum } from '@/types';
import { useGames } from '@/hooks/useGames'; // Corrected import: useGames instead of useGamesData
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
// ... keep existing code (useState, useParams, useAuth)
  const { getGameBySlug, getGameById } = useGames(); // Use the hook correctly
  const [gameDetails, setGameDetails] = useState<Game | null>(null);

  useEffect(() => {
    const fetchGameDetailsAndLaunch = async () => {
// ... keep existing code (check for provider and gameCode)

      try {
        // Attempt to find the game in our DB first for metadata.
        let game: Game | undefined = undefined;
        if (gameCode) { // ensure gameCode is defined
            game = await getGameBySlug(gameCode) || await getGameById(gameCode);
        }
        
        if (game) {
            setGameDetails(game);
        } else {
            // Fallback if game not in local DB, still attempt to launch
            // but set a minimal game detail for title etc.
            setGameDetails({ 
                id: gameCode || 'unknown', 
                title: gameCode || 'Game', 
                slug: gameCode, 
                provider_slug: provider || 'unknown', 
                status: GameStatusEnum.ACTIVE 
            } as Game); // Cast to Game, acknowledge missing fields
            console.warn(`Game with code/slug ${gameCode} not found in local DB. Proceeding with launch.`);
        }
        

        const options: GameLaunchOptions = {
          mode: isAuthenticated ? 'real' : 'demo',
          // user_id: user?.id, // This needs to be Supabase auth user ID, not your custom user table ID if different.
          // username: user?.user_metadata?.username,
          // currency: user?.user_metadata?.currency || 'USD',
          // language: user?.user_metadata?.language || 'en',
          // platform: 'web',
        };
        
        // This is where you'd call your aggregator service
        // const url = await gameAggregatorService.launchGame(provider, gameCode, options);
        // For placeholder:
        const demoUrl = `https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=${gameCode}&provider=${provider}&lang=en&cur=USD`;
        // In a real scenario, gameAggregatorService.launchGame would be used.
        // setLaunchUrl(url); 
        setLaunchUrl(demoUrl); // Placeholder
        toast.info(`Attempting to launch ${gameCode || 'game'} from ${provider || 'provider'}.`);

      } catch (err: any) {
// ... keep existing code (error handling and finally block)
        console.error("Error launching aggregator game:", err);
        setError(err.message || "Failed to launch game via aggregator.");
        toast.error(err.message || "Failed to launch game.");
      } finally {
        setLoading(false);
      }
    };

    if (provider && gameCode) { // Ensure they are defined before fetching
        fetchGameDetailsAndLaunch();
    } else {
        setError("Provider or game code missing in URL parameters.");
        setLoading(false);
        toast.error("Cannot launch game: critical information missing.");
    }

  }, [provider, gameCode, user, isAuthenticated, getGameBySlug, getGameById]);

// ... keep existing code (loading, error, and launchUrl checks and return JSX)
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
