
import React, { useEffect, useState } from 'react';
import { Game } from '@/types/game';
import { useGames } from '@/hooks/useGames'; // Corrected: useGames for context
import CasinoGameGrid from './CasinoGameGrid'; // Assuming this is the correct path
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { toast } from 'sonner';
import SectionTitle from '@/components/shared/SectionTitle'; // Assuming this component exists

interface FeaturedGamesProps {
  count?: number;
  title?: string;
}

const FeaturedGames: React.FC<FeaturedGamesProps> = ({ count = 6, title = "Featured Games" }) => {
  const { getFeaturedGames, handlePlayGame, handleGameDetails, isLoadingGames } = useGames();
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      if (getFeaturedGames) { // Check if function exists on context
        try {
          const games = await getFeaturedGames(count);
          setFeaturedGames(games);
        } catch (error: any) {
          toast.error("Failed to load featured games: " + error.message);
        }
      } else {
        console.warn("getFeaturedGames function is not available on GamesContext.");
      }
    };
    fetchFeatured();
  }, [getFeaturedGames, count]);

  // Fallback handlers if context doesn't provide them
  const onGameClick = handleGameDetails || ((game: Game) => {
    console.log("Game details clicked (fallback):", game.title);
    // Potentially navigate to a game detail page: navigate(`/casino/game/${game.slug || game.id}`);
    toast.info(`More details for ${game.title}`);
  });


  if (isLoadingGames && featuredGames.length === 0) {
    return (
      <div className="py-8">
        {title && <SectionTitle title={title} />}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-[150px] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!featuredGames.length) {
    return null; // Don't render section if no games and not loading
  }

  return (
    <div className="py-8">
      {title && <SectionTitle title={title} />}
      <CasinoGameGrid games={featuredGames} onGameClick={onGameClick} showEmptyMessage={false} />
    </div>
  );
};

export default FeaturedGames;

