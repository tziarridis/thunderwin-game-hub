
import React, { useEffect, useMemo, useState } from 'react';
import { useGames } from '@/hooks/useGames';
import GameGrid from '@/components/games/GameGrid'; // General purpose grid
// import FeaturedGames from '@/components/casino/FeaturedGames'; // Marketing specific
import GameCategories from '@/components/games/GameCategories'; // More general categories component
import PopularProviders from '@/components/casino/PopularProviders';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Game } from '@/types';
import { useNavigate } from 'react-router-dom';

const CasinoMain = () => {
  const { games, isLoading, error, categories, providers, fetchGames } = useGames();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch games when component mounts or filters change
    // The useGames hook already fetches initially.
    // This could be used for re-fetching with specific filters if needed.
  }, [selectedCategory, selectedProvider, fetchGames]);

  const handleGameClick = (game: Game) => {
    // Navigate to game details page or launch game
    if (game.slug) {
      navigate(`/casino/game/${game.slug}`);
    } else if (game.id) {
      navigate(`/casino/game/${String(game.id)}`);
    } else {
      console.warn("Game has no slug or ID for navigation:", game.title);
    }
  };

  const filteredGames = useMemo(() => {
    return games
      .filter(game => {
        const titleMatch = game.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const categoryMatch = selectedCategory 
          ? (game.categoryName === selectedCategory || 
            (Array.isArray(game.category_slugs) && game.category_slugs.includes(selectedCategory)) ||
            game.category_slugs === selectedCategory || // if it's a string
            game.category === selectedCategory) // Fallback
          : true;
        const providerMatch = selectedProvider 
          ? (game.providerName === selectedProvider || 
             game.provider_slug === selectedProvider ||
             game.provider === selectedProvider) // Fallback
          : true;
        return titleMatch && categoryMatch && providerMatch;
      });
  }, [games, searchTerm, selectedCategory, selectedProvider]);

  if (isLoading && games.length === 0) {
    return (
      <div className="container mx-auto py-12 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="mt-4">Loading casino games...</p>
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto py-12 text-center text-destructive">Error loading games: {error.message}</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-12">
      {/* Hero or Featured Section - Placeholder */}
      {/* <FeaturedGames games={games.slice(0,5)} /> */}
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 bg-card rounded-lg shadow">
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
          <Select value={selectedCategory || ''} onValueChange={(value) => setSelectedCategory(value === '' ? null : value)}>
            <SelectTrigger id="category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="provider-filter" className="block text-sm font-medium text-muted-foreground mb-1">Provider</label>
           <Select value={selectedProvider || ''} onValueChange={(value) => setSelectedProvider(value === '' ? null : value)}>
            <SelectTrigger id="provider-filter">
              <SelectValue placeholder="All Providers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Providers</SelectItem>
              {providers.map(provider => (
                <SelectItem key={provider} value={provider}>{provider}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Game Categories Display - Could be a slider or grid */}
      {categories.length > 0 && !selectedCategory && (
        <section>
          <h2 className="text-3xl font-bold mb-6 text-center">Game Categories</h2>
          <GameCategories 
            categories={categories.map(c => ({ name: c, slug: c, icon: undefined }))} // Adapt if your GameCategories component expects a different shape
            onSelectCategory={(slug) => setSelectedCategory(slug)}
            currentCategorySlug={selectedCategory}
          />
        </section>
      )}
      
      {/* Popular Providers Display */}
      {providers.length > 0 && !selectedProvider && (
         <PopularProviders 
            providers={providers.map(p => ({ name: p, slug: p, logoUrl: undefined }))} // Adapt if your PopularProviders component expects a different shape
            onSelectProvider={(slug) => setSelectedProvider(slug)}
        />
      )}

      {/* Main Game Grid */}
      <section>
        <h2 className="text-3xl font-bold mb-6 text-center">
          {selectedCategory || selectedProvider ? 'Filtered Games' : 'All Games'}
        </h2>
        {isLoading && <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>}
        {!isLoading && filteredGames.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No games match your current filters.</p>
        )}
        {!isLoading && filteredGames.length > 0 && (
          <GameGrid games={filteredGames} />
        )}
      </section>

      {/* You can add more sections like "New Games", "Popular Games" by filtering `games` state */}
    </div>
  );
};

export default CasinoMain;
