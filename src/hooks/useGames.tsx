import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Game, GameProvider, GameCategory, GameLaunchOptions, DbGame, User } from '@/types';
import { gameService } from '@/services/gameService'; // Assuming gameService is the correct import
import { toast } from 'sonner';
import { Session } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

// Helper to map DbGame to Game, can be more sophisticated
const mapDbGameToGame = (dbGame: DbGame): Game => {
  // Basic mapping, ensure all required Game fields are populated
  // This might need to be more comprehensive based on actual data needs
  return {
    id: dbGame.id,
    title: dbGame.title || 'Unknown Title',
    provider: dbGame.provider_slug || dbGame.provider_id || 'unknown-provider',
    category: Array.isArray(dbGame.category_slugs) ? (dbGame.category_slugs[0] || 'unknown-category') : (dbGame.category_slugs || 'unknown-category'),
    image: dbGame.cover || dbGame.image_url || '/placeholder.svg', // Ensure a fallback image
    game_id: dbGame.game_id,
    name: dbGame.title, // or dbGame.name
    providerName: dbGame.provider_slug, // This should ideally come from a providers map/list
    categoryName: Array.isArray(dbGame.category_slugs) ? dbGame.category_slugs.join(', ') : dbGame.category_slugs, // Same, from categories map/list
    category_slugs: dbGame.category_slugs,
    description: dbGame.description,
    rtp: dbGame.rtp,
    volatility: dbGame.volatility,
    minBet: dbGame.min_bet,
    maxBet: dbGame.max_bet,
    isNew: dbGame.is_new,
    isPopular: dbGame.is_popular,
    is_featured: dbGame.is_featured,
    show_home: dbGame.show_home,
    tags: dbGame.tags,
    jackpot: undefined, // Assuming DbGame might not have this directly
    releaseDate: dbGame.release_date,
    release_date: dbGame.release_date,
    views: dbGame.views,
    created_at: dbGame.created_at,
    updated_at: dbGame.updated_at,
    provider_id: dbGame.provider_id,
    provider_slug: dbGame.provider_slug,
    features: dbGame.features,
    themes: dbGame.themes,
    lines: dbGame.lines,
    cover: dbGame.cover,
    banner: dbGame.banner,
    image_url: dbGame.image_url,
    status: dbGame.status,
    slug: dbGame.slug,
    game_code: dbGame.game_code,
    // Ensure all other 'Game' specific fields are mapped or have defaults
  };
};

interface GamesContextType {
  games: Game[];
  filteredGames: Game[];
  providers: GameProvider[];
  categories: GameCategory[];
  isLoading: boolean;
  error: string | null;
  fetchGamesAndProviders: () => Promise<void>;
  filterGames: (searchTerm: string, categorySlug?: string, providerSlug?: string) => void;
  launchGame: (game: Game, options: GameLaunchOptions) => Promise<string | null>; // For GameDetails
  getGameById: (id: string) => Promise<Game | null>;
  getFavoriteGames: () => Promise<Game[]>;
  loading: boolean;
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
  fetchGamesAndProviders: () => Promise.resolve(),
  filterGames: () => {},
  launchGame: () => Promise.resolve(null),
  getGameById: () => Promise.resolve(null),
  getFavoriteGames: () => Promise.resolve([]),
  loading: false,
  favoriteGameIds: new Set(),
  toggleFavoriteGame: () => Promise.resolve(),
  incrementGameView: () => Promise.resolve(),
  addGame: () => Promise.resolve(null),
  updateGame: () => Promise.resolve(null),
  deleteGame: () => Promise.resolve(false),
});

export const GamesProvider = ({ children }: { children: React.ReactNode }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteGameIds, setFavoriteGameIds] = useState<Set<string>>(new Set());
  const { user, session } = useAuth();

  const fetchGamesAndProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const gamesResponse = await gameService.getAllGames();
      const providersResponse = await gameService.getAllProviders();
      const categoriesResponse = await gameService.getAllCategories();

      if (gamesResponse.success && providersResponse.success && categoriesResponse.success) {
        const fetchedGames = gamesResponse.data.map(mapDbGameToGame);
        setGames(fetchedGames);
        setFilteredGames(fetchedGames);
        setProviders(providersResponse.data);
        setCategories(categoriesResponse.data);
      } else {
        setError(gamesResponse.error || providersResponse.error || categoriesResponse.error || 'Failed to load games, providers, or categories');
        toast.error(gamesResponse.error || providersResponse.error || categoriesResponse.error || 'Failed to load games, providers, or categories');
      }
    } catch (err: any) {
      console.error("Error fetching games and providers:", err);
      setError(err.message || 'An unexpected error occurred');
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGamesAndProviders();
  }, [fetchGamesAndProviders]);

  const filterGames = useCallback((searchTerm: string, categorySlug?: string, providerSlug?: string) => {
    setIsLoading(true);
    try {
      let filtered = games.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.provider.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (categorySlug) {
        filtered = filtered.filter(game => game.category === categorySlug);
      }

      if (providerSlug) {
        filtered = filtered.filter(game => game.provider === providerSlug);
      }
      setFilteredGames(filtered);
    } catch (err: any) {
      console.error("Error filtering games:", err);
      setError(err.message || 'An unexpected error occurred');
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [games]);

  const launchGame = useCallback(async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await gameService.createSession(game, options);
      if (response.success && response.gameUrl) {
        return response.gameUrl;
      } else {
        setError(response.error || 'Failed to launch game');
        toast.error(response.error || 'Failed to launch game');
        return null;
      }
    } catch (err: any) {
      console.error("Error launching game:", err);
      setError(err.message || 'An unexpected error occurred');
      toast.error(err.message || 'An unexpected error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getGameById = useCallback(async (id: string): Promise<Game | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await gameService.getGameById(id);
      if (response.success && response.data) {
        return mapDbGameToGame(response.data);
      } else {
        setError(response.error || 'Game not found');
        toast.error(response.error || 'Game not found');
        return null;
      }
    } catch (err: any) {
      console.error("Error getting game by ID:", err);
      setError(err.message || 'An unexpected error occurred');
      toast.error(err.message || 'An unexpected error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFavoriteGames = useCallback(async (): Promise<Game[]> => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user || !session) {
        return [];
      }
      // Assuming there's a method in gameService to fetch favorite games by user ID
      const response = await gameService.getFavoriteGames(user.id);
      if (response.success && response.data) {
        // Map DbGame to Game if necessary
        return response.data.map(mapDbGameToGame);
      } else {
        setError(response.error || 'Failed to fetch favorite games');
        toast.error(response.error || 'Failed to fetch favorite games');
        return [];
      }
    } catch (err: any) {
      console.error("Error fetching favorite games:", err);
      setError(err.message || 'An unexpected error occurred');
      toast.error(err.message || 'An unexpected error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    if (user && session) {
      getFavoriteGames().then(favoriteGames => {
        setFavoriteGameIds(new Set(favoriteGames.map(game => game.id)));
      });
    } else {
      setFavoriteGameIds(new Set());
    }
  }, [user, session, getFavoriteGames]);

  const toggleFavoriteGame = useCallback(async (gameId: string): Promise<void> => {
    if (!user || !session) {
      toast.info("Please log in to save favorite games.");
      return;
    }

    const isCurrentlyFavorite = favoriteGameIds.has(gameId);
    setIsLoading(true);
    try {
      const response = await gameService.toggleFavoriteGame(user.id, gameId, !isCurrentlyFavorite);
      if (response.success) {
        const newFavoriteGameIds = new Set(favoriteGameIds);
        if (isCurrentlyFavorite) {
          newFavoriteGameIds.delete(gameId);
          toast.success("Removed from favorites!");
        } else {
          newFavoriteGameIds.add(gameId);
          toast.success("Added to favorites!");
        }
        setFavoriteGameIds(newFavoriteGameIds);
      } else {
        toast.error(response.error || "Failed to update favorite status.");
      }
    } catch (error: any) {
      console.error("Error toggling favorite game:", error);
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [favoriteGameIds, user, session]);

  const incrementGameView = useCallback(async (gameId: string): Promise<void> => {
    try {
      await gameService.incrementGameView(gameId);
      // Optimistically update the views count in the local state
      setGames(prevGames =>
        prevGames.map(game =>
          game.id === gameId ? { ...game, views: (game.views || 0) + 1 } : game
        )
      );
      setFilteredGames(prevFilteredGames =>
        prevFilteredGames.map(game =>
          game.id === gameId ? { ...game, views: (game.views || 0) + 1 } : game
        )
      );
    } catch (error: any) {
      console.error("Error incrementing game view:", error);
      // Optionally handle the error, e.g., show a toast
      // toast.error(error.message || "Failed to update view count.");
    }
  }, []);
  
  const addGame = useCallback(async (gameData: Partial<DbGame>): Promise<DbGame | null> => {
    setIsLoading(true);
    try {
      const newDbGame = await gameService.addGame(gameData);
      if (newDbGame) {
        const newGame = mapDbGameToGame(newDbGame); // Map DbGame to Game
        setGames(prevGames => [...prevGames, newGame]);
        setFilteredGames(prevFilteredGames => [...prevFilteredGames, newGame]); // Also update filtered games
        toast.success(`Game "${newGame.title}" added successfully.`);
        return newDbGame;
      }
      return null;
    } catch (err: any) {
      console.error("Error adding game:", err);
      toast.error(err.message || "Failed to add game.");
      setError(err.message || "Failed to add game.");
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
        const updatedGame = mapDbGameToGame(updatedDbGame); // Map DbGame to Game
        setGames(prevGames => prevGames.map(g => g.id === gameId ? updatedGame : g));
        setFilteredGames(prevFilteredGames => prevFilteredGames.map(g => g.id === gameId ? updatedGame : g));
        toast.success(`Game "${updatedGame.title}" updated successfully.`);
        return updatedDbGame;
      }
      return null;
    } catch (err: any) {
      console.error("Error updating game:", err);
      toast.error(err.message || "Failed to update game.");
      setError(err.message || "Failed to update game.");
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
        setFilteredGames(prevFilteredGames => prevFilteredGames.filter(game => game.id !== gameId));
        toast.success("Game deleted successfully.");
        return true;
      } else {
        toast.error("Failed to delete game.");
        return false;
      }
    } catch (err: any) {
      console.error("Error deleting game:", err);
      toast.error(err.message || "An unexpected error occurred.");
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
      isLoading, // Ensure 'isLoading' is used, not 'loading' if that's the state variable
      error, 
      fetchGamesAndProviders, 
      filterGames,
      launchGame,
      getGameById,
      favoriteGameIds,
      toggleFavoriteGame,
      getFavoriteGames,
      incrementGameView,
      addGame,
      updateGame,
      deleteGame,
      loading: isLoading, // Keep 'loading' if it's also part of the context type, maps to isLoading
    }}>
      {children}
    </GamesContext.Provider>
  );
};

export const useGames = () => {
  return useContext(GamesContext);
};
