
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGames } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';
import { Game, GameLaunchOptions } from '@/types';
import { toast } from 'sonner';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Home, RefreshCw, Star, Info, Play, Heart } from 'lucide-react';
import ResponsiveEmbed from '@/components/ResponsiveEmbed';
import CasinoGameGrid from '@/components/casino/CasinoGameGrid';
import UserLayout from '@/components/layout/UserLayout'; // For consistent page structure
import { cn } from '@/lib/utils';
// import { gameService } from '@/services/gameService'; // Not needed if using useGames hook for launching

const GameDetailsPage: React.FC = () => {
  const { gameId: gameSlugOrId } = useParams<{ gameId: string }>(); // Can be slug or ID
  const navigate = useNavigate();
  const location = useLocation();
  const { launchGame, getGameById, getGameBySlug, games: allGames, favoriteGameIds, toggleFavoriteGame } = useGames();
  const { user, isAuthenticated } = useAuth();

  const [game, setGame] = useState<Game | null>(null);
  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [isLoadingGame, setIsLoadingGame] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relatedGames, setRelatedGames] = useState<Game[]>([]);
  
  const isFavorite = game ? (favoriteGameIds.has(String(game.id)) || favoriteGameIds.has(String(game.game_id))) : false;


  const loadGameDetails = useCallback(async () => {
    if (!gameSlugOrId) {
      setError("No game identifier provided.");
      setIsLoadingGame(false);
      return;
    }
    setIsLoadingGame(true);
    setError(null);
    setLaunchUrl(null); 
    try {
      let fetchedGame = await getGameBySlug(gameSlugOrId);
      if (!fetchedGame) {
        fetchedGame = await getGameById(gameSlugOrId);
      }
      
      if (fetchedGame) {
        setGame(fetchedGame);
        const currentCategory = fetchedGame.categoryName || (Array.isArray(fetchedGame.category_slugs) ? fetchedGame.category_slugs[0] : fetchedGame.category_slugs) || fetchedGame.category;
        const currentProvider = fetchedGame.providerName || fetchedGame.provider_slug || fetchedGame.provider;

        const filteredRelatedGames = allGames
          .filter(g => {
            const gCategory = g.categoryName || (Array.isArray(g.category_slugs) ? g.category_slugs[0] : g.category_slugs) || g.category;
            const gProvider = g.providerName || g.provider_slug || g.provider;
            return String(g.id) !== String(fetchedGame!.id) && (gCategory === currentCategory || gProvider === currentProvider);
          })
          .slice(0, 6); 
        setRelatedGames(filteredRelatedGames);
      } else {
        setError(`Game with identifier "${gameSlugOrId}" not found.`);
        toast.error("Game not found.");
      }
    } catch (err: any) {
      console.error("Error fetching game details:", err);
      setError(err.message || "Failed to load game details.");
      toast.error(err.message || "Failed to load game details.");
    } finally {
      setIsLoadingGame(false);
    }
  }, [gameSlugOrId, getGameById, getGameBySlug, allGames]);

  useEffect(() => {
    loadGameDetails();
  }, [loadGameDetails]);


  const handleLaunchGame = useCallback(async (mode: 'real' | 'demo') => {
    if (!game) {
      toast.error("Game data is not loaded yet.");
      return;
    }
    if (mode === 'real' && !isAuthenticated) {
      toast.info("Please log in to play for real money.", {
        action: { label: "Log In", onClick: () => navigate('/login', { state: { from: location.pathname } }) }
      });
      return;
    }

    setIsLaunching(true); 
    setError(null);

    const launchOptions: GameLaunchOptions = {
      mode,
      user_id: user?.id,
      username: user?.username || user?.email?.split('@')[0],
      currency: user?.user_metadata?.currency || 'USD',
      platform: 'web',
      language: user?.user_metadata?.language || 'en',
      returnUrl: `${window.location.origin}/casino`
    };

    try {
      const url = await launchGame(game, launchOptions);
      if (url) {
        setLaunchUrl(url);
        // Scroll to top or to the game iframe if needed
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError("Could not retrieve game launch URL. The game might be unavailable.");
        toast.error("Could not retrieve game launch URL.");
      }
    } catch (err: any) {
      console.error("Error launching game:", err);
      setError(err.message || "Failed to launch game.");
      toast.error(err.message || "Failed to launch game. Please try again later.");
    } finally {
      setIsLaunching(false);
    }
  }, [game, isAuthenticated, user, launchGame, navigate, location.pathname]);

  const handleToggleFavorite = () => {
    if (!game) return;
    if (!isAuthenticated) {
        toast.info("Please log in to manage your favorites.");
        return;
    }
    toggleFavoriteGame(String(game.id || game.game_id));
  };
  
  const isDemoModeAvailable = (gameToCheck: Game | null): boolean => {
    if (!gameToCheck) return false;
    if (gameToCheck.tags && (gameToCheck.tags.includes('demo_playable') || gameToCheck.tags.includes('demo'))) return true;
    // Add more sophisticated logic if needed, e.g. checking provider capabilities.
    // For now, if not tagged, assume demo might not be explicitly supported this way.
    return false; 
  };


  if (isLoadingGame) {
    return (
      <UserLayout>
        <div className="container mx-auto p-4 min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-xl font-semibold">Loading Game Details...</p>
        </div>
      </UserLayout>
    );
  }

  if (error && !launchUrl) {
    return (
      <UserLayout>
        <div className="container mx-auto p-4 min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-xl font-semibold text-destructive mb-2">Error Loading Game</p>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/casino')} variant="outline">
              <Home className="mr-2 h-4 w-4" /> Go to Casino
            </Button>
            <Button onClick={loadGameDetails}>
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!game) {
     return (
      <UserLayout>
        <div className="container mx-auto p-4 min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-xl font-semibold">Game Not Found</p>
          <p className="text-muted-foreground mb-6">The game you are looking for could not be found.</p>
          <Button onClick={() => navigate('/casino')} variant="outline">
            <Home className="mr-2 h-4 w-4" /> Back to Casino
          </Button>
        </div>
      </UserLayout>
    );
  }

  // Game is loaded, display details or launcher
  return (
    <UserLayout>
      <div className="container mx-auto p-2 md:p-4">
        {launchUrl && !isLaunching ? (
          <ResponsiveEmbed src={launchUrl} title={game.title} />
        ) : (
          <div className="w-full bg-card rounded-lg shadow-xl overflow-hidden mb-8">
            <AspectRatio ratio={16 / 9} className="bg-black flex flex-col items-center justify-center p-4 relative">
              {isLaunching ? (
                 <Loader2 className="h-12 w-12 animate-spin text-primary" />
              ): (
                <>
                    <img 
                        src={game.banner || game.cover || game.image || '/placeholder.svg'} 
                        alt={game.title} 
                        className="max-h-[60%] md:max-h-[70%] mb-4 opacity-80 rounded-md object-contain" 
                    />
                    <div className="absolute top-4 right-4 z-10">
                        {isAuthenticated && (
                            <Button variant="ghost" size="icon" onClick={handleToggleFavorite} className="text-white hover:text-red-500 bg-black/30 hover:bg-black/50 rounded-full">
                                <Heart className={cn("h-6 w-6", isFavorite ? "fill-red-500 text-red-500" : "")} />
                            </Button>
                        )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 text-center">{game.title}</h1>
                    <p className="text-sm text-muted-foreground mb-6 text-center">By {game.providerName || game.provider_slug || 'Unknown Provider'}</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        {isAuthenticated && !(game.tags || []).includes('demo_only') && (
                            <Button onClick={() => handleLaunchGame('real')} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                <Play className="mr-2 h-5 w-5" /> Play Real Money
                            </Button>
                        )}
                        {isDemoModeAvailable(game) && (
                            <Button 
                                onClick={() => handleLaunchGame('demo')} 
                                size="lg" 
                                variant={isAuthenticated && !(game.tags || []).includes('demo_only') ? "outline" : "secondary"}
                                className={cn(isAuthenticated && !(game.tags || []).includes('demo_only') && "border-primary text-primary hover:bg-primary/10")}
                            >
                                <Play className="mr-2 h-5 w-5" /> Play Demo
                            </Button>
                        )}
                    </div>
                    {!isDemoModeAvailable(game) && !(isAuthenticated && !(game.tags || []).includes('demo_only')) && (
                        <p className="text-xs text-muted-foreground mt-4">
                            {isAuthenticated ? "Demo not available for this game." : "Log in for real play or check demo availability."}
                        </p>
                    )}
                </>
              )}
            </AspectRatio>
          </div>
        )}

        <div className="my-8 p-4 md:p-6 bg-card rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Game Information</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <p><strong>Provider:</strong> {game.providerName || game.provider_slug || 'N/A'}</p>
            <p><strong>Category:</strong> {game.categoryName || (Array.isArray(game.category_slugs) ? game.category_slugs.join(', ') : game.category_slugs) || 'N/A'}</p>
            <p><strong>RTP:</strong> {game.rtp ? `${game.rtp}%` : 'N/A'}</p>
            <p><strong>Volatility:</strong> {game.volatility || 'N/A'}</p>
            {game.release_date && <p><strong>Release Date:</strong> {new Date(game.release_date).toLocaleDateString()}</p>}
            {game.lines && <p><strong>Lines:</strong> {game.lines}</p>}
          </div>
          {game.description && <p className="mt-4 text-muted-foreground">{game.description}</p>}
          {game.features && game.features.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-1">Features:</h3>
              <div className="flex flex-wrap gap-2">
                {game.features.map(feature => <span key={feature} className="bg-secondary text-secondary-foreground px-2 py-1 text-xs rounded">{feature}</span>)}
              </div>
            </div>
          )}
           {game.tags && game.tags.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-1">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {game.tags.map(tag => <span key={tag} className="bg-muted text-muted-foreground px-2 py-1 text-xs rounded">{tag}</span>)}
              </div>
            </div>
          )}
        </div>

        {relatedGames.length > 0 && !launchUrl && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">You Might Also Like</h2>
            <CasinoGameGrid
              games={relatedGames}
              onGameClick={(clickedGame) => navigate(`/casino/game/${clickedGame.slug || String(clickedGame.id)}`)}
            />
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default GameDetailsPage;

