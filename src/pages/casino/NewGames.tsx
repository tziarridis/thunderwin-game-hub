
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import GameCard from '@/components/games/GameCard';
import { useGames } from '@/hooks/useGames';
import { Game, GameCategory } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, FilterX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const ITEMS_PER_PAGE = 18;

const NewGames = () => {
  const { 
    categories,
    games, 
    isLoadingGames, 
    gamesError, 
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
      .filter(game => game.isNew)
      .sort((a, b) => new Date(b.releaseDate || b.created_at || 0).getTime() - new Date(a.releaseDate || a.created_at || 0).getTime());
  }, [games]);

  const gamesToDisplay = React.useMemo(() => {
    let filtered = newGames;
    
    if (activeCategorySlug !== 'all') {
      filtered = newGames.filter(game => 
        game.category_id === activeCategorySlug ||
        (Array.isArray(game.category_slugs) && game.category_slugs.includes(activeCategorySlug))
      );
    }
    
    return filtered.slice(0, visibleCount);
  }, [newGames, activeCategorySlug, visibleCount]);

  const hasMore = React.useMemo(() => {
    let totalFiltered = newGames;
    if (activeCategorySlug !== 'all') {
      totalFiltered = newGames.filter(game => 
        game.category_id === activeCategorySlug ||
        (Array.isArray(game.category_slugs) && game.category_slugs.includes(activeCategorySlug))
      );
    }
    return visibleCount < totalFiltered.length;
  }, [newGames, activeCategorySlug, visibleCount]);

  const loadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const handleGameClick = async (game: Game) => {
    try {
      const mode = isAuthenticated ? 'real' : 'demo';
      const gameUrl = await launchGame(game, { mode });
      if (gameUrl) {
        window.open(gameUrl, '_blank');
      } else {
        navigate(`/casino/game/${game.slug || game.id}`);
      }
    } catch (error: any) {
      toast.error(`Error launching game: ${error.message}`);
    }
  };

  if (isLoadingGames) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (gamesError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500 mb-4">Error loading new games: {String(gamesError)}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">New Games</h1>
      
      <Tabs value={activeCategorySlug} onValueChange={setActiveCategorySlug} className="w-full">
        <div className="mb-6">
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
              <TabsTrigger value="all" className="px-4">All Categories</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.slug} className="px-4">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <TabsContent value={activeCategorySlug} className="mt-6">
          {gamesToDisplay.length === 0 ? (
            <div className="text-center py-12">
              <FilterX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No new games found in this category.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {gamesToDisplay.map((game) => (
                  <GameCard 
                    key={game.id}
                    game={game}
                    onPlay={handleGameClick}
                    onToggleFavorite={toggleFavoriteGame}
                    isFavorite={favoriteGameIds.has(String(game.id))}
                  />
                ))}
              </div>
              
              {hasMore && (
                <div className="text-center mt-8">
                  <Button onClick={loadMore} variant="outline">
                    Load More Games
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewGames;
