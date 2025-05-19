
import React, { useEffect, useState, useMemo } from 'react';
import { useGames } from '@/hooks/useGames';
import { Game, GameProvider as ProviderType, GameCategory } from '@/types'; // Added GameCategory
import CasinoGameGrid from '@/components/casino/CasinoGameGrid'; 
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { Search, FilterX, Loader2 } from 'lucide-react'; 
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext'; 
import { Button } from '@/components/ui/button'; 

const ITEMS_PER_PAGE = 24;

const Slots = () => {
  const { 
    games: allGames, // All games from context
    isLoading: isLoadingGamesGlobal, // Global loading state
    error: gamesErrorGlobal, // Global error state
    filterGames, // Method to apply filters
    filteredGames, // Games after context-level filtering
    providers: gameProvidersFromContext, // Providers from context
    categories: gameCategoriesFromContext, // Categories from context
    launchGame 
  } = useGames();
  const { isAuthenticated, user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProviderSlug, setSelectedProviderSlug] = useState<string | undefined>(undefined);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  
  const slotsCategorySlug = useMemo(() => {
    const slotsCat = gameCategoriesFromContext.find(cat => cat.name.toLowerCase().includes('slots') || cat.slug.toLowerCase().includes('slots'));
    return slotsCat?.slug || 'slots'; // Default to 'slots' if not found or if categories are not loaded yet
  }, [gameCategoriesFromContext]);

  // Apply filters using the method from useGames context
  useEffect(() => {
    // Only filter if slotsCategorySlug is determined
    if (slotsCategorySlug) {
      filterGames(searchTerm, slotsCategorySlug, selectedProviderSlug);
    }
    setVisibleCount(ITEMS_PER_PAGE); // Reset visible count on filter change
  }, [searchTerm, selectedProviderSlug, slotsCategorySlug, filterGames]);

  const displayedGames = useMemo(() => {
    // `filteredGames` from `useGames` are already filtered by term, category, provider
    return filteredGames.slice(0, visibleCount);
  }, [filteredGames, visibleCount]);

  const hasMore = useMemo(() => {
    return visibleCount < filteredGames.length;
  }, [visibleCount, filteredGames.length]);

  const loadMoreGames = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const handleGameClick = async (game: Game) => {
    if (!isAuthenticated && !game.only_demo) {
      toast.error("Please log in to play.");
      // Potentially navigate to login: navigate('/login');
      return;
    }
    try {
      const gameUrl = await launchGame(game, {
        mode: game.only_demo || !isAuthenticated ? 'demo' : 'real',
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

  if (gamesErrorGlobal) return <p className="text-red-500 text-center py-10">Error loading slot games: {String(gamesErrorGlobal)}</p>;

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
            {gameProvidersFromContext.map((provider: ProviderType) => ( 
              <SelectItem key={provider.id} value={provider.slug || String(provider.id)}>{provider.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoadingGamesGlobal && displayedGames.length === 0 ? (
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
           {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-lg bg-slate-700" />)}
         </div>
      ) : (
        <>
          <CasinoGameGrid 
            games={displayedGames} 
            onGameClick={handleGameClick} 
          />
          {hasMore && (
            <div className="text-center mt-8">
              <Button onClick={loadMoreGames} variant="outline" disabled={isLoadingGamesGlobal}>
                {isLoadingGamesGlobal ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</>) : 'Load More Slots'}
              </Button>
            </div>
          )}
          {!isLoadingGamesGlobal && displayedGames.length === 0 && (searchTerm || selectedProviderSlug) && (
             <div className="text-center py-10">
                <FilterX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">No slot games found matching your filters.</p>
             </div>
          )}
           {!isLoadingGamesGlobal && displayedGames.length === 0 && !searchTerm && !selectedProviderSlug && (
             <div className="text-center py-10">
                <FilterX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">No slot games currently available for the "{slotsCategorySlug}" category.</p>
             </div>
          )}
        </>
      )}
    </div>
  );
};

export default Slots;

