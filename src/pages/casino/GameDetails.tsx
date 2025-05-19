
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGames } from '@/hooks/useGames';
import { Game } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Heart, PlayCircle, ArrowLeft, Share2, Info, MessageSquare, Star } from 'lucide-react';
import GameProperties from '@/components/games/GameProperties'; // Placeholder created
import RelatedGames from '@/components/games/RelatedGames'; // Placeholder created
import GameReviews from '@/components/games/GameReviews'; // Placeholder created
import { Skeleton } from '@/components/ui/skeleton';
import ResponsiveEmbed from '@/components/ResponsiveEmbed'; // Assuming this exists for game iframe
import { useAuth } from '@/contexts/AuthContext';


const GameDetailsPage: React.FC = () => {
  const { gameId: gameSlugOrId } = useParams<{ gameId: string }>(); // Renamed for clarity
  const navigate = useNavigate();
  const { 
    getGameBySlug, 
    getGameById, // Assuming you might use ID as fallback
    launchGame, 
    isLoading: gamesLoading, 
    favoriteGameIds, 
    toggleFavoriteGame,
    getRelatedGames, // Added to destructure
    incrementGameView
  } = useGames();
  const { isAuthenticated } = useAuth();

  const [game, setGame] = useState<Game | null>(null);
  const [relatedGamesList, setRelatedGamesList] = useState<Game[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [gameLaunchUrl, setGameLaunchUrl] = useState<string | null>(null);
  const [showGame, setShowGame] = useState(false);

  const fetchGameDetails = useCallback(async () => {
    if (!gameSlugOrId) {
      toast.error("Game identifier is missing.");
      navigate('/casino');
      return;
    }
    setIsLoadingDetails(true);
    let foundGame: Game | null = null;
    // Try fetching by slug first
    if (isNaN(Number(gameSlugOrId))) { // Check if it's not a number, so likely a slug
        foundGame = await getGameBySlug(gameSlugOrId);
    }
    // If not found by slug, or if it was an ID, try by ID
    if (!foundGame) {
        foundGame = await getGameById(gameSlugOrId);
    }

    if (foundGame) {
      setGame(foundGame);
      setIsFavorite(favoriteGameIds.has(foundGame.id as string));
      incrementGameView(foundGame.id as string);

      // Fetch related games
      if (foundGame.category_slugs) {
        const primaryCategory = Array.isArray(foundGame.category_slugs) ? foundGame.category_slugs[0] : foundGame.category_slugs;
        if (primaryCategory) {
            const relGames = await getRelatedGames(primaryCategory, foundGame.id, 5);
            setRelatedGamesList(relGames);
        }
      }

    } else {
      toast.error("Game not found.");
      navigate('/casino');
    }
    setIsLoadingDetails(false);
  }, [gameSlugOrId, getGameBySlug, getGameById, favoriteGameIds, navigate, getRelatedGames, incrementGameView]);

  useEffect(() => {
    fetchGameDetails();
  }, [fetchGameDetails]);

  useEffect(() => {
    if (game) {
      setIsFavorite(favoriteGameIds.has(game.id as string));
    }
  }, [favoriteGameIds, game]);

  const handleToggleFavorite = async () => {
    if (!game) return;
    if (!isAuthenticated) {
      toast.info("Please log in to manage your favorites.");
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    await toggleFavoriteGame(game.id as string);
  };

  const handlePlayGame = async (mode: 'real' | 'demo') => {
    if (!game || !game.game_id || !game.provider_slug) {
      toast.error("Game details are incomplete for launching.");
      return;
    }
    if (!isAuthenticated && mode === 'real') {
        toast.info("Please log in to play with real money.");
        navigate('/login', { state: { from: location.pathname } });
        return;
    }
    
    setShowGame(true); // Show iframe container
    setGameLaunchUrl(null); // Reset previous URL
    // setIsLoadingDetails(true); // Show loading for iframe
    
    const url = await launchGame(game, { mode });
    if (url) {
      setGameLaunchUrl(url);
    } else {
      setShowGame(false); // Hide iframe container if launch fails
      // Error toast is handled by launchGame hook
    }
    // setIsLoadingDetails(false);
  };
  
  if (isLoadingDetails || gamesLoading && !game) {
    return (
      <div className="container mx-auto p-4 animate-pulse">
        <Skeleton className="h-12 w-1/4 mb-4" />
        <Skeleton className="h-96 w-full mb-6" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="text-2xl font-semibold">Game Not Found</h2>
        <p className="text-muted-foreground">The game you are looking for could not be found.</p>
        <Button onClick={() => navigate('/casino')} className="mt-4">Back to Casino</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 md:p-4">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      {showGame && gameLaunchUrl ? (
         <ResponsiveEmbed src={gameLaunchUrl} title={game.title} />
      ) : showGame && !gameLaunchUrl ? (
        <div className="aspect-video bg-black flex items-center justify-center rounded-lg shadow-lg">
            <p className="text-white text-xl">Loading game...</p> {/* Or a spinner */}
        </div>
      ) : game.banner ? (
        <div className="relative mb-6 rounded-lg overflow-hidden shadow-xl aspect-[16/7]">
            <img src={game.banner} alt={`${game.title} banner`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 md:p-8">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 shadow-text">{game.title}</h1>
                <p className="text-md md:text-lg text-casino-gold font-semibold shadow-text">{game.providerName}</p>
            </div>
        </div>
      ) : (
         <div className="mb-6 p-4 bg-card rounded-lg shadow">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{game.title}</h1>
            <p className="text-lg text-muted-foreground">{game.providerName}</p>
        </div>
      )}


      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-card p-4 rounded-lg shadow">
        <div className="flex gap-2">
          <Button size="lg" onClick={() => handlePlayGame('real')} className="bg-primary hover:bg-primary/90">
            <PlayCircle className="mr-2 h-5 w-5" /> Play Real
          </Button>
          <Button size="lg" variant="outline" onClick={() => handlePlayGame('demo')}>
            <PlayCircle className="mr-2 h-5 w-5" /> Play Demo
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleToggleFavorite} title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
            <Heart className={`mr-2 h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
            {isFavorite ? 'Favorited' : 'Favorite'}
          </Button>
          <Button variant="ghost" onClick={() => navigator.clipboard.writeText(window.location.href).then(() => toast.success("Link copied!"))} title="Share game">
            <Share2 className="mr-2 h-5 w-5 text-muted-foreground" /> Share
          </Button>
        </div>
      </div>
      
      {game.description && (
         <div className="mb-6 bg-card p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">About {game.title}</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{game.description}</p>
        </div>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* GameProperties might be part of the main description or a separate component */}
          <GameProperties game={game} />
          <GameReviews gameId={game.id} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <RelatedGames games={relatedGamesList} />
        </div>
      </div>
    </div>
  );
};

export default GameDetailsPage;
