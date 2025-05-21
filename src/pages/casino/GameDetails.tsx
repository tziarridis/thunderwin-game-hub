
import React, { useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { gameService } from '@/services/gameService';
import { Game } from '@/types';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Heart, ChevronLeft } from 'lucide-react';
import RelatedGames from '@/components/games/RelatedGames';
import GameReviews from '@/components/games/GameReviews';
import { useGames } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import LaunchGameButton from '@/components/casino/LaunchGameButton'; // Use the new button component

const GameDetails = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { favoriteGameIds, toggleFavoriteGame, games: allGames } = useGames();

  const { data: game, isLoading, error, refetch } = useQuery<Game | null, Error>({
    queryKey: ['gameDetails', gameId],
    queryFn: async () => {
        if (!gameId) return null;
        // Try fetching by slug first, then by ID as a fallback
        // This assumes gameService.getGameById can handle both or you have getGameBySlug
        let fetchedGame = await gameService.getGameBySlug(gameId);
        if (!fetchedGame) {
            fetchedGame = await gameService.getGameById(gameId);
        }
        return fetchedGame;
    },
    enabled: !!gameId,
  });

  useEffect(() => {
    if (gameId) {
      refetch();
    }
    // Scroll to top when component mounts or gameId changes
    window.scrollTo(0, 0);
  }, [gameId, refetch]);

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast.info("Please log in to add to favorites.");
      return;
    }
    if (game?.id) {
      toggleFavoriteGame(String(game.id)); // Ensure game.id is string
    }
  };
  
  const relatedGamesList = useMemo(() => {
    if (!game || !allGames) return [];
    return allGames
    .filter(g => String(g.id) !== String(game.id) && (g.categoryName === game.categoryName || g.providerName === game.providerName))
    .slice(0, 6);
  }, [game, allGames]);


  if (isLoading) return <div className="container mx-auto py-12 text-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" /><p className="mt-4">Loading game details...</p></div>;
  if (error) return <div className="container mx-auto py-12 text-center min-h-screen text-destructive"><AlertTriangle className="h-12 w-12 mx-auto mb-2" />Error loading game: {error.message}</div>;
  if (!game) return <div className="container mx-auto py-12 text-center min-h-screen text-muted-foreground">Game not found.</div>;

  const isFavorite = favoriteGameIds.has(String(game.id)); // Ensure game.id is string
  const canPlayDemo = !game.only_real; // Check if demo mode is allowed

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden shadow-lg">
            <img
              src={game.image || game.cover || '/placeholder.svg'}
              alt={game.title || 'Game image'}
              className="object-cover w-full h-full"
            />
          </AspectRatio>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <LaunchGameButton 
              game={game} 
              mode="real" 
              buttonText="Play Real Money" 
              className="w-full sm:w-auto flex-grow" 
              size="lg" 
            />
            {canPlayDemo && (
              <LaunchGameButton 
                game={game} 
                mode="demo" 
                buttonText="Play Demo" 
                variant="secondary" 
                className="w-full sm:w-auto flex-grow" 
                size="lg" 
              />
            )}
            {isAuthenticated && (
              <Button variant="outline" size="lg" onClick={handleToggleFavorite} className="w-full sm:w-auto">
                <Heart className={`mr-2 h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                {isFavorite ? 'Favorited' : 'Favorite'}
              </Button>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{game.title}</h1>
          {game.providerName && (
            <Link 
                to={`/casino/providers/${game.provider_slug || game.providerName.toLowerCase().replace(/\s+/g, '-')}`} 
                className="text-lg text-primary hover:underline mb-4 block"
            >
              By {game.providerName}
            </Link>
          )}

          {game.description && <p className="text-muted-foreground mb-6">{game.description}</p>}

          <div className="space-y-3 mb-6 text-sm">
            {game.categoryName && <p><strong>Category:</strong> <Badge variant="secondary">{game.categoryName}</Badge></p>}
            {game.rtp && <p><strong>RTP:</strong> {game.rtp}%</p>}
            {game.volatility && <p><strong>Volatility:</strong> <span className="capitalize">{game.volatility}</span></p>}
            {game.releaseDate && <p><strong>Released:</strong> {new Date(game.releaseDate).toLocaleDateString()}</p>}
            {game.lines && <p><strong>Paylines:</strong> {game.lines}</p>}
          </div>

          {game.tags && game.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-sm">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {game.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
              </div>
            </div>
          )}

          {game.features && game.features.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-sm">Features:</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 text-xs">
                {game.features.map(feature => <li key={feature}>{feature}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      {relatedGamesList.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
          <RelatedGames games={relatedGamesList} />
        </section>
      )}
      
      <section className="mt-12 pt-8 border-t border-border">
         <h2 className="text-2xl font-bold mb-6">Reviews</h2>
         <GameReviews gameId={String(game.id)} />
      </section>

    </div>
  );
};

export default GameDetails;
