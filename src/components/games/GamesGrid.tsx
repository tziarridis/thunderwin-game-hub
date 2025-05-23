
import React from 'react';
import { Game } from '@/types';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export interface GameGridProps {
  games: (Game & { isFavorite?: boolean })[];
  onGameClick: (game: Game, mode?: 'real' | 'demo') => void;
  onToggleFavorite?: (gameId: string | number, isFavorite: boolean) => void;
  loading?: boolean;
  loadMoreGames?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  emptyMessage?: string;
}

const GamesGrid: React.FC<GameGridProps> = ({
  games,
  onGameClick,
  onToggleFavorite,
  loading = false,
  loadMoreGames,
  hasMore = false,
  loadingMore = false,
  emptyMessage = "No games found."
}) => {
  if (loading && games.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onGameClick(game)}
          >
            <div className="aspect-[3/4] bg-muted">
              <img
                src={game.image_url || '/placeholder.svg'}
                alt={game.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-2">
              <h3 className="font-medium text-sm truncate">{game.title}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {game.provider_id || 'Unknown Provider'}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {hasMore && loadMoreGames && (
        <div className="text-center mt-8">
          <Button
            onClick={loadMoreGames}
            disabled={loadingMore}
            variant="outline"
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading More...
              </>
            ) : (
              'Load More Games'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default GamesGrid;
