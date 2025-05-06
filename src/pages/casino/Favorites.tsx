
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Game } from '@/types';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { scrollToTop } from '@/utils/scrollUtils';
import GameSectionLoading from '@/components/casino/GameSectionLoading';

// Update the import to use the new component name
import CasinoGameGrid from '@/components/casino/CasinoGameGrid';

const Favorites = () => {
  const { user, isAuthenticated } = useAuth();
  const [favoriteGames, setFavoriteGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      toast.error("Please log in to view your favorites");
      return;
    }
    
    loadFavoriteGames();
  }, [isAuthenticated, user, navigate]);
  
  const loadFavoriteGames = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user?.id) {
        throw new Error("User ID is not available");
      }
      
      // Use a direct join query instead of assuming a specific table structure
      // We'll need to adapt this to the actual schema that exists
      const { data, error } = await supabase.rpc('get_favorite_games', {
        user_id_param: user.id
      });
      
      if (error) {
        console.error("Database error:", error);
        // Fallback approach if the RPC function doesn't exist
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('games')
          .select('*')
          .filter('id', 'in', (await supabase
            .from('user_favorites')
            .select('game_id')
            .eq('user_id', user.id)).data?.map(row => row.game_id) || []);
            
        if (fallbackError) throw fallbackError;
        
        if (fallbackData) {
          const games = fallbackData.map(game => ({
            ...game,
            isFavorite: true,
          })) as Game[];
          setFavoriteGames(games);
        } else {
          setFavoriteGames([]);
        }
      } else if (data) {
        const games = data.map((item: any) => ({
          ...item,
          isFavorite: true,
        })) as Game[];
        setFavoriteGames(games);
      } else {
        setFavoriteGames([]);
      }
    } catch (error: any) {
      console.error("Error loading favorite games:", error);
      setError(error);
      toast.error(error.message || "Failed to load favorite games");
    } finally {
      setLoading(false);
    }
  };
  
  const retryLoading = () => {
    loadFavoriteGames();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Your Favorite Games</h1>
        <p className="text-white/70">Here are the games you've marked as your favorites.</p>
      </div>
  
      {loading ? (
        <GameSectionLoading />
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-xl mb-4">Failed to load favorite games.</p>
          <Button onClick={retryLoading}>Retry</Button>
        </div>
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

export default Favorites;
