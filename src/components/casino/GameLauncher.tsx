import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Game, GameLaunchOptions, GameTag } from '@/types'; // Ensure GameTag is imported
import { gameService } from '@/services/gameService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Loader2, AlertTriangle, Play, Info, Heart, TvMinimalPlay } from 'lucide-react';
import ResponsiveEmbed from '@/components/ResponsiveEmbed'; // For iframe
import { toast } from 'sonner';
import { useGames } from '@/hooks/useGames'; // For favorites
import { cn } from '@/lib/utils';


const GameLauncher: React.FC = () => {
  const { providerSlug, gameSlug } = useParams<{ providerSlug: string; gameSlug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { favoriteGameIds, toggleFavoriteGame, getGameLaunchUrl } = useGames();

  const [game, setGame] = useState<Game | null>(null);
  const [launchOptions, setLaunchOptions] = useState<GameLaunchOptions | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const fetchGameAndLaunchUrl = useCallback(async (mode: 'real' | 'demo') => {
    if (!providerSlug || !gameSlug) {
      setError("Game provider or slug missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIframeUrl(null);

    try {
      let fetchedGame = game;
      if (!fetchedGame) {
        fetchedGame = await gameService.getGameBySlug(gameSlug, providerSlug); // Or however you fetch by combined slugs
        if (!fetchedGame) {
          setError(`Game "${gameSlug}" not found.`);
          setIsLoading(false);
          return;
        }
        setGame(fetchedGame);
      }
      
      const currentLaunchOptions: GameLaunchOptions = {
        mode,
        user_id: user?.id,
        username: user?.email, // Or user?.user_metadata?.username
        currency: 'USD', // This should come from user's wallet or settings
        platform: 'desktop', // Detect or allow selection
        language: 'en', // From user preferences
      };
      setLaunchOptions(currentLaunchOptions);

      const url = await getGameLaunchUrl(fetchedGame, currentLaunchOptions);

      if (url) {
        setIframeUrl(url);
      } else {
        setError(`Could not retrieve launch URL for ${fetchedGame.title} (${mode}).`);
        toast.error(`Failed to launch ${fetchedGame.title}. Please try again.`);
      }
    } catch (err: any) {
      console.error("Error launching game:", err);
      setError(err.message || "Failed to load game details or launch URL.");
      toast.error("An error occurred while launching the game.");
    } finally {
      setIsLoading(false);
    }
  }, [providerSlug, gameSlug, user, game, getGameLaunchUrl]);


  useEffect(() => {
    // Initial load attempt (e.g., demo mode by default or based on query param)
    // For now, let's not auto-launch. User clicks button.
    // If game data is not yet fetched, fetch it.
    const fetchInitialGameData = async () => {
        if (!game && gameSlug && providerSlug) {
            setIsLoading(true);
            try {
                const fetchedGame = await gameService.getGameBySlug(gameSlug, providerSlug);
                if (!fetchedGame) {
                    setError(`Game "${gameSlug}" not found.`);
                } else {
                    setGame(fetchedGame);
                }
            } catch (err: any) {
                setError(err.message || "Failed to load game details.");
            } finally {
                setIsLoading(false);
            }
        }
    };
    fetchInitialGameData();
  }, [gameSlug, providerSlug, game]);

  useEffect(() => {
    if (game) {
      setIsFavorite(favoriteGameIds.has(String(game.id)) || (game.game_id ? favoriteGameIds.has(game.game_id) : false));
    }
  }, [game, favoriteGameIds]);
  
  const handleFavoriteToggle = () => {
    if (!game) return;
    if (!isAuthenticated) {
        toast.info("Please log in to favorite games.");
        return;
    }
    toggleFavoriteGame(String(game.id || game.game_id)); // Pass string ID
  };

  if (isLoading && !game && !iframeUrl) { // Show main loading only if nothing is displayed yet
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading Game...</p>
      </div>
    );
  }

  if (error && !iframeUrl) { // Show main error only if iframe isn't trying to load
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Oops! Something went wrong.</h2>
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }
  
  if (!game) {
     return ( // This state could be hit if initial game fetch fails but not an "error" to show big error screen
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <Info className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground">Game data not available.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
      </div>
    );
  }

  // Determine playability (simplified from EnhancedGameCard)
   const canPlayDemo = !game.only_real || (game.tags && game.tags.some(t => {
    if (typeof t === 'string') return t === 'demo_playable';
    // If tags are GameTag objects, access slug
    if (typeof t === 'object' && t !== null && 'slug' in t) return (t as GameTag).slug === 'demo_playable';
    return false;
  })) || game.only_demo;

  const canPlayReal = isAuthenticated && !game.only_demo;


  return (
    <div className="container mx-auto py-4 md:py-8 px-2">
      {iframeUrl ? (
        <div className="bg-black rounded-lg shadow-2xl overflow-hidden">
            <AspectRatio ratio={16 / 9}>
                <iframe
                    src={iframeUrl}
                    title={game.title || "Game"}
                    className="w-full h-full border-0"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups" // Adjust sandbox as needed
                />
            </AspectRatio>
             <div className="p-4 bg-card-foreground/10 flex justify-between items-center">
                <h1 className="text-xl md:text-2xl font-bold text-card-foreground truncate">{game.title}</h1>
                <Button onClick={() => setIframeUrl(null)} variant="outline">Close Game</Button>
            </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-card p-4 sm:p-6 md:p-8 rounded-lg shadow-xl">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="w-full md:w-1/3">
              <AspectRatio ratio={3/4} className="bg-muted rounded overflow-hidden">
                <img 
                    src={game.image || game.image_url || game.cover || '/placeholder.svg'} 
                    alt={game.title} 
                    className="object-cover w-full h-full"
                    onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                />
              </AspectRatio>
            </div>
            <div className="w-full md:w-2/3 space-y-4">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl md:text-4xl font-bold">{game.title}</h1>
                {isAuthenticated && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary"
                        onClick={handleFavoriteToggle}
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <Heart className={cn("h-6 w-6", isFavorite ? "fill-red-500 text-red-500" : "")} />
                    </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Provider: {game.providerName || game.provider_slug || 'Unknown'}
              </p>
              <p className="text-sm text-muted-foreground">
                Category: {game.categoryName || game.category_slugs?.join(', ') || 'N/A'}
              </p>
              {game.rtp && <p className="text-sm">RTP: {game.rtp}%</p>}
              <p className="text-base leading-relaxed">{game.description || "No description available."}</p>
              
              <div className="pt-4 space-y-3">
                {isLoading && <div className="flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /> <span className="ml-2">Loading launch options...</span></div>}
                
                {error && !isLoading && <p className="text-destructive text-sm flex items-center"><AlertTriangle className="h-4 w-4 mr-2" /> {error}</p>}

                {!isLoading && (
                    <>
                    {canPlayReal && (
                        <Button 
                            size="lg" 
                            className="w-full bg-primary hover:bg-primary/90" 
                            onClick={() => fetchGameAndLaunchUrl('real')}
                            disabled={isLoading}
                        >
                            <Play className="mr-2 h-5 w-5" /> Play Real Money
                        </Button>
                    )}
                    {canPlayDemo && (
                        <Button 
                            size="lg" 
                            variant={canPlayReal ? "outline" : "default"} 
                            className="w-full"
                            onClick={() => fetchGameAndLaunchUrl('demo')}
                            disabled={isLoading}
                        >
                            <TvMinimalPlay className="mr-2 h-5 w-5" /> Play Demo
                        </Button>
                    )}
                    {!canPlayReal && !canPlayDemo && (
                        <p className="text-center text-muted-foreground">Game not available to play.</p>
                    )}
                    </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLauncher;
