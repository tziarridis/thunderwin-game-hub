
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import { useQuery } from '@tanstack/react-query';
import { Game, GameLaunchOptions } from '@/types'; // Added GameLaunchOptions
import { gameService } from '@/services/gameService';
import { Loader2, PlayCircle, Info, ChevronLeft } from 'lucide-react'; // Added icons
import { Button } from '@/components/ui/button'; // Added Button
import { useAuth } from '@/contexts/AuthContext'; // Added useAuth
import { useGames } from '@/hooks/useGames'; // Added useGames for launchGame
import { AspectRatio } from '@/components/ui/aspect-ratio'; // For game image/banner
import ResponsiveEmbed from '@/components/ResponsiveEmbed'; // For game iframe

const GameDetails = () => {
  const { gameId } = useParams<{ gameId: string }>(); // gameId here is slug or actual ID
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { launchGame } = useGames(); // Using launchGame from useGames
  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);


  const fetchGameFunction = async () => {
    if (!gameId) throw new Error("Game identifier is missing");
    // Try fetching by slug, then by ID if that seems more appropriate based on gameId format
    // This logic might need refinement based on how gameId is structured (slug vs db_id)
    // For now, assume gameService.getGameById can handle slug or ID, or use a dedicated getBySlug
    let gameData = await gameService.getGameBySlug(gameId);
    if (!gameData) {
        gameData = await gameService.getGameById(gameId);
    }
    if (!gameData) throw new Error("Game not found after trying slug and ID.");
    return gameData;
  };


  const { data: game, isLoading, error } = useQuery<Game, Error>({
    queryKey: ['gameDetails', gameId],
    queryFn: fetchGameFunction,
    enabled: !!gameId,
  });
  
  const handlePlay = async (mode: 'real' | 'demo') => {
    if (!game) return;
    if (mode === 'real' && !isAuthenticated) {
      navigate('/login', { state: { from: `/casino/game/${gameId}` } });
      return;
    }
    setIsLaunching(true);
    setLaunchUrl(null); 
    const options: GameLaunchOptions = {
      mode,
      user_id: user?.id,
      username: user?.username || user?.email?.split('@')[0],
      currency: user?.user_metadata?.currency || 'USD',
      language: user?.user_metadata?.language || 'en',
      returnUrl: window.location.href, // Or a generic casino page
    };
    try {
      const url = await launchGame(game, options); // Using launchGame from useGames
      if (url) {
        setLaunchUrl(url);
      } else {
        // toast.error("Failed to get game launch URL.");
        console.error("Failed to get game launch URL from useGames hook.");
      }
    } catch (e: any) {
      // toast.error(`Error launching game: ${e.message}`);
      console.error(`Error launching game: ${e.message}`);
    } finally {
      setIsLaunching(false);
    }
  };


  if (isLoading) return <div className="container mx-auto text-center py-12"><Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" /> <p className="mt-4">Loading game details...</p></div>;
  if (error) return <div className="container mx-auto text-center py-12 text-destructive">Error loading game details: {error.message}</div>;
  if (!game) return <div className="container mx-auto text-center py-12">Game not found.</div>;

  const providerDisplay = game.providerName || game.provider_slug || game.provider || 'Unknown Provider';
  let categoryDisplay = 'Unknown Category';
  if (game.categoryName) {
    categoryDisplay = game.categoryName;
  } else if (Array.isArray(game.category_slugs) && game.category_slugs.length > 0) {
    categoryDisplay = game.category_slugs.join(', ');
  } else if (typeof game.category_slugs === 'string') {
    categoryDisplay = game.category_slugs;
  } else if (game.category) {
    categoryDisplay = game.category;
  }
  

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Games
      </Button>

      {launchUrl && (
        <div className="mb-8">
          <ResponsiveEmbed src={launchUrl} title={game.title || "Game Screen"} />
        </div>
      )}

      {!launchUrl && (
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
              <img 
                src={game.banner || game.cover || game.image || '/placeholder.svg'} 
                alt={game.title || 'Game image'}
                className="w-full h-full object-cover" 
              />
            </AspectRatio>
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold mb-2">{game.title}</h1>
            <p className="text-lg text-muted-foreground mb-1">
              By <span className="font-semibold text-primary">{providerDisplay}</span>
            </p>
            <p className="text-md text-muted-foreground mb-4">
              Category: <span className="font-semibold text-primary">{categoryDisplay}</span>
            </p>
            {game.description && <p className="text-muted-foreground mb-6">{game.description}</p>}
            
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated && !(game.tags || []).includes('demo_only') && (
                <Button size="lg" onClick={() => handlePlay('real')} disabled={isLaunching} className="flex-1">
                  {isLaunching && launchUrl === null ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PlayCircle className="mr-2 h-5 w-5" />}
                  Play Real Money
                </Button>
              )}
              {((game.tags || []).includes('demo_playable') || !isAuthenticated || (game.tags || []).includes('demo_only')) && gameService.isDemoAvailable(game) && (
                 <Button size="lg" variant="outline" onClick={() => handlePlay('demo')} disabled={isLaunching} className="flex-1">
                  {isLaunching && launchUrl === null ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PlayCircle className="mr-2 h-5 w-5" />}
                  Play Demo
                </Button>
              )}
            </div>
             {isLaunching && launchUrl === null && <p className="text-sm text-center mt-2">Launching game...</p>}
          </div>
        </div>
      )}

      {!launchUrl && (
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Game Information</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {game.rtp && <p><strong>RTP:</strong> {game.rtp}%</p>}
            {game.volatility && <p><strong>Volatility:</strong> {game.volatility}</p>}
            {game.lines && <p><strong>Lines:</strong> {game.lines}</p>}
            {game.minBet && <p><strong>Min Bet:</strong> {game.minBet}</p>}
            {game.maxBet && <p><strong>Max Bet:</strong> {game.maxBet}</p>}
            {game.features && game.features.length > 0 && <p><strong>Features:</strong> {game.features.join(', ')}</p>}
            {game.themes && game.themes.length > 0 && <p><strong>Themes:</strong> {game.themes.join(', ')}</p>}
            {game.release_date && <p><strong>Release Date:</strong> {new Date(game.release_date).toLocaleDateString()}</p>}
          </div>
        </div>
      )}
      {/* Consider adding RelatedGames component here */}
    </div>
  );
};

export default GameDetails;
