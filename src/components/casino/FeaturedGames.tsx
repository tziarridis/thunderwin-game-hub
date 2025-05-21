import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Game } from '@/types';
import { gameService } from '@/services/gameService'; // Assuming gameService fetches games
import EnhancedGameCard from './EnhancedGameCard'; // Use EnhancedGameCard
import GameSectionLoading from './GameSectionLoading'; // Loading skeleton
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGames } from '@/hooks/useGames'; // For play/details handlers
import { useRouter } from '@/hooks/useRouter'; // If navigation is needed for details page
import { toast } from 'sonner';


interface FeaturedGamesProps {
  title?: string;
  count?: number; // Number of games to display
  className?: string;
  autoplay?: boolean;
  delay?: number;
}

const FeaturedGames: React.FC<FeaturedGamesProps> = ({
  title = "Featured Games",
  count = 8,
  className,
  autoplay = true,
  delay = 5000,
}) => {
  const { data: games, isLoading, error } = useQuery<Game[], Error>({
    queryKey: ['featuredGames', count],
    queryFn: () => gameService.getFeaturedGames({ limit: count }), // Assuming service method
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const { navigate } = useRouter();
  const { handlePlayGame, handleGameDetails } = useGames(); // Get handlers

  useEffect(() => {
    if (!autoplay || !games || games.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % games.length);
    }, delay);

    return () => clearInterval(intervalId);
  }, [autoplay, delay, games]);

  const handlePrev = () => {
    if (!games) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + games.length) % games.length);
  };

  const handleNext = () => {
    if (!games) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % games.length);
  };

  const onPlayClick = (game: Game, mode: 'real' | 'demo') => {
    // console.log(`Playing ${game.title} in ${mode} mode.`);
    // Example: Open game launcher or navigate to game page
    // This might involve calling a global context function or service
    handlePlayGame(game, mode);
    // toast.success(`Launching ${game.title} (${mode})`);
  };

  const onDetailsClick = (game: Game) => {
    // console.log(`Viewing details for ${game.title}.`);
    // Example: Navigate to a game details page
    handleGameDetails(game);
    // navigate(`/games/${game.slug || game.id}`);
  };


  if (isLoading) {
    return (
      <div className={className}>
        {title && <h2 className="text-2xl font-semibold mb-4 px-4 sm:px-0">{title}</h2>}
        <GameSectionLoading /> {/* Removed cardCount prop */}
      </div>
    );
  }

  if (error) {
    return (
        <div className={className}>
            {title && <h2 className="text-2xl font-semibold mb-4 px-4 sm:px-0">{title}</h2>}
            <p className="text-red-500 px-4 sm:px-0">Error loading featured games: {error.message}</p>
        </div>
    );
  }

  if (!games || games.length === 0) {
    return (
        <div className={className}>
            {title && <h2 className="text-2xl font-semibold mb-4 px-4 sm:px-0">{title}</h2>}
            <p className="px-4 sm:px-0">No featured games available at the moment.</p>
        </div>
    );
  }
  
  // For a carousel-like display, you might show a subset of games at a time
  // This example shows one game at a time, or a small grid if you adjust styling.
  const currentGame = games[currentIndex];

  return (
    <div className={className}>
      {title && <h2 className="text-2xl font-semibold mb-4 px-4 sm:px-0">{title}</h2>}
      <div className="relative">
        {/* This assumes you might want a carousel. For a simple grid, map 'games' directly. */}
        {/* Current game display (simple version) */}
        {/* 
        <EnhancedGameCard 
            game={currentGame} 
            onPlayClick={onPlayClick}
            onDetailsClick={onDetailsClick}
        />
        */}
        
        {/* Grid display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {games.map(game => (
                <EnhancedGameCard
                    key={game.id}
                    game={game}
                    onPlayClick={onPlayClick}
                    onDetailsClick={onDetailsClick}
                />
            ))}
        </div>

        {/* Navigation for carousel (if implementing) */}
        {/* 
        {games.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
              onClick={handleNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
         */}
      </div>
    </div>
  );
};

export default FeaturedGames;
