import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Game, GameProvider, GameCategory, GameLaunchOptions, DbGame, User } from '@/types';
import { gameService } from '@/services/gameService'; 
import { toast } from 'sonner';
import { Session } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

// Helper to map DbGame to Game, can be more sophisticated
const mapDbGameToGame = (dbGame: DbGame): Game => {
  return {
    id: dbGame.id,
    slug: dbGame.slug,
    title: dbGame.title || 'Unknown Title',
    provider: dbGame.provider_slug || dbGame.provider_id?.toString() || 'unknown-provider',
    category: Array.isArray(dbGame.category_slugs) ? (dbGame.category_slugs[0] || 'unknown-category') : (dbGame.category_slugs || 'unknown-category'),
    image: dbGame.cover || dbGame.image_url || '/placeholder.svg', 
    game_id: dbGame.game_id,
    name: dbGame.title, 
    providerName: dbGame.provider_name, 
    categoryName: dbGame.category_names ? (Array.isArray(dbGame.category_names) ? dbGame.category_names.join(', ') : dbGame.category_names) : undefined,
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
    jackpot: dbGame.jackpot_amount ? true : undefined, // Example logic for jackpot
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
    game_code: dbGame.game_code,
    isFavorite: false, // Default, will be updated by favorite logic
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
  filterGames: (searchTerm: string, categorySlug?: string, providerSlug?: string, tags?: string[]) => void; // Added tags
  launchGame: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  getGameById: (id: string) => Promise<Game | null>;
  getGameBySlug: (slug: string) => Promise<Game | null>; // Added
  getRelatedGames: (categorySlug: string | undefined, currentGameId: string | number | undefined, limit?: number) => Promise<Game[]>; // Added
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
  getGameBySlug: () => Promise.resolve(null), // Added
  getRelatedGames: () => Promise.resolve([]), // Added
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
      const [gamesResponse, providersResponse, categoriesResponse] = await Promise.all([
        gameService.getAllGames(),
        gameService.getAllProviders(),
        gameService.getAllCategories(),
      ]);

      if (gamesResponse.success && providersResponse.success && categoriesResponse.success) {
        const fetchedGames = gamesResponse.data.map(mapDbGameToGame);
        setGames(fetchedGames);
        setFilteredGames(fetchedGames); // Initialize filteredGames with all games
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
    setIsLoading(true);
    setError(null);
    try {
      // Ensure game_id and provider_slug are present for gameService.createSession
      if (!game.game_id || !game.provider_slug) {
        const errorMsg = "Game ID or provider slug is missing for launching the game.";
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      }
      const response = await gameService.createSession(game.game_id, game.provider_slug, options); // Use game_id and provider_slug
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
        // toast.error(response.error || 'Game not found'); // Avoid toast if game not found is a common case
        return null;
      }
    } catch (err: any) {
      console.error("Error getting game by ID:", err);
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const getGameBySlug = useCallback(async (slug: string): Promise<Game | null> => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Fetching game by slug: ${slug}`);
      // Assuming gameService has a method getGameBySlug
      const response = await gameService.getGameBySlug(slug);
      if (response.success && response.data) {
        return mapDbGameToGame(response.data);
      } else {
        console.warn(`Game with slug "${slug}" not found or error: ${response.error}`);
        // setError(response.error || 'Game not found'); // Avoid toast for not found
        return null;
      }
    } catch (err: any) {
      console.error(`Error getting game by slug ${slug}:`, err);
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRelatedGames = useCallback(async (categorySlug: string | undefined, currentGameId: string | number | undefined, limit: number = 5): Promise<Game[]> => {
    // setIsLoading(true); // Potentially skip loading state for related games for smoother UX
    try {
      if (!categorySlug) return [];
      // This is a simplified client-side filter.
      // For production, this should ideally be an API call: gameService.getRelatedGames(categorySlug, currentGameId, limit)
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
    } finally {
      // setIsLoading(false);
    }
  }, [games]);

  const getFavoriteGames = useCallback(async (): Promise<Game[]> => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user || !session) {
        return [];
      }
      const response = await gameService.getFavoriteGames(user.id);
      if (response.success && response.data) {
        return response.data.map(mapDbGameToGame);
      } else {
        setError(response.error || 'Failed to fetch favorite games');
        toast.error(response.error || 'Failed to fetch favorite games');
        return [];
      }
    } catch (err: any) {
      console.error("Error fetching favorite games:", err);
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    if (user && session) {
      getFavoriteGames().then(favoriteGamesFromDb => {
        const favIds = new Set(favoriteGamesFromDb.map(game => game.id as string));
        setFavoriteGameIds(favIds);
        // Update the 'isFavorite' status in the main games list
        setGames(prevGames => prevGames.map(g => ({ ...g, isFavorite: favIds.has(g.id as string) })));
        setFilteredGames(prevFilteredGames => prevFilteredGames.map(g => ({ ...g, isFavorite: favIds.has(g.id as string) })));

      });
    } else {
      setFavoriteGameIds(new Set());
       setGames(prevGames => prevGames.map(g => ({ ...g, isFavorite: false })));
       setFilteredGames(prevFilteredGames => prevFilteredGames.map(g => ({ ...g, isFavorite: false })));
    }
  }, [user, session, getFavoriteGames]);

  const toggleFavoriteGame = useCallback(async (gameId: string): Promise<void> => {
    if (!user || !session) {
      toast.info("Please log in to save favorite games.");
      return;
    }

    const isCurrentlyFavorite = favoriteGameIds.has(gameId);
    // Optimistic update
    const newFavoriteGameIds = new Set(favoriteGameIds);
    if (isCurrentlyFavorite) {
      newFavoriteGameIds.delete(gameId);
    } else {
      newFavoriteGameIds.add(gameId);
    }
    setFavoriteGameIds(newFavoriteGameIds);
    
    // Update game lists optimistically
    const updateFavStatus = (g: Game) => g.id === gameId ? { ...g, isFavorite: !isCurrentlyFavorite } : g;
    setGames(prevGames => prevGames.map(updateFavStatus));
    setFilteredGames(prevFilteredGames => prevFilteredGames.map(updateFavStatus));


    try {
      const response = await gameService.toggleFavoriteGame(user.id, gameId, !isCurrentlyFavorite);
      if (response.success) {
        toast.success(!isCurrentlyFavorite ? "Added to favorites!" : "Removed from favorites!");
        // State already updated optimistically
      } else {
        // Revert optimistic update on failure
        const revertedFavoriteGameIds = new Set(favoriteGameIds);
        if (isCurrentlyFavorite) {
          revertedFavoriteGameIds.add(gameId);
        } else {
          revertedFavoriteGameIds.delete(gameId);
        }
        setFavoriteGameIds(revertedFavoriteGameIds);
        const revertFavStatus = (g: Game) => g.id === gameId ? { ...g, isFavorite: isCurrentlyFavorite } : g;
        setGames(prevGames => prevGames.map(revertFavStatus));
        setFilteredGames(prevFilteredGames => prevFilteredGames.map(revertFavStatus));
        toast.error(response.error || "Failed to update favorite status.");
      }
    } catch (error: any) {
      // Revert optimistic update on error
      const revertedFavoriteGameIds = new Set(favoriteGameIds);
      if (isCurrentlyFavorite) {
        revertedFavoriteGameIds.add(gameId);
      } else {
        revertedFavoriteGameIds.delete(gameId);
      }
      setFavoriteGameIds(revertedFavoriteGameIds);
      const revertFavStatusOnError = (g: Game) => g.id === gameId ? { ...g, isFavorite: isCurrentlyFavorite } : g;
      setGames(prevGames => prevGames.map(revertFavStatusOnError));
      setFilteredGames(prevFilteredGames => prevFilteredGames.map(revertFavStatusOnError));

      console.error("Error toggling favorite game:", error);
      toast.error(error.message || "An unexpected error occurred.");
    }
  }, [favoriteGameIds, user, session, games, filteredGames]);

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
        const newGame = mapDbGameToGame(newDbGame); 
        setGames(prevGames => [...prevGames, newGame]);
        setFilteredGames(prevFilteredGames => [...prevFilteredGames, newGame]); 
        toast.success(`Game "${newGame.title}" added successfully.`);
        return newDbGame;
      }
      return null;
    } catch (err: any)
    {
      console.error("Error adding game:", err);
      const errorMessage = err.message || "Failed to add game.";
      toast.error(errorMessage);
      setError(errorMessage);
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
        const updatedGame = mapDbGameToGame(updatedDbGame); 
        setGames(prevGames => prevGames.map(g => g.id === gameId ? updatedGame : g));
        setFilteredGames(prevFilteredGames => prevFilteredGames.map(g => g.id === gameId ? updatedGame : g));
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
        setFilteredGames(prevFilteredGames => prevFilteredGames.filter(game => game.id !== gameId));
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
      getGameBySlug, // Added
      getRelatedGames, // Added
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
  return useContext(GamesContext);
};
