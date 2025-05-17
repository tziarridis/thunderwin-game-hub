import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { Game, GameProvider, GameCategory, GamesContextType, GameLaunchOptions } from '@/types'; // Will use consolidated types
import { gamesDatabaseService } from '@/services/gamesDatabaseService';
import { gameAggregatorService } from '@/services/gameAggregatorService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export const GamesProvider = ({ children }: { children: ReactNode }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [favoriteGameIds, setFavoriteGameIds] = useState<Set<string>>(new Set());


  const fetchGamesAndProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [gamesData, providersData, categoriesData] = await Promise.all([
        gamesDatabaseService.getAllGames(),
        gamesDatabaseService.getGameProviders(),
        gamesDatabaseService.getGameCategories(),
      ]);
      
      // Ensure gamesData is an array before setting
      const validGamesData = Array.isArray(gamesData) ? gamesData : [];
      setGames(validGamesData);
      setFilteredGames(validGamesData);

      const validProvidersData = Array.isArray(providersData) ? providersData : [];
      setProviders(validProvidersData);
      
      const validCategoriesData = Array.isArray(categoriesData) ? categoriesData : [];
      setCategories(validCategoriesData);

      if (user?.id) { // user.id should be the ID for fetching favorites
        const favGames = await gamesDatabaseService.getFavoriteGames(user.id);
        setFavoriteGameIds(new Set(favGames.map(g => g.id)));
      }

    } catch (err: any) {
      setError(err.message || 'Failed to fetch game data');
      toast.error(err.message || 'Failed to load game data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchGamesAndProviders();
  }, [fetchGamesAndProviders]);

  const filterGames = useCallback((searchTerm: string, categorySlug?: string, providerSlug?: string) => {
    let tempGames = [...games];
    if (categorySlug) {
      // Ensure game.category_slugs exists and is an array
      tempGames = tempGames.filter(game => Array.isArray(game.category_slugs) && game.category_slugs.includes(categorySlug));
    }
    if (providerSlug) {
      // Ensure game.provider_slug exists
      tempGames = tempGames.filter(game => game.provider_slug === providerSlug);
    }
    if (searchTerm) {
      tempGames = tempGames.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredGames(tempGames);
  }, [games]);

  const launchGame = async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    if (!user && options.mode === 'real') {
        toast.error("Please log in to play for real money.");
        return null;
    }
    setIsLoading(true);
    try {
        // game.game_id is the external game identifier for aggregator
        const gameIdForAggregator = game.game_id || game.gameCode || game.id; // Fallback if game_id is not present
        const launchData = {
            gameId: gameIdForAggregator,
            playerId: options.mode === 'demo' ? 'demo_player' : user?.id || 'unknown_player', // user.id should be player's ID
            currency: options.currency || user?.currency || "EUR",
            platform: options.platform || "web",
            returnUrl: options.returnUrl || window.location.href,
            language: options.language || "en",
        };

        if (!launchData.gameId) {
            toast.error("Game identifier is missing. Cannot launch game.");
            return null;
        }

        const gameUrlResponse = await gameAggregatorService.createSession(
            launchData.gameId, 
            launchData.playerId, 
            launchData.currency, 
            launchData.platform as 'web' | 'mobile',
        );

        if (gameUrlResponse.success && gameUrlResponse.gameUrl) {
            window.open(gameUrlResponse.gameUrl, '_blank');
            toast.success(`Launching ${game.title}`);
            return gameUrlResponse.gameUrl;
        } else {
            toast.error(gameUrlResponse.errorMessage || `Failed to launch ${game.title}`);
            return null;
        }
    } catch (err: any) {
        setError(err.message);
        toast.error(err.message || 'Game launch failed.');
        return null;
    } finally {
        setIsLoading(false);
    }
  };
  const getGameById = async (id: string): Promise<Game | null> => {
    setIsLoading(true);
    try {
      const game = await gamesDatabaseService.getGameById(id);
      return game;
    } catch (err: any) {
      setError(err.message || `Failed to fetch game ${id}`);
      toast.error(err.message || `Failed to load game ${id}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavoriteGame = async (gameId: string) => {
    if (!user?.id) { // user.id should be the ID for managing favorites
      toast.error("Please log in to manage favorites.");
      return;
    }
    setIsLoading(true);
    try {
      const isCurrentlyFavorite = favoriteGameIds.has(gameId);
      // gamesDatabaseService.toggleFavorite expects the user's ID (from your 'users' table if that's what it uses)
      const success = await gamesDatabaseService.toggleFavorite(gameId, user.id, isCurrentlyFavorite);
      if (success) {
        setFavoriteGameIds(prev => {
          const newFavs = new Set(prev);
          if (isCurrentlyFavorite) {
            newFavs.delete(gameId);
          } else {
            newFavs.add(gameId);
          }
          return newFavs;
        });
        toast.success(isCurrentlyFavorite ? "Removed from favorites" : "Added to favorites");
      } else {
        toast.error("Failed to update favorites");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update favorites");
      toast.error(err.message || "Failed to update favorites");
    } finally {
      setIsLoading(false);
    }
  };

  const incrementGameView = async (gameId: string) => {
    try {
      await gamesDatabaseService.incrementGameView(gameId);
    } catch (err: any)
    {
      console.error("Failed to increment game view:", err);
      // Optionally toast an error if this is user-facing critical
    }
  };

  const contextValue: GamesContextType = { 
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
    toggleFavoriteGame,
    favoriteGameIds,
    incrementGameView
  };

  return (
    <GamesContext.Provider value={contextValue}>
      {children}
    </GamesContext.Provider>
  );
};

export const useGames = (): GamesContextType => {
  const context = useContext(GamesContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GamesProvider');
  }
  return context;
};
