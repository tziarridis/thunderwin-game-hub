
import React, { useEffect, useState, useMemo } from 'react';
import { useGames } from '@/hooks/useGames';
import { Game } from '@/types';
import GameGrid from '@/components/casino/GameGrid'; // This is the one from /components/casino
import GameCategories from '@/components/casino/GameCategories';
import PopularProviders from '@/components/casino/PopularProviders';
import PromoBanner from '@/components/casino/PromoBanner';
import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button'; // Not used directly
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const CasinoMain = () => {
  const { 
    games, 
    isLoading, 
    error, 
    filterGames, 
    providers, 
    categories,
    filteredGames,
    launchGame, // For onGameClick
  } = useGames();
  const { isAuthenticated, user } = useAuth(); // For launching games

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  useEffect(() => {
    filterGames(searchTerm, selectedCategory);
  }, [searchTerm, selectedCategory, filterGames]);
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (categorySlug: string | undefined) => {
    setSelectedCategory(categorySlug);
    setSearchTerm(''); // Reset search term when category changes
  };

  const handleGameClick = async (game: Game) => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to play.");
      // Optionally navigate to login page: navigate('/login');
      return;
    }
    const gameUrl = await launchGame(game, {
      mode: 'real', // or 'demo'
      playerId: user.id,
      currency: user.currency || 'EUR',
      platform: 'web',
    });
    if (gameUrl) {
      window.open(gameUrl, '_blank');
    }
  };

  const popularGames = useMemo(() => games.filter(game => game.isPopular).slice(0, 12), [games]);
  const newGames = useMemo(() => games.filter(game => game.isNew).slice(0, 12), [games]);

  if (error) {
    return <p className="text-red-500 text-center py-10">Error loading games: {error}</p>;
  }

  return (
    <div className="space-y-8 lg:space-y-12 px-2 sm:px-4 md:px-6 lg:px-8 py-6">
      <PromoBanner />

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search games..."
            className="pl-10 w-full bg-card border-border focus:ring-primary"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      <GameCategories categories={categories} onSelectCategory={handleCategoryChange} selectedCategory={selectedCategory} />

      {isLoading && !filteredGames.length && !searchTerm && !selectedCategory ? (
        <div>
          <Skeleton className="h-8 w-1/4 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-md" />)}
          </div>
        </div>
      ) : (
        <>
          {selectedCategory || searchTerm ? (
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">
                {searchTerm && selectedCategory ? `Results for "${searchTerm}" in ${categories.find(c=>c.slug === selectedCategory)?.name || selectedCategory}` : 
                 searchTerm ? `Search Results for "${searchTerm}"` : 
                 categories.find(c=>c.slug === selectedCategory)?.name || "Filtered Games" }
              </h2>
              <GameGrid 
                games={filteredGames} 
                loading={isLoading} 
                onGameClick={handleGameClick} 
                emptyMessage="No games found for your criteria."
              />
            </section>
          ) : (
            <>
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">Popular Games</h2>
                <GameGrid games={popularGames} loading={isLoading} onGameClick={handleGameClick} />
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">New Releases</h2>
                <GameGrid games={newGames} loading={isLoading} onGameClick={handleGameClick} />
              </section>
            </>
          )}
        </>
      )}
      
      <PopularProviders providers={providers.slice(0, 5)} /> 
      
      {!selectedCategory && !searchTerm && !isLoading && (
         <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">All Games</h2>
            {/* Use a limited set or implement pagination/load more for all games */}
            <GameGrid games={games.slice(0, 18)} loading={isLoading} onGameClick={handleGameClick}/> 
         </section>
      )}
    </div>
  );
};

export default CasinoMain;
