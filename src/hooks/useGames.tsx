
import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { Game, GameProvider } from '@/types';
import { GameLaunchOptions, GameCategory } from '@/types/additional';
import { gamesDatabaseService } from '@/services/gamesDatabaseService';
import { gameAggregatorService } from '@/services/gameAggregatorService'; // Assuming this exists
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface GamesContextType {
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
        gamesDatabaseService.getAllGames(), // Changed from getGames
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
      // This filtering logic might need refinement based on how categories are linked to games
      // For now, assuming Game type has a category_slugs: string[] or similar
      tempGames = tempGames.filter(game => game.category_slugs?.includes(categorySlug));
    }
    if (providerSlug) {
      // Assuming Game type has a provider_slug: string
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
        const launchData = {
            gameId: game.id,
            playerId: options.mode === 'demo' ? 'demo_player' : user?.id || 'unknown_player',
            currency: options.currency || user?.currency || "EUR",
            platform: options.platform || "web",
            returnUrl: options.returnUrl || window.location.href,
            language: options.language || "en",
            // ... any other options from GameLaunchOptions or game specific data
        };
        const gameUrl = await gameAggregatorService.createSession(
            launchData.gameId, 
            launchData.playerId, 
            launchData.currency, 
            launchData.platform as 'web' | 'mobile', // Cast as gameAggregatorService expects this
            // Ensure all required parameters for createSession are passed
        );

        if (gameUrl && gameUrl.gameUrl) {
             // If in demo mode or for specific providers, open in new tab
            // For real mode, sometimes it's better to launch in an iframe or redirect
            // This logic can be customized
            window.open(gameUrl.gameUrl, '_blank');
            toast.success(`Launching ${game.title}`);
            return gameUrl.gameUrl;
        } else {
            toast.error(gameUrl.errorMessage || `Failed to launch ${game.title}`);
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
    return gamesDatabaseService.getGameById(id);
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
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update favorites");
    } finally {
      setIsLoading(false);
    }
  };

  const incrementGameView = async (gameId: string) => {
    try {
      await gamesDatabaseService.incrementGameView(gameId);
    } catch (err: any) {
      // Silently fail or log, user doesn't need a toast for this
      console.error("Failed to increment game view:", err);
    }
  };


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
        toggleFavoriteGame,
        favoriteGameIds,
        incrementGameView
    }}>
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

