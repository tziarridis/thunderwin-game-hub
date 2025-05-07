
import { useState, useEffect } from "react";
import CasinoGameGrid from "@/components/casino/CasinoGameGrid";
import { Game } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MobileWalletSummary from "@/components/user/MobileWalletSummary";
import { useNavigate } from "react-router-dom";

const Favorites = () => {
  const [favoriteGames, setFavoriteGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      toast.error("Please log in to view your favorites");
      navigate("/auth/login");
      return;
    }

    fetchFavoriteGames();
  }, [isAuthenticated, user]);

  const fetchFavoriteGames = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      // First, get the user's favorite game IDs
      const { data: favorites, error: favError } = await supabase
        .from('favorite_games')
        .select('game_id')
        .eq('user_id', user.id);

      if (favError) throw favError;

      if (!favorites || favorites.length === 0) {
        setFavoriteGames([]);
        setLoading(false);
        return;
      }

      // Get the game details for the favorite games
      const gameIds = favorites.map(fav => fav.game_id);
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('*, providers(name)')
        .in('id', gameIds);

      if (gamesError) throw gamesError;

      const formattedGames: Game[] = games?.map(game => ({
        id: game.id,
        title: game.game_name,
        name: game.game_name,
        provider: game.providers?.name || 'Unknown',
        image: game.cover || '/placeholder.svg',
        category: game.game_type,
        rtp: game.rtp,
        volatility: game.volatility || 'medium',
        minBet: game.min_bet || 1,
        maxBet: game.max_bet || 100,
        isPopular: game.is_popular || false, 
        isNew: game.is_new || false,
        isFavorite: true,
        features: [],
        tags: []
      })) || [];

      setFavoriteGames(formattedGames);
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
    try {
      await supabase
        .from('favorite_games')
        .delete()
        .match({ user_id: user?.id, game_id: game.id });
      
      // Update the list by removing the unfavorited game
      setFavoriteGames(prev => prev.filter(g => g.id !== game.id));
      toast.success(`${game.title} removed from favorites`);
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
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-xl mb-4">You don't have any favorite games yet.</p>
          <button 
            onClick={() => navigate('/casino')}
            className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black font-medium px-6 py-3 rounded-md"
          >
            Explore Games
          </button>
        </div>
      )}
    </div>
  );
};

export default Favorites;
