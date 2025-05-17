
import { useState, useEffect } from "react";
import CasinoGameGrid from "@/components/casino/CasinoGameGrid";
import { Game } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import MobileWalletSummary from "@/components/user/MobileWalletSummary";
import { useNavigate } from "react-router-dom";
import { useGames } from "@/hooks/useGames";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const Favorites = () => {
  const [favoriteGames, setFavoriteGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toggleFavoriteGame, getFavoriteGames } = useGames(); 

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to view your favorites");
      navigate("/auth/login");
      return;
    }

    if (user?.id && getFavoriteGames) {
        fetchFavoriteGamesList();
    } else if (isAuthenticated && !user?.id) {
        setLoading(true); 
    }

  }, [isAuthenticated, user, navigate, getFavoriteGames]);

  const fetchFavoriteGamesList = async () => {
    if (!user?.id || !getFavoriteGames) {
        setFavoriteGames([]);
        setLoading(false);
        return;
    }

    try {
      setLoading(true);
      const favGames = await getFavoriteGames();
      setFavoriteGames(favGames);

    } catch (error: any) {
      console.error('Error fetching favorite games:', error);
      toast.error('Failed to load favorite games');
      setFavoriteGames([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGameClick = (game: Game) => {
    navigate(`/casino/game/${game.id}`);
  };

  const handleUnfavorite = async (game: Game) => {
    if (!user?.id || !toggleFavoriteGame) {
        toast.error("User not found or favorite function unavailable.");
        return;
    }
    try {
      await toggleFavoriteGame(game.id); 
      setFavoriteGames(prev => prev.filter(g => g.id !== game.id));
      toast.success(`${game.title} removed from favorites`);
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <MobileWalletSummary showRefresh />
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Favorite Games</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MobileWalletSummary showRefresh />
      
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Favorite Games</h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          Here are all the games you've marked as favorites. You can quickly access them anytime.
        </p>
      </div>

      {favoriteGames.length > 0 ? (
        <CasinoGameGrid 
          games={favoriteGames} 
          onGameClick={handleGameClick}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-xl mb-4">You don't have any favorite games yet.</p>
          <Button
            onClick={() => navigate('/casino')}
            className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black font-medium px-6 py-3 rounded-md"
          >
            Explore Games
          </Button>
        </div>
      )}
    </div>
  );
};

export default Favorites;
