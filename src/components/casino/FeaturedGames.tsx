
import React, { useEffect, useState } from 'react';
import { useGamesData } from '@/hooks/useGames'; // Changed to useGamesData
import EnhancedGameCard from './EnhancedGameCard';
import { Game } from '@/types/game'; // Ensure this is the correct type path
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import GameCardLoadingSkeleton from '@/components/skeletons/GameCardLoadingSkeleton';

interface FeaturedGamesProps {
  count?: number;
  title?: string;
  showViewAllButton?: boolean;
  viewAllLink?: string;
}

const FeaturedGames: React.FC<FeaturedGamesProps> = ({
  count = 8,
  title = "Featured Games",
  showViewAllButton = true,
  viewAllLink = "/casino/main?filter=featured"
}) => {
  const { getFeaturedGames, handlePlayGame, handleGameDetails, isLoading: isLoadingContext } = useGamesData(); // Use context
  const navigate = useNavigate();
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [isLoadingGamesHook, setIsLoadingGamesHook] = useState(true); // Renamed to avoid conflict
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoadingGamesHook(true);
      setError(null);
      try {
        const games = await getFeaturedGames(count); // Call context function
        setFeaturedGames(games);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch featured games');
        console.error("Error fetching featured games:", err);
      } finally {
        setIsLoadingGamesHook(false);
      }
    };

    fetchGames();
  }, [count, getFeaturedGames]);

  const isLoadingState = isLoadingGamesHook || isLoadingContext;


  if (error) {
    return <div className="text-red-500 py-4">Error loading featured games: {error}</div>;
  }

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
          {showViewAllButton && (
            <Button variant="ghost" onClick={() => navigate(viewAllLink)} className="text-primary hover:text-primary/80">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
        {isLoadingState && !featuredGames.length ? (
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: count }).map((_, index) => (
              <GameCardLoadingSkeleton key={index} />
            ))}
          </div>
        ) : !featuredGames.length && !isLoadingState ? (
          <p className="text-center text-muted-foreground py-8">No featured games available at the moment.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {featuredGames.map((game) => (
              <EnhancedGameCard
                key={game.id || game.slug}
                game={game}
                onPlay={(selectedGame, mode) => handlePlayGame(selectedGame, mode)} // Use context function
                onDetails={(selectedGame) => handleGameDetails(selectedGame)} // Use context function
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedGames;
