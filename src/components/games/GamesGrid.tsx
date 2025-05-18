
import { Game } from '@/types';
import GameCard from '@/components/games/GameCard';
import { Button } from '@/components/ui/button';
import { Loader2, FilterX } from 'lucide-react';
import { useGames } from '@/hooks/useGames'; // Added useGames

interface GamesGridProps {
  games: Game[];
  loading?: boolean;
  onGameClick?: (game: Game) => void; // Kept for flexibility, though GameCard handles its own nav
  emptyMessage?: string;
  loadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

const GamesGrid = ({
  games,
  loading = false,
  onGameClick, // This prop might be redundant if GameCard handles navigation.
                // If it's for a different action, ensure GameCard's onClick is modified.
  emptyMessage = "No games found",
  loadMore,
  hasMore = false,
  loadingMore = false
}: GamesGridProps) => {
  const { favoriteGameIds, toggleFavoriteGame } = useGames();

  if (loading && games.length === 0) { // ensure games.length === 0 to show skeletons only on initial load
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
            key={game.id}
            game={game}
            isFavorite={favoriteGameIds.has(game.id)}
            onToggleFavorite={toggleFavoriteGame}
            onPlay={onGameClick} // If onGameClick is for playing the game
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

export default GamesGrid;
