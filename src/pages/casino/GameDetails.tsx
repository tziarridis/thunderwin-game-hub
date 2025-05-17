
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Game, DbGame } from '@/types'; // Added DbGame
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Info, Play, Star, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { gamesDatabaseService } from '@/services/gamesDatabaseService'; // Assuming this service is available and getGameById works
// import { incrementViews } from '@/utils/analytics'; // incrementViews might be from a different source or removed
import LaunchGame from '@/components/casino/LaunchGame';
import MobileWalletSummary from '@/components/user/MobileWalletSummary';
import { useGames } from '@/hooks/useGames'; // For favorite logic

// Helper function to map DbGame to Game if needed, or assume they are compatible for now
const mapDbGameToGame = (dbGame: DbGame): Game => {
  // This mapping depends on the actual differences between DbGame and Game.
  // If they are mostly compatible, direct casting might work, but a proper mapping is safer.
  return {
    ...dbGame,
    id: dbGame.id || dbGame.game_id || String(Date.now()), // Ensure ID exists
    title: dbGame.game_name || dbGame.title || "Unknown Game",
    provider: dbGame.provider_slug || dbGame.provider_id || "Unknown Provider", // Map provider_id/slug to name if possible
    image: dbGame.cover || dbGame.image_url || "/placeholder.svg",
    rtp: dbGame.rtp || 0,
    category: dbGame.category_slugs?.[0] || "Unknown", // Simplified category
    isFavorite: dbGame.is_favorite || false,
    isNew: dbGame.is_new || false,
    isPopular: dbGame.is_popular || false,
    // Add other necessary mappings
  } as Game; // Cast as Game, ensure all required Game fields are present
};


const GameDetails = () => {
  const { gameId: idFromParams } = useParams<{ gameId: string }>(); // Renamed to avoid conflict
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshWalletBalance } = useAuth();
  const { toggleFavoriteGame, getFavoriteGameIds } = useGames();

  useEffect(() => {
    if (!idFromParams) {
      toast.error("Game ID is missing");
      navigate('/casino');
      return;
    }
    fetchGame();
  }, [idFromParams, navigate]);

  useEffect(() => {
    // Update local isFavorite state when game or user changes
    const checkFavoriteStatus = async () => {
        if (game && user && getFavoriteGameIds) {
            const favoriteIds = await getFavoriteGameIds(user.id);
            setIsFavorite(favoriteIds.includes(game.id));
        }
    };
    checkFavoriteStatus();
  }, [game, user, getFavoriteGameIds]);


  const fetchGame = async () => {
    if (!idFromParams) return;
    try {
      setLoading(true);
      // Assuming gamesDatabaseService.getGameById returns ApiResponse<DbGame>
      // And Game type is what the UI components expect.
      const apiResponse = await gamesDatabaseService.getGameById(idFromParams);

      if (!apiResponse || !apiResponse.data) {
        toast.error("Game not found");
        navigate('/casino');
        return;
      }
      
      const fetchedGame = mapDbGameToGame(apiResponse.data);
      setGame(fetchedGame);
      // isFavorite state will be set by the separate useEffect

      // gamesDatabaseService.incrementGameView(id); // Method seems unavailable
      // incrementViews(fetchedGame.title || 'Unknown Game'); // Utils function, ensure it exists
    } catch (error: any) {
      console.error("Error fetching game:", error);
      toast.error(error.message || "Failed to load game details");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add favorites");
      return;
    }
    if (!game?.id || !user?.id || !toggleFavoriteGame) {
      toast.error("Game or user ID is missing, or favorite function unavailable.");
      return;
    }

    try {
      const success = await toggleFavoriteGame(game.id, user.id);
      if (success) {
        setIsFavorite(!isFavorite); // Optimistically update UI or refetch status
        toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
      } else {
        toast.error("Failed to update favorites");
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      toast.error(error.message || "Error updating favorites");
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading game details...</div>;
  }

  if (!game) {
    return <div className="container mx-auto px-4 py-8">Game not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MobileWalletSummary showRefresh />

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{game.title}</CardTitle>
          <CardDescription>
            Provider: {game.providerName || game.provider} | RTP: {game.rtp}%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <img
              src={game.image}
              alt={game.title}
              className="w-full rounded-md aspect-video object-cover"
            />
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {game.isPopular && (
                <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-sm font-medium flex items-center">
                  <Star className="h-3 w-3 mr-1" /> Popular
                </span>
              )}
              {game.isNew && (
                <span className="bg-casino-thunder-green text-black text-xs px-2 py-1 rounded-sm font-medium">
                  <Zap className="h-3 w-3 mr-1" /> New
                </span>
              )}
            </div>
          </div>

          <p>{game.description || 'No description available.'}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Min Bet:</h4>
              <p>{game.minBet != null ? `$${game.minBet}`: 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-semibold">Max Bet:</h4>
              <p>{game.maxBet != null ? `$${game.maxBet}`: 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-semibold">Volatility:</h4>
              <p>{game.volatility || 'Medium'}</p>
            </div>
            <div>
              <h4 className="font-semibold">Category:</h4>
              <p>{game.categoryName || game.category}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            <LaunchGame game={game} />
            <Button variant="outline" onClick={() => navigate('/casino')}>
              <Info className="h-4 w-4 mr-2" />
              More Games
            </Button>
          </div>
          <Button variant="ghost" onClick={handleToggleFavorite}>
            <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GameDetails;
