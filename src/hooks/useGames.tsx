import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { Game, GameProvider, GameCategory, GamesContextType, GameLaunchOptions, DbGame, ApiResponse, QueryOptions } from '@/types';
import { gameAggregatorService } from '@/services/gameAggregatorService';
import { gamesDatabaseService } from '@/services/gamesDatabaseService';
import { gameProviderService } from '@/services/gameProviderService';
import { gameCategoryService } from '@/services/gameCategoryService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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

    return {
      ...dbGame, 
      id: dbGame.id, 
      title: dbGame.title, 
      provider: dbGame.provider_slug, 
      category_slugs: categorySlugsArray,
      image: dbGame.image_url || dbGame.cover, 
      isPopular: !!dbGame.is_popular,
      isNew: !!dbGame.is_new,
      is_featured: !!dbGame.is_featured,
      show_home: !!dbGame.show_home,
      rtp: dbGame.rtp,
      minBet: undefined, 
      maxBet: undefined,
      jackpot: undefined,
      name: dbGame.title, 
    };
  };
  
  const fetchGamesAndProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [gamesResponse, rawProvidersData, rawCategoriesData] = await Promise.all([
        gamesDatabaseService.getAllGames({ limit: 500 }),
        gameProviderService.getProviders(), 
        gameCategoryService.getCategories(),
      ]);

      if (gamesResponse.success && gamesResponse.data) {
        const mappedGames = (gamesResponse.data as DbGame[]).map(mapDbGameToGame);
        setAllGames(mappedGames);
        setFilteredGames(mappedGames);
      } else {
        setError(gamesResponse.error || "Failed to load games.");
      }

      // Assuming rawProvidersData needs mapping to GameProvider type from index.d.ts
      if (rawProvidersData && Array.isArray(rawProvidersData)) {
        const mappedProviders: GameProvider[] = rawProvidersData.map((p: any) => ({
          id: String(p.id),
          name: p.name || 'Unknown Provider',
          slug: p.slug || p.name?.toLowerCase().replace(/\s+/g, '-') || String(p.id),
          logo: p.logo,
          description: p.description,
          isActive: p.status === 'active' || p.isActive === true, // Prioritize isActive if present
          order: p.order || 0,
          games_count: p.games_count || 0,
          // status: p.status === 'active' ? 'active' : 'inactive', // if still needed
        }));
        setProviders(mappedProviders);
      } else {
        const err = "Failed to load providers.";
        setError(prev => prev ? `${prev} ${err}` : err);
      }
      
      // Assuming rawCategoriesData needs mapping to GameCategory type from index.d.ts
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
        const err = "Failed to load categories.";
        setError(prev => prev ? `${prev} ${err}` : err);
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
        game.provider?.toLowerCase().includes(lowerSearchTerm) ||
        (game.provider_slug && game.provider_slug.toLowerCase().includes(lowerSearchTerm))
      );
    }
    if (categorySlug) {
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
    const gameIdForLaunch = game.game_id || game.id; 
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
        const response = await gamesDatabaseService.getGameById(id); 
        if (response.success && response.data) {
            // Ensure response.data is DbGame before mapping
            return mapDbGameToGame(response.data as DbGame);
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
    
  const fetchFavoriteGames = async (): Promise<Game[]> => {
    if (!user || !isAuthenticated) return [];
    setIsLoading(true);
    try {
      // This assumes a service method like gamesDatabaseService.getFavoriteGamesByUserId(userId)
      // For now, returning an empty array as a placeholder if the service method isn't ready.
      // const response = await gamesDatabaseService.getFavoriteGamesByUserId(user.id);
      // if (response.success && response.data) {
      //   return (response.data as DbGame[]).map(mapDbGameToGame);
      // }
      // toast.info("Favorite games functionality is under development.");
      return []; // Placeholder
    } catch (e: any) {
      console.error("Error fetching favorite games:", e);
      toast.error("Failed to load favorite games.");
      return [];
    } finally {
      setIsLoading(false);
    }
  };


  const toggleFavoriteGame = async (gameId: string): Promise<void> => {
    if (!user || !isAuthenticated) {
      toast.error("Please log in to manage favorites.");
      return;
    }
    // This is a placeholder. Actual implementation involves calling a service
    // to update favorites in the DB and then updating `favoriteGameIds` state.
    // Example: const result = await userService.toggleFavoriteGame(user.id, gameId);
    setFavoriteGameIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gameId)) {
        newSet.delete(gameId);
        toast.success("Removed from favorites");
      } else {
        newSet.add(gameId);
        toast.success("Added to favorites");
      }
      return newSet;
    });
  };

  const incrementGameView = async (gameId: string): Promise<void> => {
    try {
      await gamesDatabaseService.incrementGameViews(gameId); // Corrected method name
      console.log(`Incremented view count for game ${gameId}`);
    } catch (error) {
      console.error(`Failed to increment view count for game ${gameId}:`, error);
      // Optionally toast an error if this is critical, but usually it's a background task
    }
  };

  const addGame = async (gameData: Partial<DbGame>): Promise<DbGame | null> => {
    console.log("addGame called with data:", gameData);
    // Ensure category_slugs is an array if it's a string
    if (gameData.category_slugs && typeof gameData.category_slugs === 'string') {
        gameData.category_slugs = gameData.category_slugs.split(',').map(s => s.trim()).filter(Boolean);
    }

    const response = await gamesDatabaseService.createGame(gameData);
    if (response.success && response.data) {
      fetchGamesAndProviders(); 
      toast.success("Game added successfully!");
      return response.data as DbGame;
    }
    toast.error(response.error || "Failed to add game.");
    return null;
  };

  const updateGame = async (gameId: string, gameData: Partial<DbGame>): Promise<DbGame | null> => {
    console.log(`updateGame called for ID ${gameId} with data:`, gameData);
    // Ensure category_slugs is an array if it's a string
    if (gameData.category_slugs && typeof gameData.category_slugs === 'string') {
        gameData.category_slugs = gameData.category_slugs.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    const response = await gamesDatabaseService.updateGame(gameId, gameData);
    if (response.success && response.data) {
      fetchGamesAndProviders(); 
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
      fetchGamesAndProviders(); 
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
        fetchGamesAndProviders, 
        filterGames, 
        launchGame,
        getGameById,
        getFavoriteGames: fetchFavoriteGames, // Added
        loading: isLoading, 
        favoriteGameIds,
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
