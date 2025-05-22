
import React, { useEffect, useState } from 'react';
import { Game } from '@/types/game';
import { useGamesData } from '@/hooks/useGamesData';
import GameCard from '@/components/games/GameCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { toast } from 'sonner';
import { useGames } from '@/hooks/useGames';

interface FeaturedGamesProps {
  title?: string;
  count?: number; 
  categorySlug?: string; 
  tag?: string; 
}

const FeaturedGames: React.FC<FeaturedGamesProps> = ({ 
  title = "Featured Games", 
  count = 12,
  categorySlug,
  tag 
}) => {
  const { games: allGames, isLoading, favoriteGameIds, toggleFavoriteGame, launchGame } = useGames();
  const [filteredGamesToShow, setFilteredGamesToShow] = useState<Game[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (allGames.length > 0) {
      let tempFiltered = [...allGames]; 

      if (categorySlug) {
        tempFiltered = tempFiltered.filter(g => 
            (Array.isArray(g.category_slugs) && g.category_slugs.includes(categorySlug)) || 
            g.categoryName === categorySlug // Fallback
        );
      }
      
      if (tag) {
        switch (tag.toLowerCase()) {
          case 'featured':
            tempFiltered = tempFiltered.filter(g => g.is_featured);
            break;
          case 'popular':
            tempFiltered = tempFiltered.filter(g => g.isPopular);
            break;
          case 'new':
            tempFiltered = tempFiltered.filter(g => g.isNew);
            break;
          default:
            // Make sure g.tags is an array and contains the tag
            tempFiltered = tempFiltered.filter(g => {
              // Safely check if tags is an array and contains the tag string
              return Array.isArray(g.tags) && g.tags.some(t => 
                // Handle both string tags and GameTag objects
                (typeof t === 'string' && t === tag) || 
                (typeof t === 'object' && t && 'slug' in t && t.slug === tag)
              );
            });
            break;
        }
      } else if (!categorySlug) { 
        tempFiltered = tempFiltered.filter(g => g.is_featured || g.isPopular);
      }
      
      if (tag === 'new') {
        tempFiltered.sort((a,b) => new Date(b.releaseDate || b.created_at || 0).getTime() - new Date(a.releaseDate || a.created_at || 0).getTime());
      }

      setFilteredGamesToShow(tempFiltered.slice(0, count));
    }
  }, [allGames, count, categorySlug, tag]);

  const handlePlayGame = async (game: Game) => {
    try {
      const gameUrl = await launchGame(game, { mode: 'real' });
      if (gameUrl) {
        window.open(gameUrl, '_blank');
      } else {
        navigate(`/casino/game/${game.slug || game.id}`);
      }
    } catch (e:any) {
      toast.error(`Error launching game: ${(e as Error).message}`);
      navigate(`/casino/game/${game.slug || game.id}`); 
    }
  };

  if (isLoading && filteredGamesToShow.length === 0) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground mt-2">Loading Games...</p>
      </div>
    );
  }

  if (!isLoading && filteredGamesToShow.length === 0) {
    return null; 
  }

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
          {(categorySlug || tag) && (
             <Button variant="outline" onClick={() => navigate(`/casino/${categorySlug || tag || 'main'}`)}>
                View All <ChevronRight className="ml-2 h-4 w-4" />
             </Button>
          )}
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: filteredGamesToShow.length > 5, 
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4"> 
            {filteredGamesToShow.map((game) => (
              <CarouselItem key={String(game.id)} className="pl-2 md:pl-4 basis-[48%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                <div className="p-1 h-full"> 
                   <GameCard
                    game={game}
                    isFavorite={favoriteGameIds.has(String(game.id))}
                    onToggleFavorite={() => toggleFavoriteGame(String(game.id))}
                    onPlay={() => handlePlayGame(game)}
                    className="h-full" 
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {filteredGamesToShow.length > 5 && ( 
            <>
                <CarouselPrevious className="absolute left-[-10px] sm:left-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex bg-background/70 hover:bg-background border border-border" />
                <CarouselNext className="absolute right-[-10px] sm:right-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex bg-background/70 hover:bg-background border border-border" />
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
};

export default FeaturedGames;
