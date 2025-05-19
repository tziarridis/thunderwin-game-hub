import React, { useEffect, useState } from 'react';
import { Game } from '@/types';
import { useGames } from '@/hooks/useGames';
import GameCard from '@/components/games/GameCard'; // Main GameCard
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; // Ensure this path is correct

interface FeaturedGamesProps {
  title?: string;
  count?: number; // Number of games to show
  categorySlug?: string; // Optional: filter by category
  tag?: string; // Optional: filter by a specific tag (e.g., "featured")
}

const FeaturedGames: React.FC<FeaturedGamesProps> = ({ 
  title = "Featured Games", 
  count = 12,
  categorySlug,
  tag
}) => {
  const { games, isLoading, favoriteGameIds, toggleFavoriteGame, launchGame } = useGames();
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (games.length > 0) {
      let filtered = games;
      if (categorySlug) {
        filtered = filtered.filter(g => 
            (Array.isArray(g.category_slugs) && g.category_slugs.includes(categorySlug)) || 
            g.category === categorySlug
        );
      }
      if (tag) {
        filtered = filtered.filter(g => g.tags?.includes(tag));
      } else {
        // Default to is_featured or show_home if no specific tag/category
        filtered = filtered.filter(g => g.is_featured || g.show_home);
      }
      setFeaturedGames(filtered.slice(0, count));
    }
  }, [games, count, categorySlug, tag]);

  const handlePlayGame = (game: Game) => {
    // Navigate to game details page or use launchGame hook
    if (game.slug) {
      navigate(`/casino/game/${game.slug}`);
    } else if (game.id) {
      navigate(`/casino/game/${String(game.id)}`); // Fallback if slug isn't there
    } else if (game.game_id && game.provider_slug) { // Direct launch as last resort
        launchGame(game, { mode: 'real' }).then(url => url && window.open(url, '_blank'));
    }
  };

  if (isLoading && featuredGames.length === 0) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground mt-2">Loading Games...</p>
      </div>
    );
  }

  if (!isLoading && featuredGames.length === 0) {
    return null; // Or a "No featured games" message
  }

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
          {/* <Button variant="outline" onClick={() => navigate('/casino')}>View All <ChevronRight className="ml-2 h-4 w-4" /></Button> */}
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: featuredGames.length > 5, // Loop if enough items
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {featuredGames.map((game) => (
              <CarouselItem key={String(game.id)} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                <div className="p-1 h-full"> {/* Ensure cards in carousel item take full height */}
                   <GameCard
                    game={game}
                    isFavorite={favoriteGameIds.has(String(game.id))}
                    onToggleFavorite={() => toggleFavoriteGame(String(game.id))}
                    onPlay={() => handlePlayGame(game)}
                    className="h-full" // Make GameCard take full height of its container
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {featuredGames.length > 5 && ( // Show nav buttons if enough items
            <>
                <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
};

export default FeaturedGames;
