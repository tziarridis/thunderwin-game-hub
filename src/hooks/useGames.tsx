import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { Game, GameProvider, GameCategory, GamesContextType, GameLaunchOptions, DbGame } from '@/types';
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
    // Ensure all fields from DbGame are correctly mapped to Game
    // This is crucial if DbGame and Game have diverged.
    // For now, assuming a direct spread is mostly okay, but might need specifics.
    return {
      ...dbGame,
      id: dbGame.id,
      title: dbGame.title || dbGame.game_name || '', // Ensure title exists
      provider: dbGame.provider_slug, // This might be just slug, UI might expect name
      // category_slugs might be string in DbGame, ensure it's string[] in Game
      category_slugs: typeof dbGame.category_slugs === 'string' 
                      ? dbGame.category_slugs.split(',') 
                      : dbGame.category_slugs || [],
      image: dbGame.image_url || dbGame.cover,
      // Map other fields as necessary
      // Example: ensure boolean fields are booleans
      isPopular: !!dbGame.is_popular,
      isNew: !!dbGame.is_new,
      is_featured: !!dbGame.is_featured,
      show_home: !!dbGame.show_home,
      // Game specific properties that might not be on DbGame
      minBet: undefined, // These should probably come from game details or be on DbGame
      maxBet: undefined,
      jackpot: undefined,
    };
  };

  const fetchGamesAndProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [gamesResponse, providersResponse, categoriesResponse] = await Promise.all([
        gamesDatabaseService.getAllGames({ limit: 500 }), // Fetch more games initially
        gameProviderService.getAllProviders(),
        gameCategoryService.getAllCategories(),
      ]);

      if (gamesResponse.success && gamesResponse.data) {
        const mappedGames = gamesResponse.data.map(mapDbGameToGame);
        setAllGames(mappedGames);
        setFilteredGames(mappedGames); // Initially, all games are filtered games
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
  
  // Fetch favorite games for the user
  // useEffect(() => {
  //   const fetchFavoriteGames = async () => {
  //     if (isAuthenticated && user) {
  //       try {
  //         const { data, error } = await supabase
  //           .from('favorite_games')
  //           .select('game_id')
  //           .eq('user_id', user.id);

  //         if (error) {
  //           console.error("Error fetching favorite games:", error);
  //           toast.error("Failed to load favorite games.");
  //         } else {
  //           const favoriteIds = new Set(data.map(item => item.game_id));
  //           setFavoriteGameIds(favoriteIds);
  //         }
  //       } catch (e: any) {
  //         console.error("Error fetching favorite games:", e);
  //         toast.error(e.message || "Failed to load favorite games.");
  //       }
  //     } else {
  //       setFavoriteGameIds(new Set());
  //     }
  //   };

  //   fetchFavoriteGames();
  // }, [isAuthenticated, user]);

  const filterGames = useCallback((searchTerm: string, categorySlug?: string, providerSlug?: string) => {
    let tempGames = [...allGames];
    const lowerSearchTerm = searchTerm.toLowerCase();

    if (lowerSearchTerm) {
      tempGames = tempGames.filter(game => 
        game.title?.toLowerCase().includes(lowerSearchTerm) || 
        game.provider?.toLowerCase().includes(lowerSearchTerm)
      );
    }
    if (categorySlug) {
      tempGames = tempGames.filter(game => game.category_slugs?.includes(categorySlug));
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
    if (!game.id) { // game.id was game.game_id, changed to game.id
        toast.error("Game ID is missing.");
        return null;
    }

    try {
        const response = await gameAggregatorService.createSession(
            game.id, // Use game.id
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
            const response = await gamesDatabaseService.getGameById(id);
            if (response.success && response.data) {
                return mapDbGameToGame(response.data);
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
    
    const toggleFavoriteGame = async (gameId: string): Promise<void> => {
      // Placeholder implementation
      console.log(`Toggling favorite for game ${gameId}`);
    };

    const incrementGameView = async (gameId: string): Promise<void> => {
      // Placeholder implementation
      console.log(`Incrementing view count for game ${gameId}`);
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
        // Make sure all GamesContextType fields are provided
        loading: isLoading, // alias for isLoading
        favoriteGameIds,
        toggleFavoriteGame: async () => {}, // Placeholder
        incrementGameView: async () => {}, // Placeholder
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
