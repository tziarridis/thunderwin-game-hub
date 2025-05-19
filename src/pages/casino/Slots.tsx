import React, { useEffect, useState, useMemo } from 'react';
import { useGames } from '@/hooks/useGames';
import { Game, GameProvider as ProviderType } from '@/types';
import CasinoGameGrid from '@/components/casino/GameGrid'; // Using the /casino/GameGrid
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { Search, FilterX } from 'lucide-react'; // Added FilterX
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext'; 
import { Button } from '@/components/ui/button'; // For Load More

const ITEMS_PER_PAGE = 24;

const Slots = () => {
  const { 
    games, 
    isLoading, 
    error, 
    filterGames, 
    providers, // These are {id, name, slug, logoUrl, status}
    categories, 
    filteredGames, // This is the result of filterGames
    launchGame 
  } = useGames();
  const { isAuthenticated, user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProviderSlug, setSelectedProviderSlug] = useState<string | undefined>(undefined);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  
  const slotsCategorySlug = useMemo(() => {
    const slotsCat = categories.find(cat => cat.name.toLowerCase().includes('slots') || cat.slug.toLowerCase().includes('slots'));
    return slotsCat?.slug || 'slots'; 
  }, [categories]);

  useEffect(() => {
    filterGames(searchTerm, slotsCategorySlug, selectedProviderSlug);
    setVisibleCount(ITEMS_PER_PAGE); // Reset visible count on filter change
  }, [searchTerm, selectedProviderSlug, slotsCategorySlug, filterGames]);

  const displayedGames = useMemo(() => {
    return filteredGames.slice(0, visibleCount);
  }, [filteredGames, visibleCount]);

  const hasMore = useMemo(() => {
    return visibleCount < filteredGames.length;
  }, [visibleCount, filteredGames.length]);

  const loadMoreGames = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const handleGameClick = async (game: Game) => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to play.");
      return;
    }
    try {
      const gameUrl = await launchGame(game, {
        mode: 'real',
        // playerId: user.id, // playerId is usually handled by the launchGame service/backend
        // currency: user.user_metadata.currency || 'EUR', // currency from user_metadata
        // platform: 'web', // platform can be set if needed
      });
      if (gameUrl) {
        window.open(gameUrl, '_blank');
      } else {
        toast.error("Could not launch game.");
      }
    } catch (e: any) {
      toast.error("Error launching game: " + e.message);
    }
  };

  if (error) return <p className="text-red-500 text-center py-10">Error loading slot games: {error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">Slot Games</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center sticky top-16 bg-background/80 backdrop-blur-md py-4 z-30">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search"
            placeholder="Search slot games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full bg-card border-border focus:ring-primary text-white"
          />
          {searchTerm && (
            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchTerm('')}>
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Select value={selectedProviderSlug} onValueChange={(value) => setSelectedProviderSlug(value === 'all' ? undefined : value)}>
          <SelectTrigger className="w-full md:w-[200px] bg-card border-border text-white">
            <SelectValue placeholder="All Providers" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-white">
            <SelectItem value="all">All Providers</SelectItem>
            {providers.map((provider: ProviderType) => ( // Make sure ProviderType matches what's in useGames
              <SelectItem key={provider.id} value={provider.slug || String(provider.id)}>{provider.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && displayedGames.length === 0 ? (
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
           {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-lg bg-slate-700" />)}
         </div>
      ) : (
        <>
          <CasinoGameGrid 
            games={displayedGames} 
            onGameClick={handleGameClick} 
            // showEmptyMessage can be used here, GameGrid handles empty itself
          />
          {hasMore && (
            <div className="text-center mt-8">
              <Button onClick={loadMoreGames} variant="outline" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Load More Slots'}
              </Button>
            </div>
          )}
          {!isLoading && displayedGames.length === 0 && searchTerm && (
             <div className="text-center py-10">
                <FilterX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">No slot games found matching "{searchTerm}".</p>
             </div>
          )}
           {!isLoading && displayedGames.length === 0 && !searchTerm && (
             <div className="text-center py-10">
                <p className="text-xl text-muted-foreground">No slot games currently available.</p>
             </div>
          )}
        </>
      )}
    </div>
  );
};

export default Slots;
