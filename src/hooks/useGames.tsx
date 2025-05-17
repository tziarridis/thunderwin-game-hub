import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { Game, GameProvider, GameCategory, GamesContextType, GameLaunchOptions, DbGame } from '@/types'; // GameCategory should be available now
import { gameAggregatorService } from '@/services/gameAggregatorService';
import { gamesDatabaseService } from '@/services/gamesDatabaseService'; 
import { gameProviderService } from '@/services/gameProviderService';
import { gameCategoryService } from '@/services/gameCategoryService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
// import { supabase } from '@/integrations/supabase/client'; // Only if directly used for favorites

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
    return {
      ...dbGame, // Spread DbGame first
      id: dbGame.id, // Ensure id from DbGame is used
      title: dbGame.title || dbGame.game_name || '',
      provider: dbGame.provider_slug, // This is provider_slug, UI might need provider name
      // Ensure category_slugs is an array of strings
      category_slugs: typeof dbGame.category_slugs === 'string' 
                      ? dbGame.category_slugs.split(',').map(s => s.trim()).filter(Boolean) 
                      : Array.isArray(dbGame.category_slugs) ? dbGame.category_slugs : [],
      image: dbGame.image_url || dbGame.cover, // Use image_url first, then cover
      // Map other fields from DbGame to Game as necessary
      isPopular: !!dbGame.is_popular,
      isNew: !!dbGame.is_new,
      is_featured: !!dbGame.is_featured, // Ensure this exists on Game type
      show_home: !!dbGame.show_home, // Ensure this exists on Game type
      rtp: dbGame.rtp,
      // Game specific properties that might not be on DbGame
      // or need specific mapping if DbGame has different names
      minBet: undefined, 
      maxBet: undefined,
      jackpot: undefined,
      // Ensure all Game interface fields are considered
      // provider_slug: dbGame.provider_slug, // Already part of spread if DbGame has it
      // game_id: dbGame.game_id, // Already part of spread
      // game_code: dbGame.game_code, // Already part of spread
      // slug: dbGame.slug, // Already part of spread
    };
  };
  
  const fetchGamesAndProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [gamesResponse, providersResponse, categoriesResponse] = await Promise.all([
        gamesDatabaseService.getAllGames({ limit: 500 }),
        gameProviderService.getAllProviders(),
        gameCategoryService.getAllCategories(),
      ]);

      if (gamesResponse.success && gamesResponse.data) {
        // Ensure gamesResponse.data is DbGame[] before mapping
        const mappedGames = (gamesResponse.data as DbGame[]).map(mapDbGameToGame);
        setAllGames(mappedGames);
        setFilteredGames(mappedGames);
      } else {
        setError(gamesResponse.error || "Failed to load games.");
      }

      if (providersResponse.success && providersResponse.data) {
        setProviders(providersResponse.data);
      } else {
        setError(prev => prev || providersResponse.error || "Failed to load providers.");
      }
      
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      } else {
        setError(prev => prev || categoriesResponse.error || "Failed to load categories.");
      }

    } catch (e: any) {
      console.error("Error fetching initial game data:", e);
      setError(e.message || "An unexpected error occurred.");
      toast.error(e.message || "Failed to load game data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGamesAndProviders();
  }, [fetchGamesAndProviders]);

  const filterGames = useCallback((searchTerm: string, categorySlug?: string, providerSlug?: string) => {
    let tempGames = [...allGames];
    const lowerSearchTerm = searchTerm.toLowerCase();

    if (lowerSearchTerm) {
      tempGames = tempGames.filter(game => 
        game.title?.toLowerCase().includes(lowerSearchTerm) || 
        game.provider?.toLowerCase().includes(lowerSearchTerm) || // provider here is provider_slug from mapDbGameToGame
        (game.provider_slug && game.provider_slug.toLowerCase().includes(lowerSearchTerm)) // explicit check for provider_slug
      );
    }
    if (categorySlug) {
      // Ensure game.category_slugs is checked correctly
      tempGames = tempGames.filter(game => game.category_slugs && game.category_slugs.includes(categorySlug));
    }
    if (providerSlug) {
      tempGames = tempGames.filter(game => game.provider_slug === providerSlug);
    }
    setFilteredGames(tempGames);
  }, [allGames]);


  const launchGame = async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    if (!isAuthenticated || !user) {
        toast.error("Please log in to play games.");
        return null;
    }
    // game.id should be the game's unique identifier used by aggregator
    // This might be game.game_id, game.game_code, or game.id itself depending on setup
    const gameIdForLaunch = game.game_id || game.id; // Prioritize game_id if available
    if (!gameIdForLaunch) {
        toast.error("Game identifier for launch is missing.");
        return null;
    }

    try {
        const response = await gameAggregatorService.createSession(
            gameIdForLaunch, 
            options.playerId || user.id,
            options.currency || user.currency || 'EUR',
            options.platform || 'web',
            // options.mode, // Mode is now part of GameLaunchOptions passed in
            // options.language,
            // options.returnUrl
        );
        if (response.success && response.gameUrl) {
            toast.success(`Launching ${game.title}`);
            return response.gameUrl;
        } else {
            toast.error(response.errorMessage || "Failed to launch game.");
            return null;
        }
    } catch (e: any) {
        console.error("Error launching game:", e);
        toast.error(e.message || "Failed to launch game.");
        return null;
    }
  };

  const getGameById = async (id: string): Promise<Game | null> => {
    setIsLoading(true);
    try {
        // This fetches DbGame, then maps to Game
        const response = await gamesDatabaseService.getGameById(id); 
        if (response.success && response.data) {
            return mapDbGameToGame(response.data as DbGame); // Ensure data is DbGame
        }
        toast.error(response.error || `Game with ID ${id} not found.`);
        return null;
    } catch (e: any) {
        console.error(`Error fetching game ${id}:`, e);
        toast.error(e.message || "Failed to fetch game details.");
        return null;
    } finally {
        setIsLoading(false);
    }
  };
    
  // Placeholder admin functions - these should operate on DbGame ideally
  const addGame = async (gameData: Partial<DbGame>): Promise<DbGame | null> => {
    console.log("addGame called with data:", gameData);
    // Implement actual logic using gamesDatabaseService.createGame
    // This is just a placeholder
    const response = await gamesDatabaseService.createGame(gameData);
    if (response.success && response.data) {
      fetchGamesAndProviders(); // Refresh games list
      toast.success("Game added successfully!");
      return response.data as DbGame;
    }
    toast.error(response.error || "Failed to add game.");
    return null;
  };

  const updateGame = async (gameId: string, gameData: Partial<DbGame>): Promise<DbGame | null> => {
    console.log(`updateGame called for ID ${gameId} with data:`, gameData);
    // Implement actual logic using gamesDatabaseService.updateGame
    const response = await gamesDatabaseService.updateGame(gameId, gameData);
    if (response.success && response.data) {
      fetchGamesAndProviders(); // Refresh games list
      toast.success("Game updated successfully!");
      return response.data as DbGame;
    }
    toast.error(response.error || "Failed to update game.");
    return null;
  };

  const deleteGame = async (gameId: string): Promise<boolean> => {
    console.log(`deleteGame called for ID ${gameId}`);
    // Implement actual logic using gamesDatabaseService.deleteGame
    const response = await gamesDatabaseService.deleteGame(gameId);
    if (response.success) {
      fetchGamesAndProviders(); // Refresh games list
      toast.success("Game deleted successfully!");
      return true;
    }
    toast.error(response.error || "Failed to delete game.");
    return false;
  };


  const toggleFavoriteGame = async (gameId: string): Promise<void> => {
    // Placeholder implementation
    console.log(`Toggling favorite for game ${gameId}`);
    // Actual implementation would involve Supabase call and updating favoriteGameIds
    // e.g., using a service method like:
    // const result = await userService.toggleFavoriteGame(user.id, gameId);
    // if (result.success) {
    //   setFavoriteGameIds(new Set(result.data.favorite_ids));
    //   toast.success(result.message);
    // } else {
    //   toast.error(result.error);
    // }
  };

  const incrementGameView = async (gameId: string): Promise<void> => {
    // Placeholder implementation
    console.log(`Incrementing view count for game ${gameId}`);
    // await gamesDatabaseService.incrementGameViews(gameId);
  };

  return (
    <GamesContext.Provider value={{ 
        games: allGames, 
        filteredGames, 
        providers, 
        categories, 
        isLoading, 
        error, 
        fetchGamesAndProviders, 
        filterGames, 
        launchGame,
        getGameById,
        loading: isLoading, 
        favoriteGameIds,
        toggleFavoriteGame, 
        incrementGameView,
        // Admin functions
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
