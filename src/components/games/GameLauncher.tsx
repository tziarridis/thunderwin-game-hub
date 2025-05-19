import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGames } from '@/hooks/useGames'; 
import { useAuth } from '@/contexts/AuthContext'; 
import { Game, GameLaunchOptions } from '@/types'; // Corrected import
import { toast } from 'sonner';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Home, RefreshCw } from 'lucide-react';
import ResponsiveEmbed from '@/components/ResponsiveEmbed';
import CasinoGameGrid from '@/components/casino/CasinoGameGrid'; 
// import { gameService } from '@/services/gameService'; // Import gameService - Not used directly here

// import GameProperties from './GameProperties'; 
// import GameReviews from './GameReviews'; 

const GameLauncher = () => {
  const { gameId } = useParams<{ gameId: string }>(); // This is likely game slug or DB ID
  const navigate = useNavigate();
  const location = useLocation();
  const { launchGame, getGameById, getGameBySlug, games: allGames } = useGames();
  const { user, isAuthenticated } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Combined loading state
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
    setLaunchUrl(null); 
    try {
      let fetchedGame = await getGameBySlug(gameId);
      if (!fetchedGame) {
        fetchedGame = await getGameById(gameId);
      }
      
      if (fetchedGame) {
        setGame(fetchedGame);
        const currentCategory = fetchedGame.categoryName || 
          (Array.isArray(fetchedGame.category_slugs) ? fetchedGame.category_slugs[0] : typeof fetchedGame.category_slugs === 'string' ? fetchedGame.category_slugs : fetchedGame.category);
        const currentProvider = fetchedGame.providerName || fetchedGame.provider_slug || fetchedGame.provider;

        const filteredRelatedGames = allGames
          .filter(g => {
            const gCategory = g.categoryName || (Array.isArray(g.category_slugs) ? g.category_slugs[0] : typeof g.category_slugs === 'string' ? g.category_slugs : g.category);
            const gProvider = g.providerName || g.provider_slug || g.provider;
            return String(g.id) !== String(fetchedGame!.id) && (gCategory === currentCategory || gProvider === currentProvider);
          })
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
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    setIsLoading(true); 
    setError(null);

    const launchOptions: GameLaunchOptions = {
      mode,
      user_id: user?.id, 
      username: user?.user_metadata?.username || user?.email?.split('@')[0], // Corrected username
      currency: user?.user_metadata?.currency || 'USD', 
      platform: 'web', 
      language: user?.user_metadata?.language || 'en',
      returnUrl: `${window.location.origin}/casino` 
    };

    try {
      const url = await launchGame(game, launchOptions);
      if (url) {
        setLaunchUrl(url);
      } else {
        setError("Could not retrieve game launch URL. The game might be unavailable or already launched.");
        toast.error("Could not retrieve game launch URL. The game might be unavailable.");
      }
    } catch (err: any) {
      console.error("Error launching game:", err);
      setError(err.message || "Failed to launch game.");
      toast.error(err.message || "Failed to launch game. Please try again later.");
    } finally {
      setIsLoading(false); 
    }
  }, [game, isAuthenticated, user, launchGame, navigate, location.pathname]);
  
  const isDemoModeAvailable = (gameToCheck: Game | null): boolean => {
    if (!gameToCheck) return false;
    if (gameToCheck.only_demo) return true;
    if (gameToCheck.tags && (gameToCheck.tags.includes('demo_playable') || gameToCheck.tags.includes('demo'))) {
        return true;
    }
    // Default to true if not explicitly disabled (e.g. via a 'real_only' tag or specific provider rule)
    // The launchGame service should ultimately confirm this.
    return true; 
  };


  useEffect(() => {
    if (game && !launchUrl && !isLoading && !error) {
      const canPlayReal = isAuthenticated && !game.only_demo;
      const preferDemo = !isAuthenticated || game.only_demo;
      
      if (preferDemo && isDemoModeAvailable(game)) {
         handleLaunchGame('demo');
      }
      // If authenticated and real play is possible, wait for user interaction (buttons below)
    }
  }, [game, launchUrl, isLoading, error, handleLaunchGame, isAuthenticated]);

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
          <p className="text-white/80">Provider: {game.providerName || game.provider_slug || game.provider}</p>
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
            <AspectRatio ratio={16 / 9} className="bg-background/50 flex flex-col items-center justify-center p-4">
                <img src={game.image || game.cover || '/placeholder.svg'} alt={game.title || 'Game image'} className="max-h-[150px] md:max-h-[200px] mb-4 opacity-70 rounded-md object-contain" />
                <p className="text-lg text-white/70 mb-4 text-center">Ready to play {game.title}?</p>
                 <div className="flex flex-col sm:flex-row gap-4">
                    {isAuthenticated && !(game.only_demo) && (
                        <Button onClick={() => handleLaunchGame('real')} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            Play Real Money
                        </Button>
                    )}
                    {isDemoModeAvailable(game) && (
                        <Button onClick={() => handleLaunchGame('demo')} size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                            Play Demo
                        </Button>
                    )}
                </div>
                {!isDemoModeAvailable(game) && !(isAuthenticated && !(game.only_demo)) && (
                     <p className="text-sm text-muted-foreground mt-4">This game may not have a demo version or requires login for real play.</p>
                )}
            </AspectRatio>
        </div>
      )}

      {game && (
        <div className="my-8 p-6 bg-card rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Game Details</h3>
          <p className="text-sm text-muted-foreground mb-1"><strong>RTP:</strong> {game.rtp ? `${game.rtp}%` : 'N/A'}</p>
          <p className="text-sm text-muted-foreground mb-1"><strong>Volatility:</strong> {game.volatility || 'N/A'}</p>
          {game.description && <p className="text-sm text-muted-foreground mt-2">{game.description}</p>}
        </div>
      )}

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
