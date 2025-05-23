
import { useState, useEffect } from 'react';
import { Game } from '@/types';
import GameCard from '@/components/games/GameCard';
import { Button } from '@/components/ui/button';
import { Loader2, FilterX } from 'lucide-react';

interface GamesGridProps {
  games: Game[];
  loading?: boolean;
  onGameClick?: (game: Game) => void;
  emptyMessage?: string;
  loadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

const GamesGrid = ({
  games,
  loading = false,
  onGameClick,
  emptyMessage = "No games found",
  loadMore,
  hasMore = false,
  loadingMore = false
}: GamesGridProps) => {
  if (loading) {
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
            onClick={() => onGameClick ? onGameClick(game) : null}
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
