
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Game, DbGame, ApiResponse } from '@/types'; // Added ApiResponse
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Info, Play, Star, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { gamesDatabaseService } from '@/services/gamesDatabaseService';
import LaunchGame from '@/components/casino/LaunchGame';
import MobileWalletSummary from '@/components/user/MobileWalletSummary';
import { useGames } from '@/hooks/useGames';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

const mapDbGameToGame = (dbGame: DbGame): Game => {
  let categorySlugsArray: string[] = [];
  if (typeof dbGame.category_slugs === 'string') {
    categorySlugsArray = dbGame.category_slugs.split(',').map(s => s.trim()).filter(Boolean);
  } else if (Array.isArray(dbGame.category_slugs)) {
    categorySlugsArray = dbGame.category_slugs.filter(s => typeof s === 'string');
  }
  
  return {
    id: dbGame.id || String(Date.now()), // Ensure ID exists
    title: dbGame.title || "Unknown Game",
    provider: dbGame.provider_slug || dbGame.provider_id || "Unknown Provider",
    provider_slug: dbGame.provider_slug,
    provider_id: dbGame.provider_id,
    image: dbGame.cover || dbGame.image_url || "/placeholder.svg",
    rtp: dbGame.rtp || 0,
    category: categorySlugsArray[0] || "Unknown",
    category_slugs: categorySlugsArray,
    description: dbGame.description,
    volatility: dbGame.volatility,
    minBet: dbGame.min_bet,
    maxBet: dbGame.max_bet,
    isFavorite: false, // This will be set by useEffect checking favorite status
    isNew: !!dbGame.is_new,
    isPopular: !!dbGame.is_popular,
    is_featured: !!dbGame.is_featured,
    show_home: !!dbGame.show_home,
    status: dbGame.status,
    slug: dbGame.slug,
    views: dbGame.views,
    release_date: dbGame.release_date,
    // map other fields from DbGame to Game as needed
  } as Game; // Cast as Game, ensure all required Game fields are present
};


const GameDetails = () => {
  const { gameId: idFromParams } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavoriteLocal, setIsFavoriteLocal] = useState(false); // Renamed to avoid conflict with type
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toggleFavoriteGame, favoriteGameIds, getGameById: getGameFromHook } = useGames(); // Use favoriteGameIds from context

  useEffect(() => {
    if (!idFromParams) {
      toast.error("Game ID is missing");
      navigate('/casino');
      return;
    }
    fetchGameDetails();
  }, [idFromParams, navigate]);

  useEffect(() => {
    if (game && user && favoriteGameIds) { // Check favoriteGameIds from context
        setIsFavoriteLocal(favoriteGameIds.has(game.id));
    }
  }, [game, user, favoriteGameIds]);


  const fetchGameDetails = async () => {
    if (!idFromParams) return;
    try {
      setLoading(true);
      // Option 1: Use getGameById from useGames hook if it fetches full details
      // const fetchedGameFromHook = await getGameFromHook(idFromParams);
      // if (fetchedGameFromHook) {
      //   setGame(fetchedGameFromHook);
      // } else {
      //   toast.error("Game not found via hook");
      //   navigate('/casino');
      //   return;
      // }

      // Option 2: Use direct service call if hook doesn't provide enough detail or for specific page logic
      const apiResponse: ApiResponse<DbGame> = await gamesDatabaseService.getGameById(idFromParams);

      if (!apiResponse.success || !apiResponse.data) {
        toast.error(apiResponse.error || "Game not found");
        navigate('/casino');
        return;
      }
      
      const fetchedGame = mapDbGameToGame(apiResponse.data);
      setGame(fetchedGame);
      
      // Increment view count (if service available and desired)
      // await gamesDatabaseService.incrementGameViews(idFromParams); 
    } catch (error: any) {
      console.error("Error fetching game:", error);
      toast.error(error.message || "Failed to load game details");
      navigate('/casino');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add favorites");
      navigate('/auth/login'); // Redirect to login
      return;
    }
    if (!game?.id || !user?.id || !toggleFavoriteGame) {
      toast.error("Game or user ID is missing, or favorite function unavailable.");
      return;
    }

    try {
      // toggleFavoriteGame from useGames hook expects only gameId
      await toggleFavoriteGame(game.id); 
      // The hook should handle toasting success/failure and updating favoriteGameIds
      // Local state is updated via useEffect listening to favoriteGameIds change from context
      // If optimistic update is preferred here:
      setIsFavoriteLocal(!isFavoriteLocal); 
      toast.success(!isFavoriteLocal ? "Added to favorites" : "Removed from favorites");
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      toast.error(error.message || "Error updating favorites");
      // Revert optimistic update on error if needed by re-fetching status or using old value
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <MobileWalletSummary showRefresh />
        <Skeleton className="max-w-3xl mx-auto h-[600px] rounded-lg" />
      </div>
    );
  }

  if (!game) {
    return (
       <div className="container mx-auto px-4 py-8 text-center">
         <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
         <p className="text-xl text-red-400">Game not found.</p>
         <Button onClick={() => navigate('/casino')} className="mt-4">Back to Casino</Button>
       </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MobileWalletSummary showRefresh />

      <Card className="max-w-3xl mx-auto bg-card border-border/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-white">{game.title}</CardTitle>
          <CardDescription className="text-gray-400">
            Provider: {game.providerName || game.provider} | RTP: {game.rtp ? `${game.rtp}%` : 'N/A'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative group">
            <img
              src={game.image}
              alt={game.title}
              className="w-full rounded-md aspect-video object-cover shadow-lg"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-md">
                <LaunchGame game={game} className="px-8 py-4 text-lg font-semibold"/>
            </div>
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {game.isPopular && (
                <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-sm font-semibold flex items-center shadow">
                  <Star className="h-3.5 w-3.5 mr-1" /> Popular
                </span>
              )}
              {game.isNew && (
                <span className="bg-casino-thunder-green text-black text-xs px-2 py-1 rounded-sm font-semibold flex items-center shadow">
                  <Zap className="h-3.5 w-3.5 mr-1" /> New
                </span>
              )}
            </div>
          </div>

          <p className="text-gray-300">{game.description || 'No description available.'}</p>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-x-6 gap-y-4 text-sm border-t border-border/20 pt-4">
            <div>
              <h4 className="font-semibold text-gray-200">Min Bet:</h4>
              <p className="text-gray-400">{game.minBet != null ? `$${game.minBet.toFixed(2)}`: 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-200">Max Bet:</h4>
              <p className="text-gray-400">{game.maxBet != null ? `$${game.maxBet.toFixed(2)}`: 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-200">Volatility:</h4>
              <p className="text-gray-400 capitalize">{game.volatility || 'Medium'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-200">Category:</h4>
              <p className="text-gray-400">{game.categoryName || game.category}</p>
            </div>
             {game.release_date && (
                <div>
                    <h4 className="font-semibold text-gray-200">Release Date:</h4>
                    <p className="text-gray-400">{new Date(game.release_date).toLocaleDateString()}</p>
                </div>
            )}
            {game.views != null && (
                 <div>
                    <h4 className="font-semibold text-gray-200">Views:</h4>
                    <p className="text-gray-400">{game.views}</p>
                </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-2 pt-6 border-t border-border/20">
          <div className="flex gap-2">
            <LaunchGame game={game} variant="default" className="min-w-[120px]" />
            <Button variant="outline" onClick={() => navigate('/casino')} className="min-w-[120px]">
              <Info className="h-4 w-4 mr-2" />
              More Games
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="lg" 
            onClick={handleToggleFavorite} 
            className="flex items-center gap-2 text-white hover:bg-white/10 px-4 py-2 rounded-md"
            aria-label={isFavoriteLocal ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`h-6 w-6 transition-all duration-200 ${isFavoriteLocal ? 'text-red-500 fill-red-500' : 'text-white group-hover:text-red-400'}`} />
            <span className="hidden sm:inline">{isFavoriteLocal ? 'Favorited' : 'Add to Favorites'}</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GameDetails;
