import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { Game, GameProvider, GameCategory, GamesContextType, GameLaunchOptions, DbGame } from '@/types';
import { gamesService } from '@/services/gamesService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface GamesProviderProps {
  children: React.ReactNode;
}

// Add mock implementation for missing functions
const getFavoriteGameIdsByUserId = async (userId: string): Promise<string[]> => {
  console.log("Getting favorite game IDs for user:", userId);
  // This would normally query the database
  return ['1', '2', '3']; // Mock favorite game IDs
};

const toggleUserFavoriteGame = async (userId: string, gameId: string): Promise<boolean> => {
  console.log(`Toggling favorite status for user ${userId}, game ${gameId}`);
  // This would normally add or remove the game from favorites in the database
  return true; // Mock successful toggle
};

// Extend gamesService with our new functions
const extendedGamesService = {
  ...gamesService,
  getFavoriteGameIdsByUserId,
  toggleUserFavoriteGame
};

export const GamesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoriteGameIds, setFavoriteGameIds] = useState<Set<string>>(new Set());
  const { isAuthenticated, user } = useAuth();

  const fetchGamesAndProviders = useCallback(async () => {
    setIsLoading(true);
    try {
      const gamesData = await gamesService.getGames();
      const providersData = await gamesService.getProviders();
      const categoriesData = await gamesService.getCategories();

      setGames(gamesData);
      setFilteredGames(gamesData); // Initially, filtered games are all games
      setProviders(providersData);
      setCategories(categoriesData);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching games and providers:", err);
      setError(err.message || "Failed to load games and providers.");
      toast.error(err.message || "Failed to load games and providers.");
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
      let results = games.filter(game => {
        const searchRegex = new RegExp(searchTerm, 'i');
        const matchesSearch = searchRegex.test(game.title) || searchRegex.test(game.providerName || '');

        const matchesCategory = !categorySlug || game.category_slugs?.includes(categorySlug) || game.category === categorySlug;
        const matchesProvider = !providerSlug || game.provider === providerSlug || game.provider_slug === providerSlug;

        return matchesSearch && matchesCategory && matchesProvider;
      });
      setFilteredGames(results);
    } catch (err: any) {
      console.error("Error filtering games:", err);
      setError(err.message || "Failed to filter games.");
      toast.error(err.message || "Failed to filter games.");
    } finally {
      setIsLoading(false);
    }
  }, [games]);

  const launchGame = async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    setLoading(true);
    try {
      const response = await gamesService.createSession(game, options);
      if (response.success && response.gameUrl) {
        return response.gameUrl;
      } else {
        toast.error(response.errorMessage || "Failed to launch game. Please try again.");
        return null;
      }
    } catch (err: any) {
      console.error("Error launching game:", err);
      toast.error(err.message || "An unexpected error occurred while launching the game.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getGameById = useCallback(async (id: string): Promise<Game | null> => {
    try {
      const game = await gamesService.getGameById(id);
      return game;
    } catch (err: any) {
      console.error("Error getting game by ID:", err);
      toast.error(err.message || "Failed to get game by ID.");
      return null;
    }
  }, []);

  const getFavoriteGames = useCallback(async (): Promise<Game[]> => {
    if (!isAuthenticated || !user?.id) {
      return [];
    }
    try {
      const favoriteIds = await extendedGamesService.getFavoriteGameIdsByUserId(user.id);
      const favoriteGames = games.filter(game => favoriteIds.includes(game.id));
      return favoriteGames;
    } catch (err: any) {
      console.error("Error getting favorite games:", err);
      toast.error(err.message || "Failed to get favorite games.");
      return [];
    }
  }, [isAuthenticated, user, games]);

  const toggleFavoriteGame = async (gameId: string) => {
    if (!isAuthenticated || !user?.id) {
      toast.error("Please log in to save favorites");
      return;
    }
    
    try {
      const success = await extendedGamesService.toggleUserFavoriteGame(user.id, gameId);
      
      if (success) {
        setFavoriteGameIds((prev) => {
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
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Failed to update favorites");
    }
  };

  const incrementGameView = async (gameId: string) => {
    try {
      await gamesService.incrementGameView(gameId);
      // Optimistically update the view count in the local state
      setGames(prevGames =>
        prevGames.map(game =>
          game.id === gameId ? { ...game, views: (game.views || 0) + 1 } : game
        )
      );
      setFilteredGames(prevGames =>
        prevGames.map(game =>
          game.id === gameId ? { ...game, views: (game.views || 0) + 1 } : game
        )
      );
    } catch (err: any) {
      console.error("Error incrementing game view:", err);
      toast.error("Failed to update game view count.");
    }
  };

  const addGame = async (gameData: Partial<DbGame>): Promise<DbGame | null> => {
    try {
      const newGame = await gamesService.addGame(gameData);
      if (newGame) {
        setGames(prevGames => [...prevGames, newGame]);
        setFilteredGames(prevGames => [...prevGames, newGame]);
        toast.success("Game added successfully!");
        return newGame;
      } else {
        toast.error("Failed to add game.");
        return null;
      }
    } catch (err: any) {
      console.error("Error adding game:", err);
      toast.error(err.message || "Failed to add game.");
      return null;
    }
  };

  const updateGame = async (gameId: string, gameData: Partial<DbGame>): Promise<DbGame | null> => {
    try {
      const updatedGame = await gamesService.updateGame(gameId, gameData);
      if (updatedGame) {
        setGames(prevGames =>
          prevGames.map(game => (game.id === gameId ? { ...game, ...updatedGame } : game))
        );
        setFilteredGames(prevGames =>
          prevGames.map(game => (game.id === gameId ? { ...game, ...updatedGame } : game))
        );
        toast.success("Game updated successfully!");
        return updatedGame;
      } else {
        toast.error("Failed to update game.");
        return null;
      }
    } catch (err: any) {
      console.error("Error updating game:", err);
      toast.error(err.message || "Failed to update game.");
      return null;
    }
  };

  const deleteGame = async (gameId: string): Promise<boolean> => {
    try {
      const success = await gamesService.deleteGame(gameId);
      if (success) {
        setGames(prevGames => prevGames.filter(game => game.id !== gameId));
        setFilteredGames(prevGames => prevGames.filter(game => game.id !== gameId));
        toast.success("Game deleted successfully!");
        return true;
      } else {
        toast.error("Failed to delete game.");
        return false;
      }
    } catch (err: any) {
      console.error("Error deleting game:", err);
      toast.error(err.message || "Failed to delete game.");
      return false;
    }
  };

  useEffect(() => {
    const loadFavoriteGames = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const favoriteIds = await extendedGamesService.getFavoriteGameIdsByUserId(user.id);
          setFavoriteGameIds(new Set(favoriteIds));
        } catch (err) {
          console.error("Error loading favorite games:", err);
        }
      }
    };
    
    loadFavoriteGames();
  }, [isAuthenticated, user]);

  const value: GamesContextType = {
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
    getFavoriteGames,
    loading,
    favoriteGameIds,
    toggleFavoriteGame,
    incrementGameView,
    addGame,
    updateGame,
    deleteGame,
  };

  return (
    <GamesContext.Provider value={value}>
      {children}
    </GamesContext.Provider>
  );
};

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export const useGames = (): GamesContextType => {
  const context = useContext(GamesContext);
  if (!context) {
    throw new Error("useGames must be used within a GamesProvider");
  }
  return context;
};
