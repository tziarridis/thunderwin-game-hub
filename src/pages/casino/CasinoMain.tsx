
import React, { useEffect, useMemo, useState } from 'react';
import { useGames } from '@/hooks/useGames'; // This hook provides games, categories, providers etc.
import GameGrid from '@/components/games/GameGrid'; // General purpose grid
import GameCategories from '@/components/games/GameCategories'; 
import PopularProviders from '@/components/casino/PopularProviders';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Game, GameProvider as ProviderType } from '@/types'; // ProviderType from game.ts now
import { useNavigate } from 'react-router-dom';
import FeaturedGames from '@/components/marketing/FeaturedGames'; // Can use this for a featured section

const CasinoMain = () => {
  // useGames hook from context provides games, loading, error, categories, providers
  const { 
    games, // All games
    isLoading: isLoadingGames, 
    error: gamesError, 
    categories: gameCategories, // These are {id, name, slug, icon}
    providers: gameProviders, // These are {id, name, slug, logoUrl, status}
    launchGame, // For handling play action
    fetchGamesAndProviders, // To refresh data if needed
  } = useGames();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedProviderSlug, setSelectedProviderSlug] = useState<string | null>(null);
  const navigate = useNavigate();

  // Refetch if needed, though useGames fetches initially
  useEffect(() => {
    // if (games.length === 0 && !isLoadingGames) {
    // fetchGamesAndProviders();
    // }
  }, []);


  const handleGamePlay = async (game: Game) => {
    // Example: Using launchGame from useGames hook
    if (game.game_id && game.provider_slug) {
      const launchUrl = await launchGame(game, { mode: 'real' });
      if (launchUrl) {
        window.open(launchUrl, '_blank');
      } else {
        toast.error("Could not launch game.");
      }
    } else {
      // Fallback: navigate to game details page
      navigate(`/casino/game/${game.slug || game.id}`);
    }
  };
  
  // Enhanced filtering logic
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const titleMatch = !searchTerm || game.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const categoryMatch = !selectedCategorySlug || 
        (Array.isArray(game.category_slugs) && game.category_slugs.includes(selectedCategorySlug)) ||
        game.category === selectedCategorySlug || // Fallback for older data structure
        game.categoryName === selectedCategorySlug; // Fallback for display name if used as slug

      const providerMatch = !selectedProviderSlug || 
        game.provider_slug === selectedProviderSlug ||
        game.provider === selectedProviderSlug; // Fallback

      return titleMatch && categoryMatch && providerMatch;
    });
  }, [games, searchTerm, selectedCategorySlug, selectedProviderSlug]);

  // Format categories for GameCategories component
  const displayCategories = useMemo(() => 
    gameCategories.map(cat => ({ name: cat.name, slug: cat.slug, icon: cat.icon }))
  , [gameCategories]);

  // Format providers for PopularProviders component
  const displayProviders = useMemo(() => 
    gameProviders.map(prov => ({ name: prov.name, slug: prov.slug, logoUrl: prov.logoUrl }))
  , [gameProviders]);


  if (isLoadingGames && games.length === 0) {
    return (
      <div className="container mx-auto py-12 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="mt-4">Loading casino games...</p>
      </div>
    );
  }

  if (gamesError) {
    return <div className="container mx-auto py-12 text-center text-destructive">Error loading games: {gamesError}</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-12">
      {/* Featured Games Section using the marketing component */}
      <FeaturedGames title="Top Casino Picks" count={6} />
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 bg-card rounded-lg shadow sticky top-16 z-40 backdrop-blur-sm">
        <div>
          <label htmlFor="search-games" className="block text-sm font-medium text-muted-foreground mb-1">Search Games</label>
          <Input
            id="search-games"
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="category-filter" className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
          <Select value={selectedCategorySlug || ''} onValueChange={(value) => setSelectedCategorySlug(value === '' ? null : value)}>
            <SelectTrigger id="category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {displayCategories.map(category => (
                <SelectItem key={category.slug} value={category.slug}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="provider-filter" className="block text-sm font-medium text-muted-foreground mb-1">Provider</label>
           <Select value={selectedProviderSlug || ''} onValueChange={(value) => setSelectedProviderSlug(value === '' ? null : value)}>
            <SelectTrigger id="provider-filter">
              <SelectValue placeholder="All Providers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Providers</SelectItem>
              {displayProviders.map(provider => (
                <SelectItem key={provider.slug} value={provider.slug}>{provider.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Game Categories Display */}
      {displayCategories.length > 0 && !selectedCategorySlug && (
        <section>
          <h2 className="text-3xl font-bold mb-6 text-center">Game Categories</h2>
          <GameCategories 
            categories={displayCategories}
            onSelectCategory={(slug) => setSelectedCategorySlug(slug)}
            currentCategorySlug={selectedCategorySlug}
          />
        </section>
      )}
      
      {/* Popular Providers Display */}
      {displayProviders.length > 0 && !selectedProviderSlug && (
         <PopularProviders 
            providers={displayProviders}
            onSelectProvider={(slug) => setSelectedProviderSlug(slug)}
        />
      )}

      {/* Main Game Grid */}
      <section>
        <h2 className="text-3xl font-bold mb-6 text-center">
          {selectedCategorySlug || selectedProviderSlug ? 'Filtered Games' : 'All Games'}
        </h2>
        {isLoadingGames && <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>}
        {!isLoadingGames && filteredGames.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No games match your current filters.</p>
        )}
        {!isLoadingGames && filteredGames.length > 0 && (
          // GameGrid expects onGameClick to be handled by GameCard's onPlay prop
          <GameGrid games={filteredGames} /> 
        )}
      </section>
    </div>
  );
};

export default CasinoMain;
