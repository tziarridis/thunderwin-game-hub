import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGames } from '@/hooks/useGames';
import { Game } from '@/types/game';
import GameGrid from '@/components/casino/GameGrid';
import GameFilters from '@/components/casino/GameFilters';
import FeaturedGames from '@/components/casino/FeaturedGames';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import PromoBanner from '@/components/casino/PromoBanner';
import PopularProviders from '@/components/casino/PopularProviders';
import GameCardLoadingSkeleton from '@/components/skeletons/GameCardLoadingSkeleton';
import { GameCategory } from '@/types/game'; // Import GameCategory


// ... keep existing code (CasinoMain component start)
const CasinoMain: React.FC = () => {
  const { 
    games, 
    isLoading: isLoadingGames, 
    gamesError,
    providers, 
    categories, // This should be GameCategory[]
    handlePlayGame,
    handleGameDetails,
    // getPopularGames, 
    // getLatestGames
  } = useGames();
  
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(queryParams.get('category') || 'all');
  const [selectedProvider, setSelectedProvider] = useState(queryParams.get('provider') || 'all');
  const [visibleGames, setVisibleGames] = useState(24);

  const filteredGames = useMemo(() => {
    let tempGames = [...games];
    if (searchTerm) {
      tempGames = tempGames.filter(game => game.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedCategory !== 'all') {
      // Ensure game.category_slugs is an array before calling includes
      tempGames = tempGames.filter(game => 
        (Array.isArray(game.category_slugs) && game.category_slugs.includes(selectedCategory)) || 
        game.category === selectedCategory
      );
    }
    if (selectedProvider !== 'all') {
      tempGames = tempGames.filter(game => game.provider_slug === selectedProvider || game.providerName === selectedProvider);
    }
    return tempGames;
  }, [games, searchTerm, selectedCategory, selectedProvider]);

  // ... keep existing code (handleSearchChange, handleCategoryChange, handleProviderChange, updateQueryParams, loadMoreGames)
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    updateQueryParams({ search: event.target.value || undefined });
  };

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    updateQueryParams({ category: categorySlug === 'all' ? undefined : categorySlug });
  };

  const handleProviderChange = (providerSlug: string) => {
    setSelectedProvider(providerSlug);
     updateQueryParams({ provider: providerSlug === 'all' ? undefined : providerSlug });
  };

  const updateQueryParams = (paramsToUpdate: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(location.search);
    Object.entries(paramsToUpdate).forEach(([key, value]) => {
      if (value === undefined) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  const loadMoreGames = () => {
    setVisibleGames(prev => prev + 24);
  };


  if (gamesError) {
    return <div className="text-red-500 p-4">Error loading games: {gamesError.message}</div>;
  }
  
  const displayedGames = filteredGames.slice(0, visibleGames);

  // Map GameCategory to the structure expected by GameFilters if necessary
  const gameFilterCategories = useMemo(() => {
    return categories.map(cat => ({
      id: cat.id, // Assuming GameCategory has an id
      name: cat.name,
      slug: cat.slug,
    }));
  }, [categories]);


  return (
    <div className="min-h-screen bg-background text-foreground">
      <PromoBanner 
        title="" // Provide default or actual data
        description="" 
        buttonText="" 
        onButtonClick={() => {}} 
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* ... keep existing code (search input) */}
        <div className="relative mb-8">
          <Input
            type="text"
            placeholder="Search games..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-4 pl-12 text-lg border-2 border-input focus:border-primary rounded-lg shadow-lg"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground" />
        </div>

        <GameFilters
          categories={gameFilterCategories} // Pass the mapped categories
          providers={providers}
          selectedCategory={selectedCategory}
          selectedProvider={selectedProvider}
          onCategoryChange={handleCategoryChange}
          onProviderChange={handleProviderChange}
        />
        
        {/* ... keep existing code (loading skeletons, game grid, load more button) */}
        {isLoadingGames && !displayedGames.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mt-8">
            {Array.from({ length: 12 }).map((_, index) => (
              <GameCardLoadingSkeleton key={index} />
            ))}
          </div>
        ) : displayedGames.length === 0 && !isLoadingGames ? (
          <p className="text-center text-xl text-muted-foreground py-12">No games found matching your criteria.</p>
        ) : (
          <>
            <GameGrid 
              games={displayedGames} 
              onPlayGame={handlePlayGame} 
              onGameDetails={handleGameDetails}
              isLoading={isLoadingGames && displayedGames.length > 0} 
              loadingSkeletonCount={isLoadingGames && displayedGames.length > 0 ? Math.min(6, visibleGames - displayedGames.length) : 0}
            />
            {filteredGames.length > visibleGames && (
              <div className="text-center mt-8">
                <button 
                  onClick={loadMoreGames} 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                  disabled={isLoadingGames}
                >
                  {isLoadingGames ? 'Loading...' : 'Load More Games'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      <FeaturedGames title="Popular Games" count={6} showViewAllButton={false} /> 
      <PopularProviders providers={providers} onProviderSelect={handleProviderChange} />
      <FeaturedGames title="Latest Releases" count={6} showViewAllButton={false} /> 

    </div>
  );
};

export default CasinoMain;
