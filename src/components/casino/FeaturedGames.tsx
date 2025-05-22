import React, { useEffect, useState } from 'react';
import { Game } from '@/types/game';
import { useGames } from '@/hooks/useGames';
import CasinoGameGrid from './CasinoGameGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import SectionTitle from '@/components/shared/SectionTitle';
import { Button } from '@/components/ui/button'; // For View All button
import { Link } from 'react-router-dom'; // For View All button

interface FeaturedGamesProps {
  count?: number;
  title?: string;
  showViewAllButton?: boolean; // Added
  viewAllLink?: string; // Added
}

const FeaturedGames: React.FC<FeaturedGamesProps> = ({ 
  count = 6, 
  title = "Featured Games",
  showViewAllButton = false,
  viewAllLink = "/casino/main" 
}) => {
  const { getFeaturedGames, handleGameDetails, isLoadingGames } = useGames();
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      if (getFeaturedGames) {
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

  const onGameClick = handleGameDetails || ((game: Game) => {
    console.log("Game details clicked (fallback):", game.title);
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

  if (!featuredGames.length && !isLoadingGames) { // check isLoadingGames here too
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-4">
        {title && <SectionTitle title={title} className="mb-0" />}
        {showViewAllButton && viewAllLink && (
          <Button asChild variant="outline">
            <Link to={viewAllLink}>View All</Link>
          </Button>
        )}
      </div>
      <CasinoGameGrid games={featuredGames} onGameClick={onGameClick} showEmptyMessage={false} />
    </div>
  );
};

export default FeaturedGames;
