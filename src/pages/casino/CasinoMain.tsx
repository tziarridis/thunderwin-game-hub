import React, { useEffect, useState, useMemo } from 'react';
import { useGames } from '@/hooks/useGames';
import { Game } from '@/types';
import GameGrid from '@/components/casino/GameGrid'; // Ensure this is the correct GameGrid
import GameCategories from '@/components/casino/GameCategories';
import PopularProviders from '@/components/casino/PopularProviders';
import PromoBanner from '@/components/casino/PromoBanner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
// ... other imports

const CasinoMain = () => {
  const { 
    games, 
    isLoading, // Use isLoading
    error, 
    filterGames, 
    providers, 
    categories,
    filteredGames, // Use filteredGames from context
  } = useGames();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  // ... other state variables

  useEffect(() => {
    filterGames(searchTerm, selectedCategory);
  }, [searchTerm, selectedCategory, filterGames]);

  // ... keep existing code for handleSearchChange, handleCategoryChange, etc.
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (categorySlug: string | undefined) => {
    setSelectedCategory(categorySlug);
  };


  const popularGames = useMemo(() => games.filter(game => game.isPopular).slice(0, 10), [games]);
  const newGames = useMemo(() => games.filter(game => game.isNew).slice(0, 10), [games]);

  if (error) {
    // Error: Property 'message' does not exist on type 'string'.
    // 'error' from useGames is already string | null.
    // So, if it's a string, it *is* the message.
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
            className="pl-10 w-full"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        {/* Add filter button for mobile if needed */}
      </div>
      
      <GameCategories categories={categories} onSelectCategory={handleCategoryChange} selectedCategory={selectedCategory} />

      {isLoading && !filteredGames.length ? (
        <div>
          <Skeleton className="h-8 w-1/4 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
          </div>
        </div>
      ) : (
        <>
          {selectedCategory || searchTerm ? (
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                {searchTerm && selectedCategory ? `Results for "${searchTerm}" in ${categories.find(c=>c.slug === selectedCategory)?.name || selectedCategory}` : 
                 searchTerm ? `Search Results for "${searchTerm}"` : 
                 `Games in ${categories.find(c=>c.slug === selectedCategory)?.name || selectedCategory}` }
              </h2>
              <GameGrid games={filteredGames} isLoading={isLoading} />
              {filteredGames.length === 0 && !isLoading && <p>No games found for your criteria.</p>}
            </section>
          ) : (
            <>
              <section>
                <h2 className="text-2xl font-semibold mb-4">Popular Games</h2>
                <GameGrid games={popularGames} isLoading={isLoading} />
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-4">New Releases</h2>
                <GameGrid games={newGames} isLoading={isLoading} />
              </section>
            </>
          )}
        </>
      )}
      
      <PopularProviders providers={providers.slice(0, 5)} /> 
      
      {/* Optionally, a section for all games if no filters are applied initially */}
      {!selectedCategory && !searchTerm && !isLoading && (
         <section>
            <h2 className="text-2xl font-semibold mb-4">All Games</h2>
            <GameGrid games={games.slice(0, 24)} isLoading={isLoading} /> 
            {/* Consider pagination or "View All" button */}
         </section>
      )}
    </div>
  );
};

export default CasinoMain;
