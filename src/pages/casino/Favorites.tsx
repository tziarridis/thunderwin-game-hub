
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Game } from '@/types';
import CasinoGameGrid from '@/components/casino/CasinoGameGrid';
import { gamesDatabaseService } from '@/services/gamesDatabaseService'; // Assuming this service exists
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { scrollToTop } from '@/utils/scrollUtils';

interface FavoriteGameEntry {
  game_id: string;
  // any other fields from favorite_games table if needed
}

const FavoritesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [favoriteGames, setFavoriteGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavoriteGames = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data: favoriteEntries, error: favError } = await supabase
          .from('favorite_games')
          .select('game_id')
          .eq('user_id', user.id);

        if (favError) throw favError;

        if (favoriteEntries && favoriteEntries.length > 0) {
          const gameIds = favoriteEntries.map((entry: FavoriteGameEntry) => entry.game_id);
          
          // Fetch full game details for these IDs
          // Assuming gamesDatabaseService.getGamesByIds or similar exists,
          // or fetch one by one (less efficient but works)
          const gamesPromises = gameIds.map(id => gamesDatabaseService.getGameById(id));
          const gamesDetails = (await Promise.all(gamesPromises)).filter(game => game !== null) as Game[];
          
          // Mark these games as favorite for the GameCard prop
          const gamesWithFavoriteStatus = gamesDetails.map(g => ({...g, isFavorite: true}));
          setFavoriteGames(gamesWithFavoriteStatus);

        } else {
          setFavoriteGames([]);
        }
      } catch (error) {
        console.error("Error fetching favorite games:", error);
        toast.error("Failed to load favorite games.");
        setFavoriteGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteGames();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl mb-4">Please log in to see your favorite games.</p>
        <Button onClick={() => navigate('/login')}>Login</Button>
      </div>
    );
  }
  
  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading favorite games...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <h1 className="text-3xl font-bold mb-8 text-center">My Favorite Games</h1>
      {favoriteGames.length === 0 ? (
        <p className="text-center text-white/70">You haven't added any games to your favorites yet.</p>
      ) : (
        <CasinoGameGrid
          games={favoriteGames}
          onGameClick={(game) => {
            navigate(`/casino/game/${game.id}`);
            scrollToTop();
          }}
        />
      )}
    </div>
  );
};

export default FavoritesPage;

