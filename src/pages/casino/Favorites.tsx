import { useState, useEffect } from "react";
import CasinoGameGrid from "@/components/casino/CasinoGameGrid";
import { Game } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import MobileWalletSummary from "@/components/user/MobileWalletSummary";
import { useNavigate } from "react-router-dom";
import { gamesDatabaseService } from "@/services/gamesDatabaseService";
import { Button } from "@/components/ui/button"; // Import Button

const Favorites = () => {
  const [favoriteGames, setFavoriteGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to view your favorites");
      navigate("/auth/login");
      return;
    }

    // Add user dependency to refetch if user changes
    if (user?.id) {
        fetchFavoriteGames();
    } else if (isAuthenticated && !user?.id) {
        // User is authenticated but user object might still be loading
        setLoading(true); 
    }

  }, [isAuthenticated, user, navigate]); // Added user and navigate to dependency array

  const fetchFavoriteGames = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const games = await gamesDatabaseService.getFavoriteGames(user.id);
      setFavoriteGames(games);
    } catch (error: any) {
      console.error('Error fetching favorite games:', error);
      toast.error('Failed to load favorite games');
    } finally {
      setLoading(false);
    }
  };

  const handleGameClick = (game: Game) => {
    navigate(`/casino/game/${game.id}`);
  };

  const handleUnfavorite = async (game: Game) => {
    if (!user?.id) {
        toast.error("User not found.");
        return;
    }
    try {
      // gamesDatabaseService.toggleFavorite expects (gameId, userId, isCurrentlyFavorite)
      // Here, we are unfavoriting, so isCurrentlyFavorite is true.
      const success = await gamesDatabaseService.toggleFavorite(game.id, user.id, true); 
      
      if (success) {
        setFavoriteGames(prev => prev.filter(g => g.id !== game.id));
        toast.success(`${game.title} removed from favorites`);
      } else {
        toast.error('Failed to remove from favorites');
      }
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <MobileWalletSummary showRefresh />
      
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Favorite Games</h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          Here are all the games you've marked as favorites. You can quickly access them anytime.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-xl">Loading your favorite games...</p>
        </div>
      ) : favoriteGames.length > 0 ? (
        <CasinoGameGrid 
          games={favoriteGames} 
          onGameClick={handleGameClick}
          // Pass handleUnfavorite to CasinoGameGrid if it supports it,
          // or CasinoGameGrid needs an onFavoriteToggle prop.
          // For now, assuming CasinoGameGrid's GameCard handles its own unfavorite button
          // or this page renders cards that can call handleUnfavorite.
          // If CasinoGameGrid itself needs this:
          // onUnfavoriteClick={handleUnfavorite} 
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-xl mb-4">You don't have any favorite games yet.</p>
          <Button // Use imported Button
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
