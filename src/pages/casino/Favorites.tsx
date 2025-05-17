
import { useState, useEffect } from "react";
import CasinoGameGrid from "@/components/casino/CasinoGameGrid";
import { Game } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import MobileWalletSummary from "@/components/user/MobileWalletSummary";
import { useNavigate } from "react-router-dom";
// import { gamesDatabaseService } from "@/services/gamesDatabaseService"; // Methods missing
import { useGames } from "@/hooks/useGames"; // Use useGames hook for favorite logic if available
import { Button } from "@/components/ui/button";

const Favorites = () => {
  const [favoriteGames, setFavoriteGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { games: allGames, toggleFavoriteGame, getFavoriteGameIds } = useGames(); // Assuming useGames provides this

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to view your favorites");
      navigate("/auth/login");
      return;
    }

    if (user?.id && allGames.length > 0 && getFavoriteGameIds) {
        fetchFavoriteGames();
    } else if (isAuthenticated && !user?.id) {
        setLoading(true); 
    }

  }, [isAuthenticated, user, navigate, allGames, getFavoriteGameIds]);

  const fetchFavoriteGames = async () => {
    if (!user?.id || !getFavoriteGameIds) {
        setFavoriteGames([]);
        setLoading(false);
        return;
    }

    try {
      setLoading(true);
      const favoriteIds = await getFavoriteGameIds(user.id); // Use useGames
      const favGames = allGames.filter(game => favoriteIds.includes(game.id));
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
      const success = await toggleFavoriteGame(game.id, user.id); // Use useGames
      
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
          // Pass a prop to GameCard within CasinoGameGrid to handle unfavorite action if possible
          // For now, this assumes GameCard (if used inside) or CasinoGameGrid can show an unfavorite button
          // and potentially call a passed `onFavoriteToggle` type prop.
          // If CasinoGameGrid itself is expected to render cards with unfavorite buttons,
          // it would need an `onUnfavoriteClick` or similar prop.
          // This example assumes individual game cards will handle their own favorite status via useGames or a similar mechanism
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
