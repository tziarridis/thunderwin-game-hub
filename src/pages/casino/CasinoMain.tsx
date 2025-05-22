import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Game, GameCategory, GameProvider, GameTag, GameSortOption, DisplayGame } from '@/types'; // Assuming DisplayGame is needed
import { useGames } from '@/hooks/useGames';
import GamesGrid from '@/components/games/GamesGrid'; // GameGridProps might need onGameClick
import GameFilters, { Filters } from '@/components/games/GameFilters';
import HeroSection from '@/components/layout/HeroSection';
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
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { 
    games: allGamesFromHook, 
    fetchGames, 
    isLoading: gamesLoadingFromHook, 
    hasMore: hasMoreFromHook,
    error: gamesErrorFromHook,
    toggleFavoriteGame,
    favoriteGameIds,
    getFavoriteGames, // To potentially pre-load favorites
   } = useGames();

  const [displayedGames, setDisplayedGames] = useState<DisplayGame[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Filters>({
    category: 'all',
    provider: 'all',
    sortBy: 'popularity',
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
    // Load initial set of games (e.g., popular or first page)
    // This can be part of useGames or a separate initial fetch
    const loadInitial = async () => {
      // Example: fetchGames({ page: 1, limit: GAMES_PER_PAGE, filters: activeFilters, searchTerm });
      // For now, using the games from useGames hook directly if it handles initial load
      // If useGames doesn't load initially, trigger fetchGames here.
      if (allGamesFromHook.length === 0 && !gamesLoadingFromHook) {
          fetchGames({ page: 1, limit: GAMES_PER_PAGE, filters: activeFilters, searchTerm });
      }
    };
    loadInitial();
  }, [fetchGames]); // Removed activeFilters, searchTerm to avoid loop if they are deps of fetchGames

  useEffect(() => {
    // Update displayedGames when allGamesFromHook or favoriteGameIds change
    setDisplayedGames(
      allGamesFromHook.map(game => ({
        ...game,
        isFavorite: favoriteGameIds.has(String(game.id)),
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

  const handleGameClick = (game: Game, mode?: "real" | "demo") => { // GamesGrid expects (game: Game) => void
    console.log("Playing game:", game.title, "Mode:", mode);
    // If mode is important, GamesGrid's onGameClick might need to pass it or have separate handlers
    navigate(`/casino/game/${game.slug || game.id}`);
  };
  
  const handleGameDetails = (game: Game) => {
    console.log("Details for game:", game.title);
    // Navigate to a game details page or show a modal
    // navigate(`/casino/game/${game.slug || game.id}/details`);
    toast.info(`More details for ${game.title} (Not implemented)`);
  };

  const isLoading = gamesLoadingFromHook || isLoadingCategories || isLoadingProviders;

  const categoryTabsProps = {
    categories: categories.map(c => ({ id: String(c.id), name: c.name, slug: c.slug })), // Ensure id is string for CategoryTabs
    activeCategory: activeFilters.category,
    onSelectCategory: (slug: string) => handleFilterChange({ ...activeFilters, category: slug }),
  };

  const providerCarouselProps = {
    providers: providers.map(p => ({ id: String(p.id), name: p.name, logo: p.logo, slug: p.slug || String(p.id) })), // Map to expected props
    activeProvider: activeFilters.provider,
    onSelectProvider: (slug: string) => handleFilterChange({ ...activeFilters, provider: slug }),
  };
  
  // This example for GamesGrid assumes it primarily needs onGameClick.
  // If onPlayGame and onGameDetails are distinct, GamesGrid interface needs updates.
  // For now, mapping handleGameClick to onGameClick.
  const gamesGridProps = {
    games: displayedGames,
    onGameClick: handleGameClick, // Corrected prop name
    // onGameDetails: handleGameDetails, // If GameGrid supports this
    loading: gamesLoadingFromHook,
    // loadingSkeletonCount: GAMES_PER_PAGE, // If GameGrid supports this
    loadMore: loadMoreGames,
    hasMore: hasMoreFromHook,
    loadingMore: gamesLoadingFromHook && currentPage > 1, // Indicate loading more specifically
  };


  return (
    <div className="bg-background text-foreground">
      <HeroSection 
        title="Explore Our Exciting Games"
        subtitle="Dive into a world of adventure and big wins. Find your new favorite!"
        // ctaText="Browse All Games"
        // ctaLink="/casino/all"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Search and Mobile Filter Toggle */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full sm:w-auto">
            <Input 
              type="search"
              placeholder="Search for games..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-12 text-base"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <Button variant="outline" className="sm:hidden w-full" onClick={() => setShowMobileFilters(!showMobileFilters)}>
            <SlidersHorizontal className="mr-2 h-4 w-4"/> Filters
          </Button>
        </div>
        
        {/* Desktop Filters (if GameFilters component is used) */}
        {/* <div className="hidden sm:block mb-8">
          <GameFilters 
            categories={categories}
            providers={providers}
            // tags={[]} // Add tags if used
            onFilterChange={handleFilterChange}
            initialFilters={activeFilters}
          />
        </div> */}

        {/* Mobile Filters Drawer/Modal (placeholder) */}
        {/* {showMobileFilters && (
          <div className="sm:hidden mb-6 p-4 bg-card rounded-lg shadow-lg">
            <GameFilters 
              categories={categories}
              providers={providers}
              onFilterChange={(newFilters) => { handleFilterChange(newFilters); setShowMobileFilters(false); }}
              initialFilters={activeFilters}
              isMobile
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
            <p>Error loading games: {gamesErrorFromHook}</p>
            <Button onClick={() => fetchGames({ page: 1, limit: GAMES_PER_PAGE, filters: activeFilters, searchTerm })} className="mt-4">Retry</Button>
          </div>
        )}

        <GamesGrid {...gamesGridProps} />
        
        {gamesLoadingFromHook && displayedGames.length === 0 && (
           <div className="flex justify-center items-center py-12">
             <Loader2 className="h-10 w-10 animate-spin text-primary" />
           </div>
        )}

      </div>
    </div>
  );
};

export default CasinoMainPage;
