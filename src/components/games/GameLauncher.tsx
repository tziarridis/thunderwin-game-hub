import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGames } from '@/hooks/useGames'; 
import { useAuth } from '@/contexts/AuthContext'; 
import { Game, GameLaunchOptions } from '@/types';
import { toast } from 'sonner';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Home, RefreshCw } from 'lucide-react';
import ResponsiveEmbed from '@/components/ResponsiveEmbed';
import CasinoGameGrid from '@/components/casino/CasinoGameGrid'; // Assuming this is for related games
// import GameProperties from './GameProperties'; // Import if you want to show properties here
// import GameReviews from './GameReviews'; // Import for reviews

const GameLauncher = () => {
  const { gameId } = useParams<{ gameId: string }>(); // This is likely game slug or DB ID
  const navigate = useNavigate();
  const location = useLocation();
  const { launchGame, getGameById, getGameBySlug, games: allGames, isLoading: gamesLoading } = useGames();
  const { user, isAuthenticated } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedGames, setRelatedGames] = useState<Game[]>([]);

  const loadGameDetails = useCallback(async () => {
    if (!gameId) {
      setError("No game identifier provided.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Try fetching by slug first, then by ID if slug fetch fails or isn't appropriate
      let fetchedGame = await getGameBySlug(gameId);
      if (!fetchedGame) {
        fetchedGame = await getGameById(gameId);
      }
      
      if (fetchedGame) {
        setGame(fetchedGame);
        const filteredRelatedGames = allGames
          .filter(g => g.id !== fetchedGame!.id && (g.category === fetchedGame!.category || g.provider === fetchedGame!.provider))
          .slice(0, 6);
        setRelatedGames(filteredRelatedGames);
      } else {
        setError("Game not found.");
        toast.error("Game not found.");
      }
    } catch (err: any) {
      console.error("Error fetching game details:", err);
      setError(err.message || "Failed to load game details.");
      toast.error(err.message || "Failed to load game details.");
    } finally {
      setIsLoading(false);
    }
  }, [gameId, getGameById, getGameBySlug, allGames]);

  useEffect(() => {
    loadGameDetails();
  }, [loadGameDetails]);


  const handleLaunchGame = useCallback(async (mode: 'real' | 'demo' = 'real') => {
    if (!game) {
      toast.error("Game data is not loaded yet.");
      return;
    }
    if (mode === 'real' && !isAuthenticated) {
      toast.error("Please log in to play for real money.");
      navigate('/login', { state: { from: location.pathname } }); // Assuming /login is your login route
      return;
    }

    setIsLoading(true); // Loading for launch action
    setError(null);

    const launchOptions: GameLaunchOptions = {
      mode,
      user_id: user?.id, // Changed from playerId
      currency: user?.user_metadata?.currency || 'USD', // Example: get currency from user metadata or a default
      platform: 'web', 
      language: user?.user_metadata?.language || 'en', // Example: get language from user metadata
      returnUrl: `${window.location.origin}/casino` 
    };

    try {
      const url = await launchGame(game, launchOptions);
      if (url) {
        setLaunchUrl(url);
      } else {
        setError("Could not retrieve game launch URL.");
        toast.error("Could not retrieve game launch URL. The game might be unavailable.");
      }
    } catch (err: any) {
      console.error("Error launching game:", err);
      setError(err.message || "Failed to launch game.");
      toast.error(err.message || "Failed to launch game. Please try again later.");
    } finally {
      setIsLoading(false); // Done with launch action
    }
  }, [game, isAuthenticated, user, launchGame, navigate, location.pathname]);

  useEffect(() => {
    // Auto-launch logic (e.g. demo mode if not logged in, or if game has demo_only tag)
    if (game && !launchUrl && !isLoading && !error) {
      const canPlayReal = isAuthenticated && !game.tags?.includes('demo_only');
      if (!canPlayReal) { 
         handleLaunchGame('demo');
      }
      // If the user IS authenticated and game is not demo_only,
      // we wait for them to click a play button (handled in JSX below)
    }
  }, [game, launchUrl, isLoading, error, handleLaunchGame, isAuthenticated]);

  // ... keep existing code (JSX for loading, error, game display, related games)
  if (isLoading && !game && !launchUrl) { 
    return (
      <div className="container mx-auto p-4 min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center">
        <Loader2 className="h-12 w-12 animate-spin text-casino-thunder-green mb-4" />
        <p className="text-xl font-semibold">Loading Game...</p>
        <p className="text-white/70">Please wait while we prepare your game.</p>
      </div>
    );
  }

  if (error && !launchUrl) { 
    return (
      <div className="container mx-auto p-4 min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-xl font-semibold text-red-400">Error Loading Game</p>
        <p className="text-white/70 mb-6">{error}</p>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/casino')} variant="outline">
            <Home className="mr-2 h-4 w-4" /> Go to Casino
          </Button>
          <Button onClick={loadGameDetails} >
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      {game && (
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{game.title}</h1>
          <p className="text-white/80">Provider: {game.providerName || game.provider}</p>
        </div>
      )}

      {isLoading && launchUrl && ( 
         <div className="w-full bg-black rounded-lg shadow-xl overflow-hidden mb-8">
            <AspectRatio ratio={16 / 9}>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-casino-thunder-green" />
                </div>
            </AspectRatio>
        </div>
      )}
      
      {!isLoading && launchUrl && (
        <ResponsiveEmbed src={launchUrl} title={game?.title || 'Game'} />
      )}
      
      {!launchUrl && !isLoading && !error && game && ( 
         <div className="w-full bg-black rounded-lg shadow-xl overflow-hidden mb-8">
            <AspectRatio ratio={16 / 9} className="bg-gray-800 flex flex-col items-center justify-center">
                <img src={game.image || game.cover || '/placeholder.svg'} alt={game.title} className="max-h-[200px] mb-4 opacity-50 rounded-md" />
                <p className="text-lg text-white/70 mb-4">Ready to play {game.title}?</p>
                 <div className="flex gap-4">
                    {isAuthenticated && !game.tags?.includes('demo_only') && (
                        <Button onClick={() => handleLaunchGame('real')} size="lg" className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                            Play Real Money
                        </Button>
                    )}
                    {(game.tags?.includes('demo_playable') || !isAuthenticated || game.tags?.includes('demo_only')) && ( // Condition for showing demo button
                        <Button onClick={() => handleLaunchGame('demo')} size="lg" variant="outline">
                            Play Demo
                        </Button>
                    )}
                </div>
            </AspectRatio>
        </div>
      )}

      {game && (
        <div className="my-8 p-6 bg-card rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Game Details</h3>
          {/* <GameProperties game={game} /> Example of using sub-component */}
          <p className="text-sm text-white/70 mb-1"><strong>RTP:</strong> {game.rtp ? `${game.rtp}%` : 'N/A'}</p>
          <p className="text-sm text-white/70 mb-1"><strong>Volatility:</strong> {game.volatility || 'N/A'}</p>
          {game.description && <p className="text-sm text-white/70 mt-2">{game.description}</p>}
        </div>
      )}

      {/* Placeholder for GameReviews component */}
      {/* {game && <GameReviews gameId={String(game.id)} />} */}


      {relatedGames.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">You Might Also Like</h2>
          <CasinoGameGrid 
            games={relatedGames} 
            onGameClick={(clickedGame) => navigate(`/casino/game/${clickedGame.slug || String(clickedGame.id)}`)} 
          />
        </div>
      )}
    </div>
  );
};

export default GameLauncher;
