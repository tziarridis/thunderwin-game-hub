
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Game } from '@/types';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { scrollToTop } from '@/utils/scrollUtils';
import { supabase } from '@/integrations/supabase/client';
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
      
      // Fetch favorite game IDs
      const { data: favoriteIds, error: favError } = await supabase
        .from('favorite_games')
        .select('game_id')
        .eq('user_id', user.id);
        
      if (favError) throw favError;
      
      if (!favoriteIds || favoriteIds.length === 0) {
        setFavoriteGames([]);
        setLoading(false);
        return;
      }
      
      const gameIds = favoriteIds.map(fav => fav.game_id);
      
      // Fetch game details
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('*, providers(name)')
        .in('id', gameIds);
        
      if (gamesError) throw gamesError;
      
      // Format games data
      const formattedGames = games?.map(game => ({
        id: game.id,
        title: game.game_name,
        provider: game.providers?.name || 'Unknown',
        image: game.cover || '/placeholder.svg',
        category: game.game_type,
        rtp: game.rtp,
        isPopular: game.is_popular,
        isNew: game.is_new,
        isFavorite: true, // Since these are favorites
        minBet: game.min_bet,
        maxBet: game.max_bet
      })) || [];
      
      setFavoriteGames(formattedGames);
      
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
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-casino-thunder-green" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-xl mb-4">Failed to load favorite games.</p>
          <Button onClick={retryLoading}>Retry</Button>
        </div>
      ) : favoriteGames.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-lg">
          <Heart className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <p className="text-xl mb-4 text-white/70">You don't have any favorite games yet.</p>
          <Button 
            onClick={() => navigate('/casino')} 
            className="bg-casino-thunder-green text-white"
          >
            Browse Games
          </Button>
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
