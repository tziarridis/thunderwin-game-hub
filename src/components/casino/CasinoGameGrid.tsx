import React from 'react';
import GameCard from '@/components/games/GameCard'; // Assuming GameCard is the one to use
import { Game } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useGames } from '@/hooks/useGames'; // Import useGames

interface CasinoGameGridProps {
  games: Game[];
  onGameClick?: (game: Game) => void;
  showEmptyMessage?: boolean;
}

const CasinoGameGrid = ({ games, onGameClick, showEmptyMessage = true }: CasinoGameGridProps) => {
  const { user, isAuthenticated } = useAuth();
  const { favoriteGameIds, toggleFavoriteGame: toggleFavoriteContext } = useGames(); // Get favorites from context
  
  // Keep the local toggleFavorite if it has specific Supabase logic not in the hook,
  // otherwise prefer using toggleFavoriteGame from useGames directly.
  // For now, assuming the hook's toggleFavoriteGame handles Supabase updates.
  // If not, this local function can be kept.
  const handleToggleFavorite = async (gameId: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add favorites");
      return;
    }
    if (!gameId) {
        toast.error("Game ID is missing.");
        return;
    }
    // Use the context's toggleFavoriteGame
    await toggleFavoriteContext(gameId);
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
          game={game} // Pass the whole game object
          isFavorite={favoriteGameIds.has(game.id as string)} // Use favoriteGameIds from context
          onToggleFavorite={() => handleToggleFavorite(game.id as string)}
          onPlay={onGameClick ? () => onGameClick(game) : undefined}
        />
      ))}
    </div>
  );
};

export default CasinoGameGrid;
