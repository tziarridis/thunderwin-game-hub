import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Game, GameProvider, GameCategory, GameLaunchOptions, DbGame } from '@/types'; // Removed User as it's from useAuth
import { gameService, mapDbGameToGame } from '@/services/gameService'; 
import { toast } from 'sonner';
// import { Session } from '@supabase/supabase-js'; // Not directly used here for session logic
import { useAuth } from '@/contexts/AuthContext'; // For user ID

// Helper mapDbGameToGame is now imported from gameService


interface GamesContextType {
  games: Game[];
  filteredGames: Game[];
  providers: GameProvider[];
  categories: GameCategory[];
  isLoading: boolean;
  error: string | null;
  fetchGamesAndProviders: () => Promise<void>;
  filterGames: (searchTerm: string, categorySlug?: string, providerSlug?: string, tags?: string[]) => void;
  launchGame: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  getGameById: (id: string) => Promise<Game | null>;
  getGameBySlug: (slug: string) => Promise<Game | null>;
  getRelatedGames: (categorySlug: string | undefined, currentGameId: string | number | undefined, limit?: number) => Promise<Game[]>;
  getFavoriteGames: () => Promise<Game[]>; // Returns Game[] now
  loading: boolean; // alias for isLoading
  favoriteGameIds: Set<string>;
  toggleFavoriteGame: (gameId: string) => Promise<void>;
  incrementGameView: (gameId: string) => Promise<void>;
  addGame: (gameData: Partial<DbGame>) => Promise<DbGame | null>;
  updateGame: (gameId: string, gameData: Partial<DbGame>) => Promise<DbGame | null>;
  deleteGame: (gameId: string) => Promise<boolean>;
}

const GamesContext = createContext<GamesContextType>({
  games: [],
  filteredGames: [],
  providers: [],
  categories: [],
  isLoading: true,
  error: null,
  fetchGamesAndProviders: async () => {},
  filterGames: () => {},
  launchGame: async () => null,
  getGameById: async () => null,
  getGameBySlug: async () => null,
  getRelatedGames: async () => [],
  getFavoriteGames: async () => [],
  loading: true,
  favoriteGameIds: new Set(),
  toggleFavoriteGame: async () => {},
  incrementGameView: async () => {},
  addGame: async () => null,
  updateGame: async () => null,
  deleteGame: async () => false,
});

export const GamesProvider = ({ children }: { children: React.ReactNode }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteGameIds, setFavoriteGameIds] = useState<Set<string>>(new Set());
  const { user } = useAuth(); // Get user for favorites

  const fetchGamesAndProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [gamesResponse, providersResponse, categoriesResponse] = await Promise.all([
        gameService.getAllGames(),
        gameService.getAllProviders(),
        gameService.getAllCategories(),
      ]);

      if (gamesResponse.success && providersResponse.success && categoriesResponse.success) {
        const fetchedGames = gamesResponse.data.map(mapDbGameToGame); // Use imported mapper
        setGames(fetchedGames);
        setFilteredGames(fetchedGames);
        setProviders(providersResponse.data);
        setCategories(categoriesResponse.data);
      } else {
        const errorMessage = gamesResponse.error || providersResponse.error || categoriesResponse.error || 'Failed to load games, providers, or categories';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err: any) {
      console.error("Error fetching games and providers:", err);
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGamesAndProviders();
  }, [fetchGamesAndProviders]);

  const filterGames = useCallback((searchTerm: string, categorySlug?: string, providerSlug?: string, tags?: string[]) => {
    // setIsLoading(true); // Maybe remove this setIsLoading if filtering is fast
    let tempFiltered = [...games];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempFiltered = tempFiltered.filter(game =>
        game.title?.toLowerCase().includes(lowerSearchTerm) ||
        game.providerName?.toLowerCase().includes(lowerSearchTerm) ||
        game.provider?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (categorySlug) {
      tempFiltered = tempFiltered.filter(game => 
        (Array.isArray(game.category_slugs) && game.category_slugs.includes(categorySlug)) ||
        game.category === categorySlug
      );
    }

    if (providerSlug) {
      tempFiltered = tempFiltered.filter(game => game.provider_slug === providerSlug || game.provider === providerSlug);
    }

    if (tags && tags.length > 0) {
      tempFiltered = tempFiltered.filter(game => 
        tags.every(tag => game.tags?.includes(tag))
      );
    }
    setFilteredGames(tempFiltered);
    // setIsLoading(false);
  }, [games]);
  
  const launchGame = useCallback(async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    setIsLoading(true); // Consider if this loading state is needed or if page handles its own
    setError(null);
    try {
      if (!game.game_id || !game.provider_slug) {
        const errorMsg = "Game ID or provider slug is missing for launching the game.";
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      }
      const response = await gameService.createSession(game.game_id, game.provider_slug, options);
      if (response.success && response.data?.launch_url) {
        return response.data.launch_url;
      } else {
        const errorMsg = response.error || 'Failed to launch game';
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      }
    } catch (err: any) {
      console.error("Error launching game:", err);
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false); // Reset loading state
    }
  }, []);

  const getGameById = useCallback(async (id: string): Promise<Game | null> => {
    // setIsLoading(true); // Consider implications of global loading state here
    setError(null);
    try {
      const response = await gameService.getGameById(id);
      if (response.success && response.data) {
        return mapDbGameToGame(response.data); // Use imported mapper
      } else {
        // setError(response.error || 'Game not found'); // Avoid setting global error for not found
        return null;
      }
    } catch (err: any) {
      console.error("Error getting game by ID:", err);
      const errorMessage = err.message || 'An unexpected error occurred';
      // setError(errorMessage); // Avoid setting global error
      toast.error(errorMessage);
      return null;
    } finally {
      // setIsLoading(false);
    }
  }, []);
  
  const getGameBySlug = useCallback(async (slug: string): Promise<Game | null> => {
    // setIsLoading(true);
    setError(null);
    try {
      console.log(`useGames: fetching game by slug: ${slug}`);
      const response = await gameService.getGameBySlug(slug);
      if (response.success && response.data) {
        console.log(`useGames: found game by slug: ${slug}`, response.data);
        return mapDbGameToGame(response.data); // Use imported mapper
      } else {
        console.warn(`useGames: Game with slug "${slug}" not found or error: ${response.error}`);
        return null;
      }
    } catch (err: any) {
      console.error(`Error getting game by slug ${slug}:`, err);
      const errorMessage = err.message || 'An unexpected error occurred';
      // setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      // setIsLoading(false);
    }
  }, []);

  const getRelatedGames = useCallback(async (categorySlug: string | undefined, currentGameId: string | number | undefined, limit: number = 5): Promise<Game[]> => {
    try {
      if (!categorySlug) return [];
      // Client-side filter for related games. Could be an API call for better performance.
      const related = games
        .filter(game => 
          ((Array.isArray(game.category_slugs) && game.category_slugs.includes(categorySlug)) || game.category === categorySlug) &&
          game.id !== currentGameId
        )
        .slice(0, limit);
      return related;
    } catch (err: any) {
      console.error("Error getting related games:", err);
      toast.error(err.message || 'Failed to load related games.');
      return [];
    }
  }, [games]);

  const getFavoriteGames = useCallback(async (): Promise<Game[]> => {
    // setIsLoading(true); // Consider loading state management
    setError(null);
    try {
      if (!user) { // Check for user from useAuth()
        // toast.info("Log in to see your favorite games."); // Optional: inform user
        return []; // Not logged in, no favorites to fetch
      }
      const response = await gameService.getFavoriteGames(user.id); // Use user.id
      if (response.success && response.data) {
        return response.data.map(mapDbGameToGame); // Use imported mapper
      } else {
        // setError(response.error || 'Failed to fetch favorite games');
        toast.error(response.error || 'Failed to fetch favorite games');
        return [];
      }
    } catch (err: any) {
      console.error("Error fetching favorite games:", err);
      const errorMessage = err.message || 'An unexpected error occurred';
      // setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      // setIsLoading(false);
    }
  }, [user]); // Depend on user from useAuth

  useEffect(() => {
    if (user) { // If user is logged in
      getFavoriteGames().then(favoriteGamesFromDb => {
        const favIds = new Set(favoriteGamesFromDb.map(game => game.id as string));
        setFavoriteGameIds(favIds);
        // Update isFavorite status in main games list
        setGames(prevGames => prevGames.map(g => ({ ...g, isFavorite: favIds.has(g.id as string) })));
        setFilteredGames(prevFiltered => prevFiltered.map(g => ({ ...g, isFavorite: favIds.has(g.id as string) })));

      });
    } else { // User logged out
      setFavoriteGameIds(new Set());
       setGames(prevGames => prevGames.map(g => ({ ...g, isFavorite: false })));
       setFilteredGames(prevFiltered => prevFiltered.map(g => ({ ...g, isFavorite: false })));
    }
  }, [user, getFavoriteGames]); // Rerun when user changes

  const toggleFavoriteGame = useCallback(async (gameId: string): Promise<void> => {
    if (!user) { // Check for user
      toast.info("Please log in to save favorite games.");
      return;
    }

    const isCurrentlyFavorite = favoriteGameIds.has(gameId);
    const newFavoriteGameIds = new Set(favoriteGameIds);
    if (isCurrentlyFavorite) {
      newFavoriteGameIds.delete(gameId);
    } else {
      newFavoriteGameIds.add(gameId);
    }
    setFavoriteGameIds(newFavoriteGameIds);
    
    // Optimistic UI update for game lists
    const updateFavStatus = (g: Game) => g.id === gameId ? { ...g, isFavorite: !isCurrentlyFavorite } : g;
    setGames(prevGames => prevGames.map(updateFavStatus));
    setFilteredGames(prevFilteredGames => prevFilteredGames.map(updateFavStatus));

    try {
      const response = await gameService.toggleFavoriteGame(user.id, gameId, !isCurrentlyFavorite); // Pass user.id
      if (response.success) {
        toast.success(!isCurrentlyFavorite ? "Added to favorites!" : "Removed from favorites!");
      } else {
        // Revert optimistic update on failure
        setFavoriteGameIds(favoriteGameIds); // Revert to old set
        const revertFavStatus = (g: Game) => g.id === gameId ? { ...g, isFavorite: isCurrentlyFavorite } : g;
        setGames(prevGames => prevGames.map(revertFavStatus));
        setFilteredGames(prevFilteredGames => prevFilteredGames.map(revertFavStatus));
        toast.error(response.error || "Failed to update favorite status.");
      }
    } catch (error: any) {
      // Revert on error
      setFavoriteGameIds(favoriteGameIds);
      const revertFavStatusOnError = (g: Game) => g.id === gameId ? { ...g, isFavorite: isCurrentlyFavorite } : g;
      setGames(prevGames => prevGames.map(revertFavStatusOnError));
      setFilteredGames(prevFilteredGames => prevFilteredGames.map(revertFavStatusOnError));
      console.error("Error toggling favorite game:", error);
      toast.error(error.message || "An unexpected error occurred.");
    }
  }, [favoriteGameIds, user, games, filteredGames]);

  const incrementGameView = useCallback(async (gameId: string): Promise<void> => {
    try {
      await gameService.incrementGameView(gameId);
      // Optimistically update views (optional, can also re-fetch or rely on eventual consistency)
      setGames(prevGames =>
        prevGames.map(g =>
          g.id === gameId ? { ...g, views: (g.views || 0) + 1 } : g
        )
      );
      setFilteredGames(prevFilteredGames =>
        prevFilteredGames.map(g =>
          g.id === gameId ? { ...g, views: (g.views || 0) + 1 } : g
        )
      );
    } catch (error: any) {
      console.error("Error incrementing game view:", error);
      // toast.error(error.message || "Failed to update view count."); // Optional
    }
  }, []);
  
  // Admin Functions - ensure these are only callable by authorized users,
  // ideally through separate admin-only hooks or context, or with role checks.
  const addGame = useCallback(async (gameData: Partial<DbGame>): Promise<DbGame | null> => {
    setIsLoading(true);
    try {
      const newDbGame = await gameService.addGame(gameData);
      if (newDbGame) {
        const newGame = mapDbGameToGame(newDbGame); // Use imported mapper
        setGames(prevGames => [...prevGames, newGame]);
        setFilteredGames(prevFiltered => [...prevFiltered, newGame]); 
        toast.success(`Game "${newGame.title}" added successfully.`);
        return newDbGame;
      }
      return null;
    } catch (err: any) {
      console.error("Error adding game:", err);
      const errorMessage = err.message || "Failed to add game.";
      toast.error(errorMessage);
      setError(errorMessage); // Consider if global error is appropriate
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateGame = useCallback(async (gameId: string, gameData: Partial<DbGame>): Promise<DbGame | null> => {
    setIsLoading(true);
    try {
      const updatedDbGame = await gameService.updateGame(gameId, gameData);
      if (updatedDbGame) {
        const updatedGame = mapDbGameToGame(updatedDbGame); // Use imported mapper
        setGames(prevGames => prevGames.map(g => g.id === gameId ? updatedGame : g));
        setFilteredGames(prevFiltered => prevFiltered.map(g => g.id === gameId ? updatedGame : g));
        toast.success(`Game "${updatedGame.title}" updated successfully.`);
        return updatedDbGame;
      }
      return null;
    } catch (err: any) {
      console.error("Error updating game:", err);
      const errorMessage = err.message || "Failed to update game.";
      toast.error(errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteGame = useCallback(async (gameId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await gameService.deleteGame(gameId);
      if (success) {
        setGames(prevGames => prevGames.filter(game => game.id !== gameId));
        setFilteredGames(prevFiltered => prevFiltered.filter(game => game.id !== gameId));
        toast.success("Game deleted successfully.");
        return true;
      } else {
        toast.error("Failed to delete game.");
        return false;
      }
    } catch (err: any) {
      console.error("Error deleting game:", err);
      const errorMessage = err.message || "An unexpected error occurred.";
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <GamesContext.Provider value={{ 
      games, 
      filteredGames, 
      providers, 
      categories, 
      isLoading, 
      error, 
      fetchGamesAndProviders, 
      filterGames,
      launchGame,
      getGameById,
      getGameBySlug,
      getRelatedGames,
      favoriteGameIds,
      toggleFavoriteGame,
      getFavoriteGames,
      incrementGameView,
      addGame,
      updateGame,
      deleteGame,
      loading: isLoading, 
    }}>
      {children}
    </GamesContext.Provider>
  );
};

export const useGames = () => {
  const context = useContext(GamesContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GamesProvider');
  }
  return context;
};
