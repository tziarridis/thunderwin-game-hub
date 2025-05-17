
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Game } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Info, Play, Star, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { gamesDatabaseService } from '@/services/gamesDatabaseService';
import LaunchGame from '@/components/casino/LaunchGame';
import MobileWalletSummary from '@/components/user/MobileWalletSummary';
import { incrementViews } from '@/utils/analytics';

const GameDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  // Fix the updateBalance function reference by using refreshWalletBalance instead
  const { user, isAuthenticated, refreshWalletBalance } = useAuth();

  useEffect(() => {
    if (!id) {
      toast.error("Game ID is missing");
      navigate('/casino');
      return;
    }

    fetchGame();
  }, [id, navigate]);

  const fetchGame = async () => {
    try {
      setLoading(true);
      const fetchedGame = await gamesDatabaseService.getGameById(id);

      if (!fetchedGame) {
        toast.error("Game not found");
        navigate('/casino');
        return;
      }

      setGame(fetchedGame);
      setIsFavorite(fetchedGame.isFavorite || false);

      // Increment game views
      gamesDatabaseService.incrementGameView(id);
      incrementViews(fetchedGame.title || 'Unknown Game');
    } catch (error: any) {
      console.error("Error fetching game:", error);
      toast.error(error.message || "Failed to load game details");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add favorites");
      return;
    }

    if (!game?.id || !user?.id) {
      toast.error("Game or user ID is missing");
      return;
    }

    try {
      const success = await gamesDatabaseService.toggleFavorite(game.id.toString(), user.id, isFavorite);
      if (success) {
        setIsFavorite(!isFavorite);
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
            {game.provider} | RTP: {game.rtp}%
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
              <p>${game.minBet}</p>
            </div>
            <div>
              <h4 className="font-semibold">Max Bet:</h4>
              <p>${game.maxBet}</p>
            </div>
            <div>
              <h4 className="font-semibold">Volatility:</h4>
              <p>{game.volatility || 'Medium'}</p>
            </div>
            <div>
              <h4 className="font-semibold">Category:</h4>
              <p>{game.category}</p>
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
          <Button variant="ghost" onClick={toggleFavorite}>
            <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GameDetails;
