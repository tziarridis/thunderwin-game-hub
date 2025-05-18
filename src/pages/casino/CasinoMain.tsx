import React, { useState, useEffect } from 'react';
import GameCategories from '@/components/games/GameCategories'; // Ensure this path is correct
import GameList from '@/components/games/GameList';
import { useGames } from '@/hooks/useGames';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { GameProvider } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';


const CasinoMain = () => {
  const { 
    games, 
    filteredGames, 
    providers, 
    categories, 
    isLoading, 
    error, 
    filterGames,
    fetchGamesAndProviders 
  } = useGames();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  useEffect(() => {
    filterGames(searchTerm, selectedCategory || undefined, selectedProvider || undefined);
  }, [searchTerm, selectedCategory, selectedProvider, filterGames]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectCategory = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
  };
  
  const handleSelectProvider = (providerSlug: string | null) => {
    setSelectedProvider(providerSlug === "" ? null : providerSlug); // Treat "" as null for "All Providers"
  };


  // Add loading states for categories and providers if they load separately or with games
  if (isLoading && games.length === 0) { // Initial full load
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-1/4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">Error loading games: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to the Casino</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Explore our vast selection of games and find your favorite.
        </p>
      </header>

      {/* Filters Section */}
      <div className="mb-8 p-4 bg-card rounded-lg shadow space-y-4 md:space-y-0 md:flex md:justify-between md:items-center">
        <div className="relative flex-grow md:mr-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search games..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10"
          />
        </div>
        <div className="flex-grow md:mr-4 mt-4 md:mt-0">
           <Select onValueChange={(value) => handleSelectProvider(value === "all" ? null : value)} value={selectedProvider || "all"}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Providers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              {providers.map((provider: GameProvider) => (
                <SelectItem key={provider.id} value={provider.slug}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Game Categories */}
      {categories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Categories</h2>
           <GameCategories 
            categories={categories} 
            onSelectCategory={handleSelectCategory} 
            selectedCategory={selectedCategory} 
          />
        </div>
      )}
      
      {/* Game List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          {selectedCategory ? categories.find(c=>c.slug === selectedCategory)?.name : 'All Games'}
          {selectedProvider && providers.find(p=>p.slug === selectedProvider) ? ` by ${providers.find(p=>p.slug === selectedProvider)?.name}` : ''}
        </h2>
        {isLoading && <p className="text-center py-4">Filtering games...</p>}
        {!isLoading && filteredGames.length === 0 && (
          <div className="text-center py-10">
            <p className="text-xl text-muted-foreground">No games found matching your criteria.</p>
            <p className="mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
        {!isLoading && filteredGames.length > 0 && <GameList games={filteredGames} />}
      </div>
    </div>
  );
};

export default CasinoMain;
