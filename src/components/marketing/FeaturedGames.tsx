
import React, { useEffect, useState } from 'react';
import { Game } from '@/types/game';
import { useGames } from '@/hooks/useGames'; // Corrected: useGames for context
import CasinoGameGrid from '@/components/casino/CasinoGameGrid'; // Assuming this is the correct path
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { toast } from 'sonner';
import SectionTitle from '@/components/shared/SectionTitle'; // Assuming this component exists

interface FeaturedGamesProps {
  count?: number;
  title?: string;
}

const FeaturedGamesMarketing: React.FC<FeaturedGamesProps> = ({ count = 4, title = "Top Games" }) => {
  // Use context methods. isLoading might be isLoadingGames from the updated context.
  const { getFeaturedGames, handlePlayGame, handleGameDetails, isLoadingGames } = useGames();
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      if (getFeaturedGames) { // Check if function exists
        try {
          const games = await getFeaturedGames(count);
          setFeaturedGames(games);
        } catch (error: any) {
          toast.error("Failed to load top games: " + error.message);
        }
      } else {
         console.warn("getFeaturedGames function is not available on GamesContext.");
      }
    };
    fetchFeatured();
  }, [getFeaturedGames, count]);

  const onGameClick = handleGameDetails || ((game: Game) => {
    console.log("Marketing featured game clicked (fallback):", game.title);
    toast.info(`Explore ${game.title}`);
  });


  if (isLoadingGames && featuredGames.length === 0) {
    return (
      <section className="py-12 bg-gradient-to-b from-casino-secondary to-casino-secondary-dark">
        <div className="container mx-auto px-4">
          {title && <h2 className="text-3xl font-bold text-center mb-8 text-white">{title}</h2>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="space-y-3 p-4 bg-white/10 rounded-lg">
                <Skeleton className="h-40 w-full rounded-md" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (!featuredGames.length) {
    return null; 
  }

  return (
    <section className="py-12 bg-gradient-to-b from-casino-secondary to-casino-secondary-dark">
      <div className="container mx-auto px-4">
        {title && <h2 className="text-3xl font-bold text-center mb-8 text-white">{title}</h2>}
        {/* CasinoGameGrid might need specific styling for marketing variant */}
        <CasinoGameGrid games={featuredGames} onGameClick={onGameClick} showEmptyMessage={false} />
      </div>
    </section>
  );
};

export default FeaturedGamesMarketing;

