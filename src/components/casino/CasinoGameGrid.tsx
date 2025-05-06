
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
      // Since we don't have a favorite_games table in the Supabase schema yet,
      // implement a basic toggle functionality without database operations for now
      
      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
      
      // Note: In a real implementation, you would store favorites in the database
      // This is a placeholder until the proper database tables are created
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
          title={game.title}
          image={game.image}
          provider={game.provider}
          isPopular={game.isPopular}
          isNew={game.isNew}
          rtp={game.rtp}
          isFavorite={game.isFavorite}
          minBet={game.minBet}
          maxBet={game.maxBet}
          onClick={onGameClick ? () => onGameClick(game) : undefined}
          onFavoriteToggle={(e: React.MouseEvent) => toggleFavorite(e, game.id, game.isFavorite || false)}
        />
      ))}
    </div>
  );
};

export default CasinoGameGrid;
