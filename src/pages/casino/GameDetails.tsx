import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { gameService } from '@/services/gameService';
import { Game, GameProvider, GameCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import RelatedGames from '@/components/games/RelatedGames'; // Ensure props are correct
import GameReviews from '@/components/games/GameReviews'; // Ensure props are correct
import GameProperties from '@/components/games/GameProperties'; // Ensure props are correct
import { Star, PlayCircle, Heart, Loader2, AlertTriangle, ArrowLeft, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGames } from '@/hooks/useGames'; // For favorites and launch
import { toast } from 'sonner';
import AppLayout from '@/components/layout/AppLayout';

// Function to fetch game details, provider, and category
const fetchGameDetails = async (gameIdOrSlug: string): Promise<{ game: Game; provider?: GameProvider; category?: GameCategory }> => {
  // This function should fetch game, and optionally its provider and category details
  // For simplicity, we assume gameService.getGameById includes enough details or separate calls are made.
  
  // Try fetching by slug first, then by ID if slug fails or is numeric ID
  let gameData: Game | null = null;
  try {
    gameData = await gameService.getGameBySlug(gameIdOrSlug);
  } catch (slugError) {
    console.warn(`Failed to fetch game by slug "${gameIdOrSlug}", trying by ID if applicable.`);
    // If gameIdOrSlug could be an ID (e.g., numeric or UUID), try fetching by ID
    // This part depends on how your IDs vs slugs are structured.
    // For now, we'll assume getGameById can handle either a numeric ID or a slug if getGameBySlug is not specific.
    // Or, if you have a clear distinction:
    // if (isNumeric(gameIdOrSlug) || isUUID(gameIdOrSlug)) {
    //   gameData = await gameService.getGameById(gameIdOrSlug);
    // } else {
    //   throw slugError; // Re-throw if it wasn't an ID-like slug
    // }
    // Simplified: Assume getGameById handles it.
    try {
        gameData = await gameService.getGameById(gameIdOrSlug);
    } catch (idError) {
        console.error(`Failed to fetch game by ID "${gameIdOrSlug}" as well.`);
        throw idError; // Or a combined error
    }
  }

  if (!gameData) {
    throw new Error(`Game with identifier "${gameIdOrSlug}" not found.`);
  }

  // Optionally fetch provider and category details if not embedded or if more info needed
  let providerData: GameProvider | undefined = undefined;
  if (gameData.provider_id) {
    try {
      // providerData = await gameService.getProviderById(String(gameData.provider_id)); // Assuming String conversion if needed
      // Mocking for now if service method doesn't exist
      providerData = { id: String(gameData.provider_id), name: `Provider ${gameData.provider_id}`, slug: `provider-${gameData.provider_id}`, status: 'active', created_at: '', updated_at: '' };
    } catch (e) { console.warn("Failed to fetch provider details for game."); }
  }

  let categoryData: GameCategory | undefined = undefined;
  if (gameData.category_id) {
     try {
      // categoryData = await gameService.getCategoryById(String(gameData.category_id));
      // Mocking for now
      categoryData = { id: String(gameData.category_id), name: `Category ${gameData.category_id}`, slug: `category-${gameData.category_id}`, status: 'active', created_at: '', updated_at: '' };
    } catch (e) { console.warn("Failed to fetch category details for game."); }
  }
  
  return { game: gameData, provider: providerData, category: categoryData };
};


const GameDetailsPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>(); // gameId here can be slug or actual ID
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { favoriteGameIds, toggleFavoriteGame, launchGame } = useGames(); // Use useGames hook

  const { data, isLoading, error } = useQuery<{ game: Game; provider?: GameProvider; category?: GameCategory }, Error>({
    queryKey: ['gameDetails', gameId],
    queryFn: () => fetchGameDetails(gameId!),
    enabled: !!gameId,
  });

  if (isLoading) {
    return <AppLayout><div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></AppLayout>;
  }

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8 px-4 text-center">
           <Button variant="ghost" onClick={() => navigate(-1)} className="absolute top-20 left-4 sm:left-8 z-20">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back
          </Button>
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4 mt-20" />
          <h2 className="text-3xl font-semibold mb-2">Game Not Found</h2>
          <p className="text-muted-foreground mb-6">{error.message || "The game you are looking for could not be loaded or does not exist."}</p>
          <Button onClick={() => navigate('/casino')}>Explore Other Games</Button>
        </div>
      </AppLayout>
    );
  }

  if (!data || !data.game) {
    return <AppLayout><div className="text-center py-10">Game data is unavailable.</div></AppLayout>;
  }

  const { game, provider, category } = data;
  const isFavorite = favoriteGameIds.has(String(game.id));

  const handlePlayGame = async (mode: 'real' | 'demo') => {
    try {
      const launchUrl = await launchGame(game, { mode });
      if (launchUrl) {
        // For seamless, might open in iframe or new tab. For now, new tab.
        window.open(launchUrl, '_blank');
      } else {
        toast.error("Could not launch game. Launch URL not available.");
      }
    } catch (err: any) {
      toast.error(`Failed to launch game: ${err.message}`);
    }
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Game Image & Actions */}
          <div className="md:col-span-1 space-y-6">
            <AspectRatio ratio={3 / 4} className="bg-muted rounded-lg overflow-hidden shadow-lg">
              <img src={game.image_url || '/placeholder.svg'} alt={game.title} className="object-cover w-full h-full" />
            </AspectRatio>
            <div className="space-y-2">
              <Button onClick={() => handlePlayGame('real')} size="lg" className="w-full bg-green-500 hover:bg-green-600">
                <PlayCircle className="mr-2 h-5 w-5" /> Play Real Money
              </Button>
              {game.features?.includes('demo_mode') && ( // Assuming 'features' array indicates demo availability
                <Button onClick={() => handlePlayGame('demo')} size="lg" variant="outline" className="w-full">
                  <PlayCircle className="mr-2 h-5 w-5" /> Play Demo
                </Button>
              )}
            </div>
            {isAuthenticated && (
              <Button variant="outline" onClick={() => toggleFavoriteGame(String(game.id))} className="w-full">
                <Heart className={`mr-2 h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>
            )}
          </div>

          {/* Right Column: Game Info & Details */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">{game.title}</h1>
              <div className="flex items-center space-x-4 text-muted-foreground mb-4">
                {provider && (
                    <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/casino/providers/${provider.slug}`)}>
                        By {provider.name}
                    </span>
                )}
                {category && <span>| <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/casino/categories/${category.slug}`)}>{category.name}</span></span>}
              </div>
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < (game.rtp && game.rtp > 95 ? 4 : 3) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} /> // Mock rating based on RTP
                ))}
                <span className="text-sm text-muted-foreground ml-1">(Mocked Rating)</span>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">{game.description || "No description available."}</p>
            </div>
            
            <GameProperties game={game} providerName={provider?.name} categoryName={category?.name} />

            {/* Related Games - Ensure props are correct for RelatedGames component */}
            <RelatedGames 
                currentGameId={String(game.id)} 
                categoryId={game.category_id} 
                providerId={game.provider_id} 
                tags={game.tags} 
            />

            {/* Game Reviews - Ensure props are correct */}
            <GameReviews gameId={String(game.id)} />

            {game.external_url && (
              <Button variant="link" asChild>
                <a href={game.external_url} target="_blank" rel="noopener noreferrer">
                  More Info on Provider Site <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default GameDetailsPage;
