
import React, { useEffect, useState, useContext } from 'react';
import { Game, GameTag } from '@/types/game'; // Ensure GameTag is imported
import { Button } from '@/components/ui/button';
import { ChevronRight, Heart, Play, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGamesData } from '@/hooks/useGames'; // Changed to useGamesData
import { useAuth } from '@/contexts/AuthContext';
import GameCardLoadingSkeleton from '@/components/skeletons/GameCardLoadingSkeleton';
import { cn } from '@/lib/utils';
import { AspectRatio } from '../ui/aspect-ratio';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { toast } from 'sonner';


interface FeaturedGamesProps {
  title?: string;
  count?: number;
  category?: GameTag | null; // Use GameTag
  showViewAll?: boolean;
  viewAllLink?: string;
  className?: string;
}

const FeaturedGames: React.FC<FeaturedGamesProps> = ({
  title = "Featured Games",
  count = 8,
  category = null,
  showViewAll = true,
  viewAllLink = "/casino",
  className,
}) => {
  const { 
    getFeaturedGames, 
    isLoading: isLoadingContext, 
    toggleFavoriteGame, 
    isFavorite,
    handlePlayGame, // Renamed from launchGame to match context
    handleGameDetails 
  } = useGamesData(); // Use context
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [games, setGames] = useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);

  useEffect(() => {
    const fetchAndSetGames = async () => {
      setIsLoadingGames(true);
      try {
        // TODO: Adapt getFeaturedGames to also filter by category if needed
        const fetchedGames = await getFeaturedGames(count);
        if (category) {
             setGames(fetchedGames.filter(game => game.category_slugs?.includes(category) || game.tags?.includes(category)));
        } else {
            setGames(fetchedGames);
        }
      } catch (error) {
        console.error("Failed to fetch featured games:", error);
        toast.error("Could not load featured games.");
      } finally {
        setIsLoadingGames(false);
      }
    };
    fetchAndSetGames();
  }, [getFeaturedGames, count, category]);

  const overallIsLoading = isLoadingContext || isLoadingGames;

  if (overallIsLoading && games.length === 0) {
    return (
      <section className={cn("py-8 md:py-12", className)}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: count }).map((_, index) => (
              <GameCardLoadingSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!games.length && !overallIsLoading) {
    return (
      <section className={cn("py-8 md:py-12", className)}>
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{title}</h2>
          <p className="text-center text-muted-foreground">No featured games available for {category || 'this section'}.</p>
        </div>
      </section>
    );
  }
  

  return (
    <section className={cn("py-8 md:py-12", className)}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
          {showViewAll && (
            <Button variant="ghost" onClick={() => navigate(viewAllLink)} className="text-primary hover:text-primary/80">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {games.map((game) => (
            // Using EnhancedGameCard or a similar structure
            <Card 
                key={game.id || game.slug}
                className="overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer bg-card"
                onClick={() => handleGameDetails(game)}
            >
                <CardHeader className="p-0 relative">
                    <AspectRatio ratio={4/3}>
                        <img 
                            src={game.image || game.cover || '/placeholder-game.png'} 
                            alt={game.title}
                            className="object-cover w-full h-full"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-game.png'; }}
                        />
                    </AspectRatio>
                    {isAuthenticated && (
                        <Button
                            variant="ghost" size="icon"
                            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8"
                            onClick={(e) => { e.stopPropagation(); toggleFavoriteGame(String(game.id)); }}
                        >
                            <Heart className={cn("h-4 w-4", isFavorite(String(game.id)) ? "fill-red-500 text-red-500" : "text-white")} />
                        </Button>
                    )}
                    {game.is_new && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded font-medium">NEW</div>
                    )}
                </CardHeader>
                <CardContent className="p-3">
                    <h3 className="font-medium text-sm mb-1 truncate text-foreground">{game.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{game.provider_slug || game.providerName || 'Unknown Provider'}</p>
                </CardContent>
                <CardFooter className="p-3 pt-0 grid grid-cols-2 gap-2">
                    { (isAuthenticated && !game.only_demo) &&
                        <Button size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); handlePlayGame(game, 'real'); }}>
                            <Play className="mr-1 h-4 w-4" /> Real
                        </Button>
                    }
                    { !game.only_real &&
                        <Button variant={(isAuthenticated && !game.only_demo) ? "outline" : "default"} size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); handlePlayGame(game, 'demo'); }}>
                            <Play className="mr-1 h-4 w-4" /> Demo
                        </Button>
                    }
                    { game.only_demo && !isAuthenticated && /* If only demo and not logged in, demo button should be primary */
                        <Button size="sm" className="w-full col-span-2" onClick={(e) => { e.stopPropagation(); handlePlayGame(game, 'demo'); }}>
                            <Play className="mr-1 h-4 w-4" /> Demo
                        </Button>
                    }
                     { (!isAuthenticated && game.only_real) && /* If only real and not logged in, show details/login prompt */
                        <Button variant="outline" size="sm" className="w-full col-span-2" onClick={(e) => { e.stopPropagation(); toast.info("Please log in to play this game."); navigate('/login'); }}>
                            <Info className="mr-1 h-4 w-4" /> Log In
                        </Button>
                    }
                </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedGames;

