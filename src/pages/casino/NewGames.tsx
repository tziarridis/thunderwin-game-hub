import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import GameCard from '@/components/games/GameCard';
import { useGames } from '@/hooks/useGames';
import { Game, GameCategory } from '@/types'; // GameCategory from useGames context
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, FilterX } from 'lucide-react';
import { Button } from '@/components/ui/button'; // For Load More
import { useNavigate } from 'react-router-dom'; // For navigation on play
import { toast } from 'sonner'; // For notifications
import { useAuth } from '@/contexts/AuthContext'; // For auth status

const ITEMS_PER_PAGE = 18;

const NewGames = () => {
  const { 
    categories, // GameCategory[] from context {id, name, slug, icon}
    games, 
    isLoading: loading, 
    error, 
    favoriteGameIds, 
    toggleFavoriteGame,
    launchGame 
  } = useGames();
  const [activeCategorySlug, setActiveCategorySlug] = React.useState<string>('all');
  const [visibleCount, setVisibleCount] = React.useState(ITEMS_PER_PAGE);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const newGames = React.useMemo(() => {
    return games
      .filter(game => game.isNew) // Ensure isNew is correctly mapped
      .sort((a, b) => new Date(b.releaseDate || b.created_at || 0).getTime() - new Date(a.releaseDate || a.created_at || 0).getTime());
  }, [games]);

  const gamesToDisplayFilteredByCategory = React.useMemo(() => {
    if (activeCategorySlug === 'all') {
      return newGames;
    }
    return newGames.filter(game => 
      (Array.isArray(game.category_slugs) && game.category_slugs.includes(activeCategorySlug)) || 
      game.category === activeCategorySlug || // Fallback for older data
      game.categoryName === activeCategorySlug // Fallback for display name
    );
  }, [newGames, activeCategorySlug]);

  const gamesToDisplayPaginated = React.useMemo(() => {
    return gamesToDisplayFilteredByCategory.slice(0, visibleCount);
  }, [gamesToDisplayFilteredByCategory, visibleCount]);

  const hasMore = React.useMemo(() => {
    return visibleCount < gamesToDisplayFilteredByCategory.length;
  }, [visibleCount, gamesToDisplayFilteredByCategory.length]);

  const loadMoreGames = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  React.useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE); // Reset pagination on category change
  }, [activeCategorySlug]);

  const handlePlayGame = async (game: Game) => {
    if (!isAuthenticated) {
      toast.error("Please log in to play.");
      navigate('/login');
      return;
    }
    try {
      const gameUrl = await launchGame(game, { mode: 'real' });
      if (gameUrl) {
        window.open(gameUrl, '_blank');
      } else {
        toast.error("Could not launch game.");
      }
    } catch (e: any) {
      toast.error("Error launching game: " + e.message);
    }
  };


  if (loading && gamesToDisplayPaginated.length === 0) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 md:px-6 lg:px-8">
        <Skeleton className="h-8 w-1/3 mb-6 bg-slate-700" />
        <Skeleton className="h-10 w-full mb-6 bg-slate-700" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-lg bg-slate-700" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Error Loading Games</h2>
        <p className="text-muted-foreground">{String(error)}</p>
      </div>
    );
  }

  // Filter categories to only show those that have new games
  const relevantCategories = categories.filter(cat => 
    newGames.some(game => 
      (Array.isArray(game.category_slugs) && game.category_slugs.includes(cat.slug)) || 
      game.category === cat.slug ||
      game.categoryName === cat.slug
    )
  );

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 md:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Newest Games</h1>
      
      {relevantCategories.length > 0 && (
        <Tabs defaultValue="all" onValueChange={setActiveCategorySlug} className="mb-6">
          <ScrollArea className="w-full whitespace-nowrap rounded-md border border-border">
            <TabsList className="p-2 bg-card">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All New</TabsTrigger>
              {relevantCategories.map((category: GameCategory) => ( // Explicitly type category from context
                <TabsTrigger key={category.id || category.slug} value={category.slug} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Tabs>
      )}

      {gamesToDisplayPaginated.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {gamesToDisplayPaginated.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isFavorite={favoriteGameIds.has(String(game.id))}
                onToggleFavorite={() => toggleFavoriteGame(String(game.id))}
                onPlay={() => handlePlayGame(game)}
              />
            ))}
          </div>
          {hasMore && (
            <div className="text-center mt-8">
              <Button onClick={loadMoreGames} variant="outline" disabled={loading}>
                {loading ? 'Loading...' : 'Load More New Games'}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10">
           <FilterX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">No new games found {activeCategorySlug !== 'all' ? `in this category` : ''}.</p>
          <p className="mt-2 text-sm text-muted-foreground">Check back later or explore other categories!</p>
        </div>
      )}
    </div>
  );
};

export default NewGames;
