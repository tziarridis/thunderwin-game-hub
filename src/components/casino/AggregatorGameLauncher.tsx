
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGames } from '@/hooks/useGames'; // Corrected: useGames for context
import { Game, GameLaunchOptions } from '@/types/game';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const AggregatorGameLauncher: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>(); // gameId could be slug or actual ID
  const navigate = useNavigate();
  const { launchGame, fetchGameBySlug, getGameById, isLoadingGames } = useGames(); // Use methods from context
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGame = async () => {
      if (!gameId) {
        setError("No game identifier provided.");
        return;
      }
      let foundGame: Game | null | undefined = null;
      // Try fetching by slug first, then by ID if fetchGameBySlug is robust
      if (fetchGameBySlug) {
         foundGame = await fetchGameBySlug(gameId);
      }
      // Fallback or primary fetch by ID if getGameById is preferred/available
      if (!foundGame && getGameById) {
          // This getGameById would ideally fetch if not in local state, or useGames provides a direct fetchGameById
          // For now, assuming it checks local cache primarily.
          // foundGame = getGameById(gameId); 
          // If getGameById is just a local search, we might need a dedicated fetchGameById method in context
          console.warn("getGameById from context might be a local cache search. Fetching by slug is preferred for direct launch.")
      }


      if (foundGame) {
        setGame(foundGame);
      } else if(!isLoadingGames) { // Avoid setting error if it's just loading
        setError(`Game with identifier "${gameId}" not found.`);
        toast.error(`Game "${gameId}" not found.`);
      }
    };
    loadGame();
  }, [gameId, fetchGameBySlug, getGameById, isLoadingGames]);

  const handleLaunch = async (mode: 'real' | 'demo') => {
    if (!game) {
      toast.error("Game data is not available for launch.");
      return;
    }
    const launchOptions: GameLaunchOptions = { mode };
    const url = await launchGame(game, launchOptions);
    if (url) {
      // For an embedded experience, you might use an iframe or a dedicated launch view
      // window.open(url, '_blank'); // Opens in new tab
      navigate('/casino/seamless', { state: { gameUrl: url, gameTitle: game.title } });
    }
    // Error handling is within launchGame from context
  };

  if (isLoadingGames && !game) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <p className="ml-4 text-xl">Loading Game...</p></div>;
  if (error) return <div className="text-center py-10 text-red-500">{error} <Button onClick={() => navigate(-1)}>Go Back</Button></div>;
  if (!game) return <div className="text-center py-10">Game not found. <Button onClick={() => navigate(-1)}>Go Back</Button></div>;

  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-3xl font-bold mb-6">Launch {game.title}</h1>
      <img src={game.cover || game.image_url || game.image} alt={game.title} className="w-64 h-auto mx-auto mb-6 rounded-lg shadow-lg" />
      <p className="mb-2 text-lg">Provider: {game.providerName || game.provider_slug}</p>
      {game.description && <p className="mb-6 text-muted-foreground max-w-xl mx-auto">{game.description}</p>}
      
      <div className="space-x-4">
        <Button onClick={() => handleLaunch('real')} size="lg">Play Real</Button>
        {!(game.only_real) && <Button onClick={() => handleLaunch('demo')} variant="outline" size="lg">Play Demo</Button>}
      </div>
      <Button onClick={() => navigate('/casino/main')} variant="link" className="mt-8">Back to Casino</Button>
    </div>
  );
};

export default AggregatorGameLauncher;

