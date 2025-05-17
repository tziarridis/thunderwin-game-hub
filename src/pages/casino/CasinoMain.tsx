import React, { useEffect, useState, useMemo } from 'react';
import { useGames } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';
import { Game, GameCategory, GameProvider as GameProviderType } from '@/types'; // Renamed GameProvider to avoid conflict
import GameGrid from '@/components/casino/GameGrid';
import GameCategories from '@/components/casino/GameCategories'; // Read-only, assuming props: categories, onSelectCategory, selectedCategory
import PopularProviders from '@/components/casino/PopularProviders'; // Read-only, assuming props: providers
import PromoBanner from '@/components/casino/PromoBanner'; // Read-only, assuming some props or self-contained
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom'; // For navigation on login

const CasinoMain = () => {
  const { 
    games, 
    isLoading, 
    error, 
    filterGames, 
    providers, 
    categories,
    filteredGames,
    launchGame,
  } = useGames();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  useEffect(() => {
    filterGames(searchTerm, selectedCategory);
  }, [searchTerm, selectedCategory, filterGames]);
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (categorySlug: string | undefined) => {
    setSelectedCategory(categorySlug);
    // setSearchTerm(''); // Reset search term when category changes -- user might want to keep it
  };

  const handleGameClick = async (game: Game) => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to play.");
      navigate('/login'); // Navigate to login page
      return;
    }
    // Ensure game.id is a string if launchGame expects it
    const gameIdToLaunch = game.id ? String(game.id) : (game.game_id || "");
    if (!gameIdToLaunch) {
        toast.error("Game ID is missing, cannot launch.");
        return;
    }

    const gameUrl = await launchGame({ ...game, id: gameIdToLaunch }, { // Pass game with ensured string ID
      mode: 'real',
      playerId: user.id,
      currency: user.currency || 'EUR',
      platform: 'web',
    });
    if (gameUrl) {
      window.open(gameUrl, '_blank');
    }
  };

  const popularGames = useMemo(() => games.filter(game => game.isPopular).slice(0, 12), [games]);
  const newGames = useMemo(() => games.filter(game => game.isNew).slice(0, 12), [games]);

  if (error) {
    return <p className="text-red-500 text-center py-10">Error loading games: {error}</p>;
  }

  // Assuming PromoBanner, GameCategories, PopularProviders are read-only and might not take specific props
  // or take very generic ones. If they are essential and need specific props, this might still error.
  // For now, providing minimal or no props.

  return (
    <div className="space-y-8 lg:space-y-12 px-2 sm:px-4 md:px-6 lg:px-8 py-6">
      {/* If PromoBanner is self-contained or takes no props / optional props */}
      <PromoBanner 
        // title="Welcome!" description="Check out our latest offers." buttonText="Explore" onButtonClick={() => navigate('/promotions')} 
      />

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search games..."
            className="pl-10 w-full bg-card border-border focus:ring-primary"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      {/* Assuming GameCategories takes these props */}
      <GameCategories 
        categories={categories as GameCategory[]} // Cast if necessary, ensure type compatibility
        onSelectCategory={handleCategoryChange} 
        selectedCategory={selectedCategory} 
      />

      {isLoading && !filteredGames.length && !searchTerm && !selectedCategory ? (
        <div>
          <Skeleton className="h-8 w-1/4 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-md" />)}
          </div>
        </div>
      ) : (
        <>
          {selectedCategory || searchTerm ? (
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">
                {searchTerm && selectedCategory ? `Results for "${searchTerm}" in ${categories.find(c=>c.slug === selectedCategory)?.name || selectedCategory}` : 
                 searchTerm ? `Search Results for "${searchTerm}"` : 
                 categories.find(c=>c.slug === selectedCategory)?.name || "Filtered Games" }
              </h2>
              <GameGrid 
                games={filteredGames} 
                loading={isLoading} 
                onGameClick={handleGameClick} 
                emptyMessage="No games found for your criteria."
              />
            </section>
          ) : (
            <>
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">Popular Games</h2>
                <GameGrid games={popularGames} loading={isLoading} onGameClick={handleGameClick} />
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">New Releases</h2>
                <GameGrid games={newGames} loading={isLoading} onGameClick={handleGameClick} />
              </section>
            </>
          )}
        </>
      )}
      
      {/* Assuming PopularProviders takes these props */}
      <PopularProviders 
        providers={providers.slice(0, 5) as GameProviderType[]} // Cast if necessary
      /> 
      
      {!selectedCategory && !searchTerm && !isLoading && (
         <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">All Games</h2>
            <GameGrid games={games.slice(0, 18)} loading={isLoading} onGameClick={handleGameClick}/> 
         </section>
      )}
    </div>
  );
};

export default CasinoMain;
