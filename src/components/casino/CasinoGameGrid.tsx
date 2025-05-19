
import React from 'react';
import GameCard from '@/components/games/GameCard';
import { Game } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
// Removed supabase client import if not directly used here. toggleFavoriteContext should handle it.
import { useGames } from '@/hooks/useGames';

interface CasinoGameGridProps {
  games: Game[];
  onGameClick?: (game: Game) => void;
  showEmptyMessage?: boolean;
}

const CasinoGameGrid = ({ games, onGameClick, showEmptyMessage = true }: CasinoGameGridProps) => {
  const { isAuthenticated } = useAuth();
  const { favoriteGameIds, toggleFavoriteGame: toggleFavoriteContext, launchGame } = useGames();
  
  const handleToggleFavorite = async (gameId: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add favorites");
      return;
    }
    if (!gameId) {
        toast.error("Game ID is missing.");
        return;
    }
    await toggleFavoriteContext(gameId);
  };

  const handlePlay = (game: Game) => {
    if (onGameClick) {
        onGameClick(game); // For navigating to details page
    } else if (game.game_id && game.provider_slug) { // Fallback to direct launch if no onGameClick
        console.log("Direct play from CasinoGameGrid for:", game.title);
        launchGame(game, {mode: 'real'})
            .then(url => {
                if (url) window.open(url, '_blank');
            });
    } else {
        toast.warn("Cannot launch game: missing details or play action.");
    }
  };
  
  if (!games || games.length === 0) {
    return showEmptyMessage ? (
      <div className="text-center py-10">
        <p className="text-muted-foreground text-lg">No games available</p>
        {/* Consider adding a CTA or image here */}
      </div>
    ) : null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {games.map((game) => (
        <GameCard 
          key={game.id}
          game={game} // Pass the whole game object
          isFavorite={favoriteGameIds.has(game.id as string)}
          onToggleFavorite={() => handleToggleFavorite(game.id as string)}
          onPlay={() => handlePlay(game)} // Use the new handlePlay
        />
      ))}
    </div>
  );
};

export default CasinoGameGrid;
