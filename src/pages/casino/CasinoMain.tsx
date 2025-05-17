
import React, { useEffect, useState, useMemo } from 'react';
import { useGames } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';
import { Game, GameCategory, GameProvider as GameProviderType } from '@/types';
import GameGrid from '@/components/casino/GameGrid'; // Assuming this is the correct GameGrid
import GameCategories from '@/components/casino/GameCategories'; 
import PopularProviders from '@/components/casino/PopularProviders';
import PromoBanner from '@/components/casino/PromoBanner';
import { Input } from '@/components/ui/input';
import { Search, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const CasinoMain = () => {
  const { 
    games: allGamesData, // Renamed to avoid conflict with filteredGames if used directly
    isLoading, 
    error, 
    filterGames, // This function from useGames context filters 'allGames' within the context
    providers, 
    categories,
    filteredGames: contextFilteredGames, // Games filtered by context's filterGames
    launchGame,
  } = useGames();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  // Use the filteredGames from the context, which are updated by filterGames call
  useEffect(() => {
    // console.log("CasinoMain: SearchTerm or SelectedCategory changed. Calling filterGames.", { searchTerm, selectedCategory });
    filterGames(searchTerm, selectedCategory);
  }, [searchTerm, selectedCategory, filterGames]);
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (categorySlug: string | undefined) => {
    setSelectedCategory(categorySlug);
    // console.log("CasinoMain: Category changed to:", categorySlug);
  };

  const handleGameClick = async (game: Game) => {
    if (!isAuthenticated || !user) {
      toast.info("Please log in to play games.", {
        action: {
          label: "Login",
          onClick: () => navigate('/login'),
        },
      });
      return;
    }
    
    const gameIdToLaunch = game.game_id || game.id; // Prefer game_id if available
    if (!gameIdToLaunch) {
        toast.error("Game ID is missing, cannot launch.");
        return;
    }

    // Ensure all necessary user details are present
    if (!user.id || !user.currency) {
        toast.error("User details incomplete. Cannot launch game.");
        console.error("Missing user ID or currency for game launch.", user);
        return;
    }

    const gameUrl = await launchGame(game, { 
      mode: 'real',
      playerId: String(user.id), // Ensure string
      currency: user.currency,
      platform: 'web',
    });

    if (gameUrl) {
      // For production, consider opening in a new tab or an iframe within the site
      // window.open(gameUrl, '_blank', 'noopener,noreferrer');
      // Or navigate to a dedicated game launch page:
      navigate(`/casino/game/${game.id}?launchUrl=${encodeURIComponent(gameUrl)}`);
    } else {
      // Error toast is handled by launchGame
    }
  };

  const popularGames = useMemo(() => allGamesData.filter(game => game.isPopular).slice(0, 12), [allGamesData]);
  const newGames = useMemo(() => allGamesData.filter(game => game.isNew).slice(0, 12), [allGamesData]);
  const allGamesForGrid = useMemo(() => allGamesData.slice(0, 18), [allGamesData]);


  if (error && !isLoading) { // Show error only if not loading and error exists
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-xl text-red-400">Oops! Something went wrong.</p>
        <p className="text-muted-foreground">We encountered an error loading game data: {error}</p>
        <p className="text-muted-foreground mt-2">Please try refreshing the page or contact support if the issue persists.</p>
      </div>
    );
  }
  
  const currentGamesToDisplay = searchTerm || selectedCategory ? contextFilteredGames : allGamesData;

  return (
    <div className="space-y-8 lg:space-y-12 px-2 sm:px-4 md:px-6 lg:px-8 py-6 min-h-screen">
      <PromoBanner 
        // title="Epic Wins Await!" description="Dive into our thrilling selection of games and grab your welcome bonus!" buttonText="Sign Up & Play" onButtonClick={() => navigate('/register')} 
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
      
      <GameCategories 
        categories={categories as GameCategory[]}
        onSelectCategory={handleCategoryChange} 
        selectedCategory={selectedCategory} 
      />

      {isLoading && currentGamesToDisplay.length === 0 ? ( // Show skeleton only when loading and no games yet for the current filter
        <div>
          <Skeleton className="h-8 w-1/4 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-md bg-muted/20" />)}
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
                games={contextFilteredGames} 
                loading={isLoading && contextFilteredGames.length === 0} // Show loading in grid only if still fetching for this specific filter
                onGameClick={handleGameClick} 
                emptyMessage="No games match your criteria. Try a different search or category!"
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
      
      {providers.length > 0 && (
         <PopularProviders 
            providers={providers.filter(p => p.isActive).slice(0, 10) as GameProviderType[]} // Show more active providers
         /> 
      )}
      
      {!selectedCategory && !searchTerm && !isLoading && allGamesForGrid.length > 0 && (
         <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">All Games</h2>
            <GameGrid games={allGamesForGrid} loading={false} onGameClick={handleGameClick}/> 
         </section>
      )}
    </div>
  );
};

export default CasinoMain;
