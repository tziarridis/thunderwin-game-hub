
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import GameCard from '@/components/games/GameCard';
import { useGames } from '@/hooks/useGames';
import { Game } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, FilterX } from 'lucide-react'; // Added FilterX

const NewGames = () => {
  const { categories, games, isLoading: loading, error, favoriteGameIds, toggleFavoriteGame } = useGames();
  const [activeCategory, setActiveCategory] = React.useState<string>('all');

  const newGames = React.useMemo(() => {
    return games
      .filter(game => game.isNew)
      .sort((a, b) => new Date(b.releaseDate || b.release_date || 0).getTime() - new Date(a.releaseDate || a.release_date || 0).getTime());
  }, [games]);

  const gamesToDisplay = React.useMemo(() => {
    if (activeCategory === 'all') {
      return newGames;
    }
    return newGames.filter(game => 
      (Array.isArray(game.category_slugs) && game.category_slugs.includes(activeCategory)) || 
      game.category === activeCategory
    );
  }, [newGames, activeCategory]);


  if (loading && !gamesToDisplay.length) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 md:px-6 lg:px-8">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <Skeleton className="h-10 w-full mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Error Loading Games</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 md:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Newest Games</h1>
      
      <Tabs defaultValue="all" onValueChange={setActiveCategory} className="mb-6">
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <TabsList className="p-2">
            <TabsTrigger value="all">All New</TabsTrigger>
            {categories
              .filter(cat => newGames.some(game => (Array.isArray(game.category_slugs) && game.category_slugs.includes(cat.slug)) || game.category === cat.slug))
              .map(category => (
              <TabsTrigger key={category.id} value={category.slug}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Tabs>

      {gamesToDisplay.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {gamesToDisplay.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isFavorite={favoriteGameIds.has(game.id)}
              onToggleFavorite={toggleFavoriteGame}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
           <FilterX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">No new games found {activeCategory !== 'all' ? `in this category` : ''}.</p>
          <p className="mt-2">Check back later or explore other categories!</p>
        </div>
      )}
    </div>
  );
};

export default NewGames;
