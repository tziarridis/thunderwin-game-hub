import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
// Use types from index.d.ts as the single source of truth
import { Game, GameProvider, GameCategory as GameCategoryType, GamesContextType as IGamesContextType } from '@/types'; 
import { GameLaunchOptions } from '@/types/additional'; // Keep this for specific launch options if different
import { gamesDatabaseService } from '@/services/gamesDatabaseService';
import { gameAggregatorService } from '@/services/gameAggregatorService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// This local GamesContextType should ideally be removed or be identical to the one in index.d.ts
// For now, we will ensure this provider implements IGamesContextType from index.d.ts
/*
export interface GamesContextType { // This is now defined in index.d.ts
  games: Game[];
  filteredGames: Game[];
  providers: GameProvider[];
  categories: GameCategory[];
  isLoading: boolean;
  error: string | null;
  fetchGamesAndProviders: () => Promise<void>;
  filterGames: (searchTerm: string, categorySlug?: string, providerSlug?: string) => void;
  launchGame: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  getGameById: (id: string) => Promise<Game | null>;
  toggleFavoriteGame: (gameId: string) => Promise<void>;
  favoriteGameIds: Set<string>;
  incrementGameView: (gameId: string) => Promise<void>;
}
*/

const GamesContext = createContext<IGamesContextType | undefined>(undefined);

export const GamesProvider = ({ children }: { children: ReactNode }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [categories, setCategories] = useState<GameCategoryType[]>([]); // Use GameCategoryType
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
      setGames(gamesData);
      setFilteredGames(gamesData);
      setProviders(providersData);
      setCategories(categoriesData);

      if (user?.id) {
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
      // Game.category_slugs should now exist due to type update in index.d.ts
      tempGames = tempGames.filter(game => game.category_slugs?.includes(categorySlug));
    }
    if (providerSlug) {
      // Game.provider_slug should now exist
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
    setIsLoading(true); // This property should now be recognized by IGamesContextType
    try {
        const launchData = {
            gameId: game.id, // game.id should be fine
            playerId: options.mode === 'demo' ? 'demo_player' : user?.id || 'unknown_player',
            currency: options.currency || user?.currency || "EUR",
            platform: options.platform || "web",
            returnUrl: options.returnUrl || window.location.href,
            language: options.language || "en",
        };
        const gameUrlResponse = await gameAggregatorService.createSession(
            launchData.gameId, 
            launchData.playerId, 
            launchData.currency, 
            launchData.platform as 'web' | 'mobile',
        );

        // Assuming createSession returns { gameUrl?: string, errorMessage?: string, success: boolean }
        if (gameUrlResponse.success && gameUrlResponse.gameUrl) {
            window.open(gameUrlResponse.gameUrl, '_blank');
            toast.success(`Launching ${game.title}`);
            return gameUrlResponse.gameUrl;
        } else {
            toast.error(gameUrlResponse.errorMessage || `Failed to launch ${game.title}`);
            return null;
        }
    } catch (err: any) {
        setError(err.message); // This property should now be recognized
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
    if (!user?.id) {
      toast.error("Please log in to manage favorites.");
      return;
    }
    setIsLoading(true);
    try {
      const isCurrentlyFavorite = favoriteGameIds.has(gameId);
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
    }
  };

  // Ensure the context value matches IGamesContextType from index.d.ts
  const contextValue: IGamesContextType = { 
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

export const useGames = (): IGamesContextType => {
  const context = useContext(GamesContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GamesProvider');
  }
  return context;
};
