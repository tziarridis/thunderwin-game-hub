// This component might be a duplicate of GamesGrid or CasinoGameGrid.
// For now, ensuring it uses updated types and GameCard props.
// If it's still used, e.g. by Slots.tsx.
import React from 'react';
import GameCard from '@/components/games/GameCard';
import { Game } from '@/types';
import { Button } from "@/components/ui/button";
import { Loader2, FilterX } from 'lucide-react';
import { useGames } from '@/hooks/useGames'; 

interface GameGridProps {
  games: Game[];
  loading?: boolean;
  onGameClick?: (game: Game) => void; // This prop is for handling click to play/details
  emptyMessage?: string;
  loadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

const GameGrid = ({
  games,
  loading = false,
  onGameClick, // This is the primary click handler for the game (e.g. launch or navigate)
  emptyMessage = "No games found",
  loadMore,
  hasMore = false,
  loadingMore = false
}: GameGridProps) => {
  const { favoriteGameIds, toggleFavoriteGame } = useGames();

  if (loading && (!games || games.length === 0)) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-casino-thunder-green" />
      </div>
    );
  }
  
  if (!loading && games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <FilterX className="h-12 w-12 text-white/20 mb-4" />
        <p className="text-white/60">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {games.map((game) => (
          <GameCard 
            key={String(game.id)} // Ensure key is string
            game={game}
            isFavorite={favoriteGameIds.has(String(game.id))}
            onToggleFavorite={() => toggleFavoriteGame(String(game.id))}
            onPlay={onGameClick ? () => onGameClick(game) : undefined} // GameCard's onPlay prop handles this
          />
        ))}
      </div>
      
      {loadMore && hasMore && (
        <div className="flex justify-center pt-4 pb-8">
          <Button 
            variant="outline" 
            onClick={loadMore}
            disabled={loadingMore}
            className="min-w-[140px]"
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Games"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameGrid;
