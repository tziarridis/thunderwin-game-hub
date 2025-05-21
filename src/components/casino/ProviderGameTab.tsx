
import React, { useEffect, useState } from 'react';
import { Game, GameProvider } from '@/types/game';
import { useGames } from '@/hooks/useGames';
import GameGrid from './GameGrid'; // Assuming this is the correct path
import GameCardLoadingSkeleton from '@/components/skeletons/GameCardLoadingSkeleton';

interface ProviderGameTabProps {
  provider: GameProvider;
}

const ProviderGameTab: React.FC<ProviderGameTabProps> = ({ provider }) => {
  const { fetchGamesByProvider, handlePlayGame, handleGameDetails } = useGames();
  const [providerGames, setProviderGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleGames, setVisibleGames] = useState(12);


  useEffect(() => {
    if (provider && provider.slug) {
      setIsLoading(true);
      setError(null);
      fetchGamesByProvider(provider.slug)
        .then(games => {
          setProviderGames(games);
        })
        .catch(err => {
          setError(err.message || `Failed to fetch games for ${provider.name}`);
          console.error(`Error fetching games for provider ${provider.slug}:`, err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [provider, fetchGamesByProvider]);

  const loadMoreGames = () => {
    setVisibleGames(prev => prev + 12);
  };

  if (error) {
    return <div className="text-red-500 py-4 text-center">Error: {error}</div>;
  }

  const displayedGames = providerGames.slice(0, visibleGames);

  return (
    <div className="py-6">
      {isLoading && !displayedGames.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <GameCardLoadingSkeleton key={index} />
          ))}
        </div>
      ) : displayedGames.length === 0 && !isLoading ? (
         <p className="text-center text-muted-foreground py-8">No games found for {provider.name}.</p>
      ) : (
        <>
          <GameGrid
            games={displayedGames}
            onPlayGame={handlePlayGame}
            onGameDetails={handleGameDetails}
            isLoading={isLoading && displayedGames.length > 0}
            loadingSkeletonCount={isLoading && displayedGames.length > 0 ? Math.min(6, visibleGames - displayedGames.length) : 0}
          />
          {providerGames.length > visibleGames && (
            <div className="text-center mt-8">
              <button
                onClick={loadMoreGames}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-lg font-semibold transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProviderGameTab;
