import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Game, GameCategory, GameProvider, GameTag, GameSortOption, DisplayGame } from '@/types'; // Assuming DisplayGame is needed
import { useGames } from '@/hooks/useGames';
import GamesGrid from '@/components/games/GamesGrid';
import GameFilters, { Filters } from '@/components/games/GameFilters';
import HeroSection from '@/components/marketing/HeroSection'; // Corrected import path
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import CategoryTabs from '@/components/games/CategoryTabs'; // For CategoryTabsProps
import ProviderCarousel from '@/components/games/ProviderCarousel'; // For ProviderCarouselProps

// Define type for the gameService getAllGames method
interface GetAllGamesOptions {
  limit?: number;
  offset?: number;
  category?: string;
  provider?: string;
  search?: string;
  featured?: boolean;
  popular?: boolean;
  latest?: boolean;
}

const GAMES_PER_PAGE = 24;

const fetchInitialGames = async (): Promise<DisplayGame[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'active') // Only active games
    .limit(GAMES_PER_PAGE);
  if (error) throw error;
  return data.map(g => ({ ...g, isFavorite: false })) as DisplayGame[]; // Map to DisplayGame
};

const fetchCategories = async (): Promise<GameCategory[]> => {
  const { data, error } = await supabase.from('game_categories').select('*').eq('status', 'active');
  if (error) throw error;
  return data.map(c => ({ ...c, id: String(c.id) })) as GameCategory[]; // Ensure id is string
};

const fetchProviders = async (): Promise<GameProvider[]> => {
  const { data, error } = await supabase.from('game_providers').select('*').eq('is_active', true);
  if (error) throw error;
  // Ensure GameProvider has id as string if needed by ProviderCarousel
  return data.map(p => ({ ...p, id: String(p.id), slug: p.slug || String(p.id) })) as GameProvider[];
};


const CasinoMainPage = () => {
  // ... keep existing code (hooks, state variables)
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { 
    games: allGamesFromHook, 
    fetchGames, 
    isLoading: gamesLoadingFromHook, 
    hasMore: hasMoreFromHook,
    error: gamesErrorFromHook,
    toggleFavoriteGame, // Keep this if used directly, or ensure GameCard handles it via useGames
    favoriteGameIds,
    // getFavoriteGames, // This was commented out, check if needed
   } = useGames();

  const [displayedGames, setDisplayedGames] = useState<DisplayGame[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Filters>({
    category: 'all',
    provider: 'all',
    sortBy: 'popularity', // Ensure GameSortOption includes 'popularity' if this is a valid value
    tags: [],
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch static data like categories and providers
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<GameCategory[], Error>({
    queryKey: ['gameCategories'],
    queryFn: fetchCategories,
    staleTime: Infinity,
  });
  const { data: providers = [], isLoading: isLoadingProviders } = useQuery<GameProvider[], Error>({
    queryKey: ['gameProviders'],
    queryFn: fetchProviders,
    staleTime: Infinity,
  });
  
  // Initial games load and merging with favorites
  useEffect(() => {
    if (allGamesFromHook.length === 0 && !gamesLoadingFromHook) {
        // Ensure fetchGames parameters align with its definition in useGames hook
        fetchGames({ page: 1, limit: GAMES_PER_PAGE, filters: activeFilters, searchTerm });
    }
  }, [fetchGames, allGamesFromHook.length, gamesLoadingFromHook]); // Added dependencies for clarity

  useEffect(() => {
    setDisplayedGames(
      allGamesFromHook.map(game => ({
        ...game,
        isFavorite: favoriteGameIds.has(String(game.id)), // Ensure game.id exists and is stringified
      }))
    );
  }, [allGamesFromHook, favoriteGameIds]);
  

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    fetchGames({ page: 1, limit: GAMES_PER_PAGE, filters: activeFilters, searchTerm: term });
  };

  const handleFilterChange = (newFilters: Filters) => {
    setActiveFilters(newFilters);
    setCurrentPage(1);
    fetchGames({ page: 1, limit: GAMES_PER_PAGE, filters: newFilters, searchTerm });
  };

  const loadMoreGames = () => {
    if (hasMoreFromHook && !gamesLoadingFromHook) {
      const nextPage = currentPage + 1;
      fetchGames({ page: nextPage, limit: GAMES_PER_PAGE, filters: activeFilters, searchTerm });
      setCurrentPage(nextPage);
    }
  };

  // Ensure handleGameClick matches what GamesGrid expects for onGameClick
  const handleGameClick = (game: Game) => { 
    // Removed mode parameter as GamesGrid onGameClick likely doesn't pass it.
    // If mode is needed, GamesGrid or GameCard needs to handle its selection.
    console.log("Navigating to game:", game.title);
    navigate(`/casino/game/${game.slug || game.id}`);
  };
  
  // handleGameDetails can be passed to GamesGrid if it supports an onGameDetails prop
  // const handleGameDetails = (game: Game) => { ... };

  const isLoading = gamesLoadingFromHook || isLoadingCategories || isLoadingProviders;

  const categoryTabsProps = {
    categories: categories.map(c => ({ id: String(c.id), name: c.name, slug: c.slug })),
    activeCategory: activeFilters.category,
    onSelectCategory: (slug: string) => handleFilterChange({ ...activeFilters, category: slug }),
  };

  const providerCarouselProps = {
    // Ensure providers are mapped correctly for ProviderCarousel
    providers: providers.map(p => ({ id: String(p.id), name: p.name, logo_url: p.logo_url, slug: p.slug || String(p.id) })),
    activeProvider: activeFilters.provider,
    onSelectProvider: (slug: string) => handleFilterChange({ ...activeFilters, provider: slug }),
  };
  
  const gamesGridProps = {
    games: displayedGames,
    onGameClick: handleGameClick,
    loading: gamesLoadingFromHook, // This should be the primary loading for the grid content
    loadMore: loadMoreGames,
    hasMore: hasMoreFromHook,
    loadingMore: gamesLoadingFromHook && currentPage > 1, // More specific loading state
    // emptyMessage: "No games match your criteria. Try adjusting filters.", // Optional: customize
  };

  // ... keep existing code (JSX structure for the page)
  return (
    <div className="bg-background text-foreground">
      <HeroSection 
        title="Explore Our Exciting Games"
        subtitle="Dive into a world of adventure and big wins. Find your new favorite!"
        // ctaText="Browse All Games" // These were commented out in original
        // ctaLink="/casino/all" // These were commented out in original
      />

      <div className="container mx-auto px-4 py-8">
        {/* Search and Mobile Filter Toggle */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full sm:w-auto">
            <Input 
              type="search"
              placeholder="Search for games..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)} // Use handleSearch directly
              className="pl-10 h-12 text-base"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <Button variant="outline" className="sm:hidden w-full" onClick={() => setShowMobileFilters(!showMobileFilters)}>
            <SlidersHorizontal className="mr-2 h-4 w-4"/> Filters
          </Button>
        </div>
        
        {/* Desktop Filters (Placeholder based on original comments) */}
        {/* <div className="hidden sm:block mb-8">
          <GameFilters 
            categories={categories} // Ensure GameFilters categories prop matches this structure
            providers={providers} // Ensure GameFilters providers prop matches this structure
            // tags={[]} // Add tags if used
            onFilterChange={handleFilterChange}
            initialFilters={activeFilters}
          />
        </div> */}

        {/* Mobile Filters Drawer/Modal (Placeholder based on original comments) */}
        {/* {showMobileFilters && (
          <div className="sm:hidden mb-6 p-4 bg-card rounded-lg shadow-lg">
            <GameFilters 
              categories={categories}
              providers={providers}
              onFilterChange={(newFilters) => { handleFilterChange(newFilters); setShowMobileFilters(false); }}
              initialFilters={activeFilters}
              isMobile // Assuming GameFilters has an isMobile prop
            />
          </div>
        )} */}

        {/* Category Tabs */}
        {!isLoadingCategories && categories.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Categories</h2>
            <CategoryTabs {...categoryTabsProps} />
          </div>
        )}

        {/* Provider Carousel */}
        {!isLoadingProviders && providers.length > 0 && (
           <div className="mb-8">
             <h2 className="text-xl font-semibold mb-3">Providers</h2>
            <ProviderCarousel {...providerCarouselProps} />
           </div>
        )}
        
        {gamesErrorFromHook && (
          <div className="text-center py-10 text-destructive">
            <p>Error loading games: {gamesErrorFromHook.message || String(gamesErrorFromHook)}</p> {/* Display error message */}
            <Button onClick={() => fetchGames({ page: 1, limit: GAMES_PER_PAGE, filters: activeFilters, searchTerm })} className="mt-4">Retry</Button>
          </div>
        )}

        {/* Display loading for initial fetch OR pass to GamesGrid */}
        {gamesLoadingFromHook && displayedGames.length === 0 && !gamesErrorFromHook && (
           <div className="flex justify-center items-center py-12">
             <Loader2 className="h-10 w-10 animate-spin text-primary" />
           </div>
        )}
        
        {/* Render GamesGrid only if not initial loading and no error, or let GamesGrid handle its own empty/loading state */}
        {(!gamesLoadingFromHook || displayedGames.length > 0) && !gamesErrorFromHook && (
            <GamesGrid {...gamesGridProps} />
        )}

      </div>
    </div>
  );
};

export default CasinoMainPage;
