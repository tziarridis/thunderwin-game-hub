
import React, { useEffect, useState, useMemo } from 'react';
import { useGames } from '@/hooks/useGames';
import { Game } from '@/types';
import GameGrid from '@/components/casino/GameGrid';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

const Slots = () => {
  const { 
    games, 
    isLoading, // use isLoading
    error, 
    filterGames, 
    providers,
    filteredGames // Use filteredGames from context
  } = useGames();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>(undefined);
  
  // Filter specifically for slots category if your Game type or categories allow it.
  // For this example, we assume 'slots' is a category slug.
  const slotsCategorySlug = 'slots'; 

  useEffect(() => {
    // Call filterGames from context. It will update 'filteredGames'.
    filterGames(searchTerm, slotsCategorySlug, selectedProvider);
  }, [searchTerm, selectedProvider, filterGames, slotsCategorySlug]);

  // displayedGames will be the 'filteredGames' from the context.
  // No need for a separate 'displayedGames' state if using context's filteredGames directly.
  const displayedGames = useMemo(() => {
    // If you need further client-side filtering on top of context's filteredGames:
    // return filteredGames.filter(game => game.category_slugs?.includes(slotsCategorySlug));
    // For now, assuming context's filteredGames already considers the category
    return filteredGames;
  }, [filteredGames]);


  if (error) return <p className="text-red-500 text-center py-10">Error loading slot games: {error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Slot Games</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search"
            placeholder="Search slot games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedProvider} onValueChange={(value) => setSelectedProvider(value === 'all' ? undefined : value)}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Providers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            {providers.map(provider => (
              <SelectItem key={provider.id} value={provider.slug}>{provider.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && displayedGames.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-lg" />)}
        </div>
      ) : displayedGames.length === 0 ? (
        <p className="text-center text-muted-foreground">No slot games found matching your criteria.</p>
      ) : (
        <GameGrid games={displayedGames} isLoading={isLoading} />
      )}
    </div>
  );
};

export default Slots;
