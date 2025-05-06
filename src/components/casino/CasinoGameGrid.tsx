
import React from 'react';
import GameCard from '@/components/games/GameCard';
import { Game } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CasinoGameGridProps {
  games: Game[];
  onGameClick?: (game: Game) => void;
  showEmptyMessage?: boolean;
}

const CasinoGameGrid = ({ games, onGameClick, showEmptyMessage = true }: CasinoGameGridProps) => {
  const { user, isAuthenticated } = useAuth();
  
  const toggleFavorite = async (e: React.MouseEvent, gameId: string, isFavorite: boolean) => {
    e.stopPropagation(); // Prevent game click when clicking the favorite button
    
    if (!isAuthenticated) {
      toast.error("Please log in to add favorites");
      return;
    }
    
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorite_games')
          .delete()
          .match({ user_id: user?.id, game_id: gameId });
          
        if (error) throw error;
        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorite_games')
          .insert({ user_id: user?.id, game_id: gameId });
          
        if (error) throw error;
        toast.success("Added to favorites");
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      toast.error(error.message || "Error updating favorites");
    }
  };
  
  if (!games || games.length === 0) {
    return showEmptyMessage ? (
      <div className="text-center py-4">
        <p className="text-white/70">No games available</p>
      </div>
    ) : null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {games.map((game) => (
        <GameCard 
          key={game.id}
          id={game.id}
          title={game.title || game.name || ''}
          image={game.image || game.cover || '/placeholder.svg'}
          provider={game.provider}
          isPopular={game.isPopular || false}
          isNew={game.isNew || false}
          rtp={game.rtp}
          isFavorite={game.isFavorite || false}
          minBet={game.minBet || 1}
          maxBet={game.maxBet || 100}
          onClick={onGameClick ? () => onGameClick(game) : undefined}
          onFavoriteToggle={(e) => {
            toggleFavorite(e, game.id?.toString() || '', game.isFavorite || false);
          }}
        />
      ))}
    </div>
  );
};

export default CasinoGameGrid;
