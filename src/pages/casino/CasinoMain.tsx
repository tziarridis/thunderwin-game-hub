
import React, { useEffect, useMemo, useState } from 'react';
import { useGames } from '@/hooks/useGames'; 
import GameGrid from '@/components/games/GameGrid'; 
import GameCategories from '@/components/games/GameCategories'; 
import PopularProviders from '@/components/casino/PopularProviders';
import { Loader2, Search, FilterX } from 'lucide-react'; // Added Search, FilterX
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Game, GameProvider as ProviderType, GameCategory } from '@/types'; // Added GameCategory
import { useNavigate } from 'react-router-dom';
import FeaturedGames from '@/components/marketing/FeaturedGames'; 
import { toast } from 'sonner'; // Added toast
import { Button } from '@/components/ui/button'; // Added Button

const CasinoMain = () => {
  const { 
    games: allGames, // Renamed from 'games' to 'allGames' to avoid conflict with filteredGames
    isLoading: isLoadingGamesGlobal, // Renamed to avoid conflict
    error: gamesError, 
    categories: gameCategoriesFromContext, // Renamed
    providers: gameProvidersFromContext,   // Renamed
    launchGame,
    fetchGamesAndProviders,
    filterGames, // from useGames
    filteredGames: gamesFromFilterHook // from useGames
  } = useGames();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedProviderSlug, setSelectedProviderSlug] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial fetch is handled by useGames provider
    // if (allGames.length === 0 && !isLoadingGamesGlobal) {
    // fetchGamesAndProviders(); // Redundant if useGames fetches on mount
    // }
  }, []);
  
  useEffect(() => {
    filterGames(searchTerm, selectedCategorySlug || undefined, selectedProviderSlug || undefined);
  }, [searchTerm, selectedCategorySlug, selectedProviderSlug, filterGames]);


  const handleGamePlay = async (game: Game) => {
    try {
      // game.game_id is external ID, game.id is internal DB ID
      const gameIdentifier = game.game_id || game.id; 
      if (gameIdentifier) {
        const launchUrl = await launchGame(game, { mode: 'real' }); // Default to real mode
        if (launchUrl) {
          window.open(launchUrl, '_blank');
        } else {
          toast.error("Could not launch game. The game might be unavailable.");
        }
      } else {
        toast.error("Cannot launch game: missing game identifier.");
        // Fallback: navigate to game details page if slug exists
        if(game.slug) navigate(`/casino/game/${game.slug}`);
      }
    } catch (error: any) {
        toast.error(`Error launching game: ${error.message}`);
        if(game.slug) navigate(`/casino/game/${game.slug}`);
    }
  };
  
  const displayCategories = useMemo(() => 
    gameCategoriesFromContext.map(cat => ({ name: cat.name, slug: cat.slug, icon: cat.icon }))
  , [gameCategoriesFromContext]);

  const displayProviders = useMemo(() => 
    gameProvidersFromContext.map(prov => ({ name: prov.name, slug: prov.slug, logoUrl: prov.logoUrl }))
  , [gameProvidersFromContext]);


  if (isLoadingGamesGlobal && allGames.length === 0) {
    return (
      <div className="container mx-auto py-12 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-white/70">Loading casino games...</p>
      </div>
    );
  }

  if (gamesError) {
    return <div className="container mx-auto py-12 text-center text-destructive">Error loading games: {String(gamesError)}</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-12">
      <FeaturedGames title="Top Casino Picks" tag="featured" count={6} />
      
      <div className="sticky top-16 z-40 bg-card/80 dark:bg-background/80 backdrop-blur-md p-4 rounded-lg shadow-xl space-y-4 md:space-y-0 md:flex md:flex-row md:gap-4 md:items-end">
        <div className="flex-grow">
          <label htmlFor="search-games" className="block text-sm font-medium text-muted-foreground mb-1">Search Games</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="search-games"
              type="search"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 bg-input border-border text-white"
            />
            {searchTerm && (
              <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchTerm('')}>
                <FilterX className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex-grow md:flex-grow-0 md:w-1/4">
          <label htmlFor="category-filter" className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
          <Select value={selectedCategorySlug || ''} onValueChange={(value) => setSelectedCategorySlug(value === '' ? null : value)}>
            <SelectTrigger id="category-filter" className="w-full bg-input border-border text-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-white">
              <SelectItem value="">All Categories</SelectItem>
              {displayCategories.map(category => (
                <SelectItem key={category.slug} value={category.slug}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-grow md:flex-grow-0 md:w-1/4">
          <label htmlFor="provider-filter" className="block text-sm font-medium text-muted-foreground mb-1">Provider</label>
           <Select value={selectedProviderSlug || ''} onValueChange={(value) => setSelectedProviderSlug(value === '' ? null : value)}>
            <SelectTrigger id="provider-filter" className="w-full bg-input border-border text-white">
              <SelectValue placeholder="All Providers" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-white">
              <SelectItem value="">All Providers</SelectItem>
              {displayProviders.map(provider => (
                <SelectItem key={provider.slug} value={provider.slug}>{provider.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {displayCategories.length > 0 && !selectedCategorySlug && !selectedProviderSlug && !searchTerm && (
        <section>
          <h2 className="text-3xl font-bold mb-6 text-center text-white">Game Categories</h2>
          <GameCategories 
            categories={displayCategories}
            onSelectCategory={(slug) => setSelectedCategorySlug(slug)}
            currentCategorySlug={selectedCategorySlug}
          />
        </section>
      )}
      
      {displayProviders.length > 0 && !selectedProviderSlug && !selectedCategorySlug && !searchTerm && (
         <PopularProviders 
            providers={displayProviders} // These should be GameProvider[]
            onSelectProvider={(slug) => setSelectedProviderSlug(slug)}
        />
      )}

      <section>
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          {selectedCategorySlug || selectedProviderSlug || searchTerm ? 'Filtered Games' : 'All Games'}
        </h2>
        {isLoadingGamesGlobal && gamesFromFilterHook.length === 0 && <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>}
        {!isLoadingGamesGlobal && gamesFromFilterHook.length === 0 && (
          <div className="text-center py-10">
            <FilterX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">No games match your current filters.</p>
            {(selectedCategorySlug || selectedProviderSlug || searchTerm) && (
                 <Button variant="link" onClick={() => { setSearchTerm(''); setSelectedCategorySlug(null); setSelectedProviderSlug(null);}} className="mt-4">Clear Filters</Button>
            )}
          </div>
        )}
        {!isLoadingGamesGlobal && gamesFromFilterHook.length > 0 && (
          <GameGrid games={gamesFromFilterHook} /> // GameGrid uses onPlay from GameCard
        )}
      </section>
    </div>
  );
};

export default CasinoMain;

