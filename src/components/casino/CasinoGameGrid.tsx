import React from 'react';
import GameCard from '@/components/games/GameCard'; // Assuming GameCard is the one to use
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
  
  const toggleFavorite = async (e: React.MouseEvent, gameId: string | undefined, isFavorite: boolean) => {
    e.stopPropagation(); 
    
    if (!isAuthenticated) {
      toast.error("Please log in to add favorites");
      return;
    }
    if (!gameId) {
        toast.error("Game ID is missing.");
        return;
    }
    
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorite_games')
          .delete()
          .match({ user_id: user?.id, game_id: gameId });
          
        if (error) throw error;
        toast.success("Removed from favorites");
      } else {
        const { error } = await supabase
          .from('favorite_games')
          .insert({ user_id: user?.id, game_id: gameId });
          
        if (error) throw error;
        toast.success("Added to favorites");
      }
      // TODO: Update local state of favorites in useGames hook or similar
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
          title={game.title || ''} // Use game.title
          image={game.image || ''}
          provider={game.provider} // This should be provider name/slug from Game type
          isPopular={game.isPopular || false}
          isNew={game.isNew || false}
          rtp={game.rtp}
          isFavorite={game.isFavorite || false} // This needs to be updated from a central state (e.g. useGames hook)
          minBet={game.minBet} // Add if present in Game type
          maxBet={game.maxBet} // Add if present in Game type
          onClick={onGameClick ? () => onGameClick(game) : undefined}
          onFavoriteToggle={(e: React.MouseEvent) => {
            toggleFavorite(e, game.id, game.isFavorite || false);
          }}
        />
      ))}
    </div>
  );
};

export default CasinoGameGrid;
