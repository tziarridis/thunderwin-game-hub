import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { Game, GameProvider, GameCategory, GamesContextType, GameLaunchOptions, DbGame, ApiResponse, QueryOptions } from '@/types';
import { gameAggregatorService } from '@/services/gameAggregatorService';
import { gamesDatabaseService } from '@/services/gamesDatabaseService';
import { gameProviderService } from '@/services/gameProviderService';
import { gameCategoryService } from '@/services/gameCategoryService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
// Assuming a service for user-specific favorites, e.g., userService or a specific favoritesService
// import { userService } from '@/services/userService'; 

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export const GamesProvider = ({ children }: { children: React.ReactNode }) => {
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteGameIds, setFavoriteGameIds] = useState<Set<string>>(new Set());
  const { user, isAuthenticated } = useAuth();

  const mapDbGameToGame = (dbGame: DbGame): Game => {
    const rawCategorySlugs = dbGame.category_slugs;
    let categorySlugsArray: string[] = [];

    if (typeof rawCategorySlugs === 'string') {
      categorySlugsArray = rawCategorySlugs.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(rawCategorySlugs)) {
      categorySlugsArray = rawCategorySlugs.filter(s => typeof s === 'string');
    }
    
    // Find provider and category names for better display
    // These will be undefined if providers/categories list isn't populated yet or if no match
    const providerObj = providers.find(p => p.slug === dbGame.provider_slug || p.id === dbGame.provider_id);
    const categoryObj = categorySlugsArray.length > 0 ? categories.find(c => c.slug === categorySlugsArray[0]) : undefined;


    return {
      ...dbGame, 
      id: dbGame.id, 
      title: dbGame.title, 
      provider: dbGame.provider_slug || dbGame.provider_id || 'unknown_provider', 
      providerName: providerObj?.name || dbGame.provider_slug || dbGame.provider_id,
      category: categorySlugsArray[0] || 'unknown_category',
      categoryName: categoryObj?.name || categorySlugsArray[0],
      category_slugs: categorySlugsArray,
      image: dbGame.cover || dbGame.image_url || "/placeholder.svg", 
      isPopular: !!dbGame.is_popular,
      isNew: !!dbGame.is_new,
      is_featured: !!dbGame.is_featured,
      show_home: !!dbGame.show_home,
      rtp: dbGame.rtp,
      minBet: dbGame.min_bet, 
      maxBet: dbGame.max_bet,
      // jackpot: undefined, // Add if DbGame has jackpot info
      name: dbGame.title, 
      slug: dbGame.slug,
      description: dbGame.description,
      volatility: dbGame.volatility,
      status: dbGame.status,
      views: dbGame.views,
      release_date: dbGame.release_date,
      created_at: dbGame.created_at,
      updated_at: dbGame.updated_at,
      game_id: dbGame.game_id,
      isFavorite: favoriteGameIds.has(dbGame.id), // Dynamically set based on favoriteGameIds
    };
  };
  
  const fetchGamesAndProvidersAndCategories = useCallback(async () => { // Renamed for clarity
    setIsLoading(true);
    setError(null);
    try {
      // Fetch providers and categories first to use in mapDbGameToGame
      const [rawProvidersData, rawCategoriesData] = await Promise.all([
        gameProviderService.getProviders(), 
        gameCategoryService.getCategories(),
      ]);

      if (rawProvidersData && Array.isArray(rawProvidersData)) {
        const mappedProviders: GameProvider[] = rawProvidersData.map((p: any) => ({
          id: String(p.id),
          name: p.name || 'Unknown Provider',
          slug: p.slug || p.name?.toLowerCase().replace(/\s+/g, '-') || String(p.id),
          logo: p.logo,
          description: p.description,
          isActive: p.status === 'active' || p.isActive === true,
          order: p.order || 0,
          games_count: p.games_count || 0,
        }));
        setProviders(mappedProviders);
      } else {
        setError(prev => prev ? `${prev} Failed to load providers.` : "Failed to load providers.");
      }
      
      if (rawCategoriesData && Array.isArray(rawCategoriesData)) {
         const mappedCategories: GameCategory[] = rawCategoriesData.map((c: any) => ({
          id: String(c.id),
          name: c.name || 'Unknown Category',
          slug: c.slug || c.name?.toLowerCase().replace(/\s+/g, '-') || String(c.id),
          icon: c.icon,
          image: c.image,
          order: c.order || 0,
          show_home: !!c.show_home,
          status: (c.status === 'active' || c.status === 'inactive') ? c.status : 'inactive',
          isActive: c.status === 'active' || c.isActive === true,
          description: c.description,
        }));
        setCategories(mappedCategories);
      } else {
        setError(prev => prev ? `${prev} Failed to load categories.` : "Failed to load categories.");
      }

      // Now fetch games
      const gamesResponse = await gamesDatabaseService.getAllGames({ limit: 1000 }); // Increased limit

      if (gamesResponse.success && gamesResponse.data) {
        // mapDbGameToGame will now use the populated providers and categories states
        const mappedGames = (gamesResponse.data as DbGame[]).map(mapDbGameToGame);
        setAllGames(mappedGames);
        setFilteredGames(mappedGames); // Initial filtered list is all games
      } else {
        setError(prev => prev ? `${prev} ${gamesResponse.error || "Failed to load games."}` : (gamesResponse.error || "Failed to load games."));
      }

    } catch (e: any) {
      console.error("Error fetching initial game data:", e);
      const errorMsg = e.message || "An unexpected error occurred.";
      setError(prev => prev ? `${prev} ${errorMsg}` : errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [favoriteGameIds]); // Added favoriteGameIds dependency for mapDbGameToGame

  // Fetch initial data
  useEffect(() => {
    fetchGamesAndProvidersAndCategories();
  }, [fetchGamesAndProvidersAndCategories]);
  
  // Fetch user's favorite game IDs when user logs in
  useEffect(() => {
    const fetchUserFavorites = async () => {
      if (user?.id && isAuthenticated) {
        try {
          // Replace with actual service call: e.g., const favIds = await userService.getFavoriteGameIds(user.id);
          // This is a placeholder until a proper backend service for favorites exists.
          // For demo, we assume favorites are stored in localStorage or a simple backend.
          // const storedFavs = localStorage.getItem(`favorites_${user.id}`);
          // if (storedFavs) {
          //   setFavoriteGameIds(new Set(JSON.parse(storedFavs)));
          // } else {
          //   setFavoriteGameIds(new Set()); // No stored favorites
          // }
          // For now, just initialize as empty or fetch if you have a service
           const response = await gamesDatabaseService.getFavoriteGameIdsByUserId(user.id); // Assuming this service method exists
           if(response.success && response.data) {
            setFavoriteGameIds(new Set(response.data));
           } else {
            console.warn("Could not fetch favorite game IDs or no favorites found:", response.error);
            setFavoriteGameIds(new Set());
           }
        } catch (err) {
          console.error("Failed to fetch user favorites:", err);
          setFavoriteGameIds(new Set()); // Reset on error
        }
      } else {
        setFavoriteGameIds(new Set()); // Clear favorites if user logs out
      }
    };
    fetchUserFavorites();
  }, [user, isAuthenticated]);

  // Re-map allGames when favoriteGameIds changes to update isFavorite status
  useEffect(() => {
    setAllGames(prevGames => prevGames.map(game => ({ ...game, isFavorite: favoriteGameIds.has(game.id) })));
  }, [favoriteGameIds]);


  const filterGames = useCallback((searchTerm: string, categorySlug?: string, providerSlug?: string) => {
    let tempGames = [...allGames]; // Use allGames which has updated isFavorite
    const lowerSearchTerm = searchTerm.toLowerCase();

    if (lowerSearchTerm) {
      tempGames = tempGames.filter(game => 
        game.title?.toLowerCase().includes(lowerSearchTerm) || 
        (game.providerName && game.providerName.toLowerCase().includes(lowerSearchTerm)) ||
        (game.provider_slug && game.provider_slug.toLowerCase().includes(lowerSearchTerm)) ||
        (game.slug && game.slug.toLowerCase().includes(lowerSearchTerm))
      );
    }
    if (categorySlug) {
      tempGames = tempGames.filter(game => game.category_slugs && game.category_slugs.includes(categorySlug));
    }
    if (providerSlug) {
      // game.provider might be ID or slug, provider_slug is more specific
      tempGames = tempGames.filter(game => game.provider_slug === providerSlug || game.provider === providerSlug);
    }
    setFilteredGames(tempGames);
  }, [allGames]);


  const launchGame = async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    if (!isAuthenticated || !user) {
        toast.error("Please log in to play games.");
        return null;
    }
    const gameIdForLaunch = game.game_id || game.id; 
    if (!gameIdForLaunch) {
        toast.error("Game identifier for launch is missing.");
        return null;
    }
     if (!options.playerId) options.playerId = user.id;
     if (!options.currency) options.currency = user.currency || 'EUR';


    try {
        const response = await gameAggregatorService.createSession(
            gameIdForLaunch, 
            options.playerId,
            options.currency,
            options.platform || 'web',
            // Potentially pass other options if your service supports them
            // options.mode, options.language, etc.
        );
        if (response.success && response.gameUrl) {
            // toast.success(`Launching ${game.title}`); // GameDetails page might show this
            // Increment view count here or after successful launch navigation
            incrementGameView(game.id);
            return response.gameUrl;
        } else {
            toast.error(response.errorMessage || "Failed to launch game session.");
            return null;
        }
    } catch (e: any) {
        console.error("Error launching game:", e);
        toast.error(e.message || "Failed to launch game.");
        return null;
    }
  };

  const getGameById = async (id: string): Promise<Game | null> => {
    // This can also use the allGames array if fully populated and up-to-date
    const existingGame = allGames.find(g => g.id === id);
    if (existingGame) return existingGame;

    setIsLoading(true);
    try {
        const response = await gamesDatabaseService.getGameById(id); 
        if (response.success && response.data) {
            return mapDbGameToGame(response.data as DbGame);
        }
        // toast.error(response.error || `Game with ID ${id} not found.`); // GameDetails will toast
        return null;
    } catch (e: any) {
        console.error(`Error fetching game ${id}:`, e);
        // toast.error(e.message || "Failed to fetch game details."); // GameDetails will toast
        return null;
    } finally {
        setIsLoading(false);
    }
  };
    
  const getFavoriteGames = async (): Promise<Game[]> => {
    if (!user || !isAuthenticated) return [];
    // This relies on favoriteGameIds being up-to-date.
    return allGames.filter(game => favoriteGameIds.has(game.id));
  };


  const toggleFavoriteGame = async (gameId: string): Promise<void> => {
    if (!user || !isAuthenticated) {
      toast.error("Please log in to manage favorites.");
      return;
    }
    
    const isCurrentlyFavorite = favoriteGameIds.has(gameId);
    // Optimistic update
    const newFavIds = new Set(favoriteGameIds);
    if (isCurrentlyFavorite) {
      newFavIds.delete(gameId);
    } else {
      newFavIds.add(gameId);
    }
    setFavoriteGameIds(newFavIds);

    try {
      // Actual backend call
      // Example: await userService.setFavoriteStatus(user.id, gameId, !isCurrentlyFavorite);
      // For demo, using a mock local storage or a direct Supabase call if set up
      // localStorage.setItem(`favorites_${user.id}`, JSON.stringify(Array.from(newFavIds)));
      const response = await gamesDatabaseService.toggleUserFavoriteGame(user.id, gameId);
      if (!response.success) {
        // Revert optimistic update if backend call fails
        setFavoriteGameIds(new Set(favoriteGameIds)); // Revert to old set
        toast.error(response.error || "Failed to update favorites on server.");
      } else {
         toast.success(isCurrentlyFavorite ? "Removed from favorites" : "Added to favorites");
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setFavoriteGameIds(new Set(favoriteGameIds)); // Revert to old set
      toast.error("Error updating favorites: " + error.message);
    }
  };

  const incrementGameView = async (gameId: string): Promise<void> => {
    try {
      await gamesDatabaseService.incrementGameViews(gameId);
      // Update local game view count if desired, or refetch game details
      // For simplicity, not updating local state here to avoid complexity
      console.log(`Incremented view count for game ${gameId}`);
    } catch (error) {
      console.error(`Failed to increment view count for game ${gameId}:`, error);
    }
  };

  const addGame = async (gameData: Partial<DbGame>): Promise<DbGame | null> => {
    console.log("addGame called with data:", gameData);
    if (gameData.category_slugs && typeof gameData.category_slugs === 'string') {
        gameData.category_slugs = gameData.category_slugs.split(',').map(s => s.trim()).filter(Boolean);
    }

    const response = await gamesDatabaseService.createGame(gameData);
    if (response.success && response.data) {
      fetchGamesAndProvidersAndCategories(); 
      toast.success("Game added successfully!");
      return response.data as DbGame;
    }
    toast.error(response.error || "Failed to add game.");
    return null;
  };

  const updateGame = async (gameId: string, gameData: Partial<DbGame>): Promise<DbGame | null> => {
    console.log(`updateGame called for ID ${gameId} with data:`, gameData);
    if (gameData.category_slugs && typeof gameData.category_slugs === 'string') {
        gameData.category_slugs = gameData.category_slugs.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    const response = await gamesDatabaseService.updateGame(gameId, gameData);
    if (response.success && response.data) {
      fetchGamesAndProvidersAndCategories(); 
      toast.success("Game updated successfully!");
      return response.data as DbGame;
    }
    toast.error(response.error || "Failed to update game.");
    return null;
  };

  const deleteGame = async (gameId: string): Promise<boolean> => {
    console.log(`deleteGame called for ID ${gameId}`);
    const response = await gamesDatabaseService.deleteGame(gameId);
    if (response.success) {
      fetchGamesAndProvidersAndCategories(); 
      toast.success("Game deleted successfully!");
      return true;
    }
    toast.error(response.error || "Failed to delete game.");
    return false;
  };

  return (
    <GamesContext.Provider value={{ 
        games: allGames, 
        filteredGames, 
        providers, 
        categories, 
        isLoading, 
        error, 
        fetchGamesAndProviders: fetchGamesAndProvidersAndCategories, 
        filterGames, 
        launchGame,
        getGameById,
        getFavoriteGames,
        loading: isLoading, // Keep 'loading' alias if used by consumers
        favoriteGameIds, // Expose for direct checking if needed
        toggleFavoriteGame, 
        incrementGameView,
        addGame,
        updateGame,
        deleteGame,
      }}>
      {children}
    </GamesContext.Provider>
  );
};

export const useGames = (): GamesContextType => {
  const context = useContext(GamesContext);
  if (!context) {
    throw new Error('useGames must be used within a GamesProvider');
  }
  return context;
};
