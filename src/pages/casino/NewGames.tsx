
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import GameCard from '@/components/games/GameCard';
import { useGames } from '@/hooks/useGames';
import { Game } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

const NewGames = () => {
  const { categories, games, isLoading: loading, error } = useGames();
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
    return newGames.filter(game => game.category_slugs?.includes(activeCategory) || game.category === activeCategory);
  }, [newGames, activeCategory]);

  // Removed useEffect calling filterGames as local filtering is used.

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
        <p className="text-xl text-red-400">Error loading new games.</p>
        <p className="text-muted-foreground">{error.toString()}</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 md:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 text-white">
        New Games
      </h1>

      <Tabs 
        defaultValue="all" 
        className="w-full"
        onValueChange={setActiveCategory}
        value={activeCategory}
      >
        <ScrollArea className="w-full whitespace-nowrap rounded-md border border-border/20 mb-6">
          <TabsList className="bg-transparent p-1">
            <TabsTrigger 
              value="all"
              className="text-xs sm:text-sm px-3 py-1.5 data-[state=active]:bg-casino-neon-green data-[state=active]:text-casino-black"
            >
              All New
            </TabsTrigger>
            {categories.filter(c => c.isActive).map((category) => (
              <TabsTrigger 
                key={category.slug} 
                value={category.slug}
                className="text-xs sm:text-sm px-3 py-1.5 data-[state=active]:bg-casino-neon-green data-[state=active]:text-casino-black"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        
        <TabsContent value={activeCategory} className="mt-0 pt-0">
          {gamesToDisplay.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {gamesToDisplay.map((game: Game) => (
                <GameCard 
                  key={game.id}
                  game={game} // Pass the whole game object
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-lg">No new games found {activeCategory !== 'all' ? `in ${categories.find(c=>c.slug === activeCategory)?.name || ''}` : ''}.</p>
              <p>Check back soon for the latest releases!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewGames;
