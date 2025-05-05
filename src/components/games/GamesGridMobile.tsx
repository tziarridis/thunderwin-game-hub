
import { useState, useEffect } from 'react';
import { Game } from '@/types';
import GameCardMobile from '@/components/games/GameCardMobile';
import { Button } from '@/components/ui/button';
import { Loader2, FilterX } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface GamesGridMobileProps {
  games: Game[];
  loading?: boolean;
  onGameClick?: (game: Game) => void;
  emptyMessage?: string;
  loadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

const GamesGridMobile = ({
  games,
  loading = false,
  onGameClick,
  emptyMessage = "No games found",
  loadMore,
  hasMore = false,
  loadingMore = false
}: GamesGridMobileProps) => {
  const isMobile = useIsMobile();
  const [columns, setColumns] = useState(2);
  
  useEffect(() => {
    // Adjust columns based on screen width
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 380) setColumns(1);
      else if (width < 640) setColumns(2);
      else setColumns(3);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
      <div className={`grid grid-cols-${columns} gap-3`}>
        {games.map((game) => (
          <GameCardMobile 
            key={game.id} 
            game={game} 
            onLaunch={onGameClick}
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

export default GamesGridMobile;
