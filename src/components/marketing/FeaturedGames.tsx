import React, { useState, useEffect } from 'react';
import { Game } from '@/types/game';
import { useGames } from '@/hooks/useGames';
import GameCard from '@/components/games/GameCard';
import { Button } from '@/components/ui/button';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { toast } from 'sonner';

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
  const { 
    games: allGames, 
    isLoadingGames, 
    favoriteGameIds, 
    toggleFavoriteGame, 
    launchGame,
    getFeaturedGames 
  } = useGames();
  
  const [filteredGamesToShow, setFilteredGamesToShow] = useState<Game[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Use a safer approach to filter games
  useEffect(() => {
    console.log('FeaturedGames component - filtering games:', { 
      totalGames: allGames.length, 
      categorySlug, 
      tag 
    });
    
    setIsLoading(true);
    setError(null);
    
    try {
      // If we have a getFeaturedGames function, use it for featured games
      if (tag === 'featured' && getFeaturedGames) {
        getFeaturedGames(count).then(games => {
          console.log('Featured games loaded:', games.length);
          setFilteredGamesToShow(games);
          setIsLoading(false);
        }).catch(err => {
          console.error('Error loading featured games:', err);
          setError('Failed to load featured games');
          setIsLoading(false);
        });
        return;
      }
      
      // Otherwise filter games manually
      if (allGames.length === 0) {
        setFilteredGamesToShow([]);
        setIsLoading(false);
        return;
      }
      
      let tempFiltered = [...allGames];
      
      if (categorySlug) {
        tempFiltered = tempFiltered.filter(g => 
          (Array.isArray(g.category_slugs) && g.category_slugs.includes(categorySlug)) || 
          g.category_name === categorySlug
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
            tempFiltered = tempFiltered.filter(g => g.isNew || g.is_new);
            break;
          default:
            tempFiltered = tempFiltered.filter(g => {
              return Array.isArray(g.tags) && g.tags.some(t => {
                if (typeof t === 'string') {
                  return t === tag;
                } else if (typeof t === 'object' && t && 'slug' in t) {
                  return (t as any).slug === tag;
                }
                return false;
              });
            });
            break;
        }
      } else if (!categorySlug) { 
        tempFiltered = tempFiltered.filter(g => g.is_featured || g.isPopular);
      }
      
      if (tag === 'new') {
        tempFiltered.sort((a, b) => {
          const dateA = a.releaseDate || a.created_at || '0';
          const dateB = b.releaseDate || b.created_at || '0';
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
      }
      
      console.log('Filtered games:', tempFiltered.length);
      setFilteredGamesToShow(tempFiltered.slice(0, count));
    } catch (err: any) {
      console.error('Error in FeaturedGames filtering:', err);
      setError(err.message || 'Error filtering games');
    } finally {
      setIsLoading(false);
    }
  }, [allGames, count, categorySlug, tag, getFeaturedGames]);

  const handlePlayGame = async (game: Game) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      const gameUrl = await launchGame(game, { mode: 'real' });
      if (gameUrl) {
        window.open(gameUrl, '_blank');
      } else {
        navigate(`/casino/game/${game.slug || game.id}`);
      }
    } catch (e: any) {
      console.error('Error launching game:', e);
      toast.error(`Error launching game: ${e.message}`);
      navigate(`/casino/game/${game.slug || game.id}`); 
    } finally {
      setIsProcessing(false);
    }
  };

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      console.log('FeaturedGames component unmounted');
    };
  }, []);

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  if ((isLoading || isLoadingGames) && filteredGamesToShow.length === 0) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">{title}</h2>
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground mt-2">Loading Games...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!isLoading && !isLoadingGames && filteredGamesToShow.length === 0) {
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
        
        {filteredGamesToShow.length > 0 ? (
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
        ) : (
          <p className="text-center text-muted-foreground">No games available.</p>
        )}
      </div>
    </section>
  );
};

export default FeaturedGames;
