
import React, { useState, useEffect } from 'react';
import { useGames } from '@/hooks/useGames';
import CasinoGameGrid from '@/components/casino/CasinoGameGrid';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const CasinoMain = () => {
  const { 
    games, 
    isLoadingGames, 
    gamesError,
    launchGame 
  } = useGames();
  const [visibleGames, setVisibleGames] = useState(12);
  const navigate = useNavigate();

  const handleGameClick = async (game: any) => {
    try {
      const gameUrl = await launchGame(game, { mode: 'demo' });
      if (gameUrl) {
        window.open(gameUrl, '_blank');
      } else {
        navigate(`/casino/game/${game.slug || game.id}`);
      }
    } catch (error: any) {
      toast.error(`Error launching game: ${error.message}`);
    }
  };

  const loadMoreGames = () => {
    setVisibleGames(prev => prev + 12);
  };

  const displayedGames = games.slice(0, visibleGames);
  const hasMoreGames = visibleGames < games.length;

  if (gamesError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading games: {String(gamesError)}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Casino Games</h1>
      
      {isLoadingGames && displayedGames.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <CasinoGameGrid 
            games={displayedGames} 
            onGameClick={handleGameClick}
          />
          
          {hasMoreGames && (
            <div className="text-center mt-8">
              <Button onClick={loadMoreGames} disabled={isLoadingGames}>
                {isLoadingGames ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Games'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CasinoMain;
