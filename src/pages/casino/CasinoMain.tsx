import React, { useEffect, useState, useMemo } from 'react';
import { useGames } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';
import { Game, GameCategory as TypesGameCategory, GameProvider as TypesGameProvider } from '@/types';
import GameGrid from '@/components/casino/GameGrid';
import GameCategories from '@/components/casino/GameCategories'; 
import PopularProviders from '@/components/casino/PopularProviders';
import PromoBanner from '@/components/casino/PromoBanner';
import { Input } from '@/components/ui/input';
import { Search, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
// Removed conflicting type imports for Category and Provider from components

const CasinoMain = () => {
  const { 
    games: allGamesData,
    isLoading, 
    error, 
    filterGames,
    // providers, // Not used for passing to PopularProviders component
    // categories, // Not used for passing to GameCategories component
    filteredGames: contextFilteredGames,
    launchGame,
  } = useGames(); // Get all providers and categories from useGames context
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>(undefined);


  useEffect(() => {
    // Filter games based on search, category, and provider
    filterGames(searchTerm, selectedCategory, selectedProvider);
  }, [searchTerm, selectedCategory, selectedProvider, filterGames]);
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setSelectedProvider(undefined); // Reset provider filter on new search
    // Optionally reset category filter too, or keep it
    // setSelectedCategory(undefined); 
  };

  const handleCategoryChange = (categorySlug: string | undefined) => {
    setSelectedCategory(categorySlug);
    setSelectedProvider(undefined); // Reset provider if category changes
    setSearchTerm(''); // Reset search if category changes
  };
  
  const handleProviderClick = (providerSlug: string) => {
    setSelectedProvider(providerSlug);
    setSelectedCategory(undefined); // Reset category if provider changes
    setSearchTerm(''); // Reset search if provider changes
  };


  const handleGameClick = async (game: Game) => {
    if (!isAuthenticated || !user) {
      toast.info("Please log in to play games.", {
        action: {
          label: "Login",
          onClick: () => navigate('/auth/login'), // Corrected path to /auth/login if that's your login page
        },
      });
      return;
    }
    
    const gameIdToLaunch = game.game_id || game.id;
    if (!gameIdToLaunch) {
        toast.error("Game ID is missing, cannot launch.");
        return;
    }

    if (!user.id || !user.currency) {
        toast.error("User details incomplete. Cannot launch game.");
        console.error("Missing user ID or currency for game launch.", user);
        return;
    }
    if (!launchGame) {
        toast.error("Launch game functionality is not available.");
        return;
    }

    // Construct options for game launch
    const launchOptions = {
        mode: 'real' as 'real' | 'demo', // Or determine mode based on user choice/game availability
        playerId: String(user.id),
        currency: user.currency, // Ensure user.currency is set
        platform: 'web' as 'web' | 'mobile', // Or determine platform
        // Add any other required options by launchGame or gameAggregatorService.createSession
    };
    
    try {
        const gameUrl = await launchGame(game, launchOptions);

        if (gameUrl) {
          // Option 1: Navigate to a dedicated game launch page that uses an iframe
          navigate(`/casino/game/${game.id}?launchUrl=${encodeURIComponent(gameUrl)}`);
          // Option 2: Or open in a new tab/window if the game provider supports it well
          // window.open(gameUrl, '_blank');
        } else {
          // launchGame should internally toast errors, but as a fallback:
          toast.error("Could not launch game. Please try again.");
        }
    } catch (err: any) {
        console.error("Error during game click launch sequence:", err);
        toast.error(err.message || "An unexpected error occurred while trying to launch the game.");
    }
  };

  const popularGames = useMemo(() => allGamesData.filter(game => game.isPopular).slice(0, 12), [allGamesData]);
  const newGames = useMemo(() => allGamesData.filter(game => game.isNew).slice(0, 12), [allGamesData]);
  const allGamesForGrid = useMemo(() => allGamesData.slice(0, 18), [allGamesData]);


  if (error && !isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-xl text-red-400">Oops! Something went wrong.</p>
        <p className="text-muted-foreground">We encountered an error loading game data: {error.toString()}</p>
        <p className="text-muted-foreground mt-2">Please try refreshing the page or contact support if the issue persists.</p>
      </div>
    );
  }
  
  const currentGamesToDisplay = searchTerm || selectedCategory || selectedProvider ? contextFilteredGames : allGamesData;
  
  const { categories: gameCategoriesFromHook, providers: gameProvidersFromHook } = useGames();


  return (
    <div className="space-y-8 lg:space-y-12 px-2 sm:px-4 md:px-6 lg:px-8 py-6 min-h-screen">
      <PromoBanner 
        title="Welcome to Our Casino!"
        description="Discover exciting games and win big!"
        buttonText="Explore Now"
        onButtonClick={() => navigate('/casino/new')}
        // imageUrl prop removed as it caused an error; PromoBanner might not support it or uses a different prop name.
        // If PromoBanner has an image prop, use that. For now, assuming it's not critical.
      />

      <div className="flex flex-col md:flex-row gap-4 items-center sticky top-16 md:top-0 z-30 bg-casino-thunder-darker py-3 -mx-2 sm:-mx-4 md:-mx-6 lg:-mx-8 px-2 sm:px-4 md:px-6 lg:px-8 shadow-md">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for games or providers..."
            className="pl-10 w-full bg-card border-border/50 focus:ring-casino-neon-green focus:border-casino-neon-green rounded-full h-11"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      {/* GameCategories does not take 'categories' prop based on read-only file */}
      <GameCategories 
        onSelectCategory={handleCategoryChange} 
        selectedCategory={selectedCategory} 
      />

      {isLoading && currentGamesToDisplay.length === 0 ? (
        <div>
          <Skeleton className="h-8 w-1/4 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-md bg-muted/20" />)}
          </div>
        </div>
      ) : (
        <>
          {selectedCategory || searchTerm || selectedProvider ? (
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">
                {/* Dynamically generate title based on filters */}
                {searchTerm && `Results for "${searchTerm}"`}
                {searchTerm && (selectedCategory || selectedProvider) && " in "}
                {selectedCategory && `${gameCategoriesFromHook.find(c => c.slug === selectedCategory)?.name || selectedCategory}`}
                {selectedCategory && selectedProvider && " & "}
                {selectedProvider && `${gameProvidersFromHook.find(p => p.slug === selectedProvider)?.name || selectedProvider}`}
                {!searchTerm && !selectedCategory && !selectedProvider && "Filtered Games"}
                {(selectedCategory && !searchTerm && !selectedProvider) && (gameCategoriesFromHook.find(c=>c.slug === selectedCategory)?.name || "Selected Category")}
                {(selectedProvider && !searchTerm && !selectedCategory) && (gameProvidersFromHook.find(p=>p.slug === selectedProvider)?.name || "Selected Provider")}
              </h2>
              <GameGrid 
                games={contextFilteredGames} 
                loading={isLoading && contextFilteredGames.length === 0}
                onGameClick={handleGameClick} 
                emptyMessage="No games match your criteria. Try a different search or filter!"
              />
            </section>
          ) : (
            <>
              {popularGames.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-white">Popular Games</h2>
                  <GameGrid games={popularGames} loading={isLoading && popularGames.length === 0} onGameClick={handleGameClick} />
                </section>
              )}
              {newGames.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-white">New Releases</h2>
                  <GameGrid games={newGames} loading={isLoading && newGames.length === 0} onGameClick={handleGameClick} />
                </section>
              )}
            </>
          )}
        </>
      )}
      
      {/* PopularProviders does not take 'providers' prop based on read-only file */}
      {gameProvidersFromHook.length > 0 && (
         <PopularProviders 
            onProviderClick={handleProviderClick} // Pass the click handler
         /> 
      )}
      
      {!selectedCategory && !searchTerm && !selectedProvider && !isLoading && allGamesForGrid.length > 0 && (
         <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">All Games</h2>
            <GameGrid games={allGamesForGrid} loading={false} onGameClick={handleGameClick}/> 
         </section>
      )}
    </div>
  );
};

export default CasinoMain;
