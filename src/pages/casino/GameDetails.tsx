
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { gameService } from '@/services/gameService'; // Using updated gameService
import { Game } from '@/types'; // Using updated Game type
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Heart, PlayCircle, ChevronLeft } from 'lucide-react';
import RelatedGames from '@/components/games/RelatedGames'; // Assuming this component exists
import GameReviews from '@/components/games/GameReviews'; // Assuming this component exists
import { useGames } from '@/hooks/useGames'; // For favorites and launch
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
// import GameLauncher from '@/components/games/GameLauncher'; // If direct launch button preferred
import LaunchGame from '@/components/casino/LaunchGame'; // Standard launch component

const GameDetails = () => {
  const { gameId } = useParams<{ gameId: string }>(); // gameId can be slug or actual ID
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { favoriteGameIds, toggleFavoriteGame, launchGame, games: allGames } = useGames();

  const { data: game, isLoading, error, refetch } = useQuery<Game | null, Error>({
    queryKey: ['gameDetails', gameId],
    queryFn: () => gameId ? gameService.getGameById(gameId) : Promise.resolve(null), // getGameById handles slug or ID
    enabled: !!gameId,
  });

  useEffect(() => {
    if (gameId) {
      refetch();
    }
  }, [gameId, refetch]);

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast.info("Please log in to add to favorites.");
      return;
    }
    if (game?.id) {
      toggleFavoriteGame(String(game.id));
    }
  };

  // const handlePlay = async (mode: 'real' | 'demo') => {
  //   if (!game) return;
  //   if (!isAuthenticated && mode === 'real') {
  //     toast.error("Please log in to play for real money.");
  //     navigate('/login');
  //     return;
  //   }
  //   try {
  //     const gameUrl = await launchGame(game, { mode });
  //     if (gameUrl) {
  //       window.open(gameUrl, '_blank');
  //     } else {
  //       toast.error("Could not launch game. Please try again later.");
  //     }
  //   } catch (e: any) {
  //     toast.error(`Error launching game: ${e.message}`);
  //   }
  // };
  
  // For RelatedGames, filter some games (excluding current one)
  const relatedGamesList = allGames
    .filter(g => g.id !== game?.id && (g.categoryName === game?.categoryName || g.providerName === game?.providerName))
    .slice(0, 6);


  if (isLoading) return <div className="container mx-auto py-12 text-center"><Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" /><p className="mt-4">Loading game details...</p></div>;
  if (error) return <div className="container mx-auto py-12 text-center text-destructive"><AlertTriangle className="h-12 w-12 mx-auto mb-2" />Error loading game: {error.message}</div>;
  if (!game) return <div className="container mx-auto py-12 text-center text-muted-foreground">Game not found.</div>;

  const isFavorite = favoriteGameIds.has(String(game.id));

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Games
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden shadow-lg">
            <img
              src={game.image || game.cover || '/placeholder.svg'}
              alt={game.title}
              className="object-cover w-full h-full"
            />
          </AspectRatio>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <LaunchGame game={game} mode="real" buttonText="Play Real Money" className="w-full sm:w-auto flex-grow" size="lg" />
            {game.only_demo === false && <LaunchGame game={game} mode="demo" buttonText="Play Demo" variant="secondary" className="w-full sm:w-auto flex-grow" size="lg" />}
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
            <Link to={`/casino/providers/${game.provider_slug || game.providerName}`} className="text-lg text-primary hover:underline mb-4 block">
              By {game.providerName}
            </Link>
          )}

          {game.description && <p className="text-muted-foreground mb-6">{game.description}</p>}

          <div className="space-y-3 mb-6">
            {game.categoryName && <p><strong>Category:</strong> <Badge variant="secondary">{game.categoryName}</Badge></p>}
            {game.rtp && <p><strong>RTP:</strong> {game.rtp}%</p>}
            {game.volatility && <p><strong>Volatility:</strong> <span className="capitalize">{game.volatility}</span></p>}
            {game.releaseDate && <p><strong>Released:</strong> {new Date(game.releaseDate).toLocaleDateString()}</p>}
            {game.lines && <p><strong>Lines:</strong> {game.lines}</p>}
          </div>

          {game.tags && game.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {game.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
              </div>
            </div>
          )}

          {game.features && game.features.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Features:</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                {game.features.map(feature => <li key={feature}>{feature}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Related Games Section */}
      {relatedGamesList.length > 0 && (
        <section className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
          <RelatedGames games={relatedGamesList} />
        </section>
      )}
      
      {/* Game Reviews Section */}
      <section className="mt-12 pt-8 border-t">
         <h2 className="text-2xl font-bold mb-6">Reviews</h2>
         <GameReviews gameId={String(game.id)} />
      </section>

    </div>
  );
};

export default GameDetails;
