import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useQuery, useQueryClient, useMutation, QueryKey } from '@tanstack/react-query';
import { Game, GameProvider, GameCategory, GameLaunchOptions, DbGame } from '@/types/game';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { convertAPIGameToUIGame, convertUIGameToDbGame } from '@/utils/gameTypeAdapter';

// Game service implementation
const gameService = {
  getAllGames: async ({ limit = 100, offset = 0 } = {}): Promise<{ games: Game[], count: number }> => {
    const { data, error, count } = await supabase
      .from('games')
      .select('*', { count: 'exact' })
      .limit(limit)
      .range(offset, offset + limit -1); // Added range for pagination
    
    if (error) throw error;
    const convertedGames = data ? data.map(dbGame => convertAPIGameToUIGame(dbGame as unknown as DbGame)) : [];
    return { games: convertedGames, count: count || 0 };
  },
  
  getProviders: async (): Promise<GameProvider[]> => {
    const { data, error } = await supabase.from('providers').select('id, name, logo, description, status');
    if (error) throw error;
    
    return data ? data.map(p => ({
      id: String(p.id), 
      slug: p.name ? p.name.toLowerCase().replace(/\s+/g, '-') : String(p.id), // ensure slug is created
      name: p.name,
      logoUrl: p.logo, // ensure this matches GameProvider type
      description: p.description,
      isActive: p.status === 'active', // ensure this matches GameProvider type
      status: (p.status === 'active' || p.status === 'inactive' || p.status === 'coming_soon') 
        ? p.status 
        : 'inactive',
    } as GameProvider)) : [];
  },
  
  getCategories: async (): Promise<GameCategory[]> => {
    const { data, error } = await supabase.from('game_categories').select('*');
    if (error) throw error;
    // Ensure the fetched data conforms to GameCategory, especially id, name, slug
    return data ? data.map(c => ({
        ...c,
        id: String(c.id), // Ensure id is string if type expects it
        slug: c.slug || (c.name ? c.name.toLowerCase().replace(/\s+/g, '-') : String(c.id)), // Ensure slug exists
    })) as GameCategory[] : [];
  },
  
  getFavoriteGames: async (userId: string): Promise<string[]> => {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('favorite_games')
      .select('game_id')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data.map(item => String(item.game_id));
  },
  
  addFavoriteGame: async (userId: string, gameId: string): Promise<void> => {
    const { error } = await supabase
      .from('favorite_games')
      .insert({ user_id: userId, game_id: gameId }); // game_id in DB is character varying
    
    if (error) throw error;
  },
  
  removeFavoriteGame: async (userId: string, gameId: string): Promise<void> => {
    const { error } = await supabase
      .from('favorite_games')
      .delete()
      .eq('user_id', userId)
      .eq('game_id', gameId); // game_id in DB is character varying
    
    if (error) throw error;
  },
  
  getGameById: async (gameId: string): Promise<Game | null> => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId) // Assuming gameId is UUID for 'id' column
      .maybeSingle();
    
    if (error) {
      if (error.code === 'PGRST116') return null; 
      throw error;
    }
    return data ? convertAPIGameToUIGame(data as unknown as DbGame) : null;
  },
  
  getGameBySlug: async (slug: string): Promise<Game | null> => {
    // The 'games' table does not have a 'slug' column based on provided schema.
    // This query would need adjustment if 'slug' is not on the table.
    // For now, proceeding as if DbGame might have it or adapter handles its absence.
    // If this is a common lookup, a 'slug' column should be added to 'games' table.
    // Alternative: search by game_name (slugified) or game_id if slug is not a direct column.
    const { data, error } = await supabase
      .from('games')
      .select('*')
      // .eq('slug', slug) // This will fail if 'slug' column doesn't exist
      // Temporarily, let's assume we are looking up by game_id if slug is not available
      // This is a placeholder, proper slug handling/lookup is needed.
      .eq('game_id', slug) // Assuming slug might be a game_id in some contexts
      .maybeSingle();
    
    if (error) {
      if (error.code === 'PGRST116') return null; 
      throw error;
    }
    return data ? convertAPIGameToUIGame(data as unknown as DbGame) : null;
  },
  
  getGamesByProvider: async (providerSlug: string): Promise<Game[]> => {
    // 'games' table has 'provider_id' (UUID) and 'distribution' (provider name).
    // It does not have 'provider_slug'.
    // Step 1: Find provider_id from providerSlug (if providerSlug is a slug of provider name)
    // This requires an additional query to 'providers' table.
    // For simplicity, if 'provider_slug' is reliably in DbGame through some other means (view/join),
    // then direct query could work. Given the adapter logic, it seems DbGame sometimes has it.
    // If not, this query needs a refactor to first get provider_id.
    
    // Assuming 'provider_slug' might be present due to a view or function
    // OR that `distribution` (provider name) can be slugified and compared.
    // This is a simplified approach:
    const { data: providersData, error: providersError } = await supabase
      .from('providers')
      .select('id, name')
      .ilike('name', `%${providerSlug.replace(/-/g, ' ')}%`); // Approximate match

    if (providersError || !providersData || providersData.length === 0) {
      // Try to find by slug directly on games table if that's an intended path
      const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('provider_slug', providerSlug); // if provider_slug exists on games
       if (error) throw error;
       return data ? data.map(dbGame => convertAPIGameToUIGame(dbGame as unknown as DbGame)) : [];
    }
    
    const providerIds = providersData.map(p => p.id);
    if (providerIds.length === 0) return [];

    const { data, error } = await supabase
      .from('games')
      .select('*')
      .in('provider_id', providerIds);
    
    if (error) throw error;
    return data ? data.map(dbGame => convertAPIGameToUIGame(dbGame as unknown as DbGame)) : [];
  },
  
  getGamesByCategory: async (categorySlug: string): Promise<Game[]> => {
    // 'games' table has 'game_type'. It does not have 'category_slugs' array.
    // Adapter derives category_slugs from game_type if not present.
    // So, we should query based on game_type.
    const { data, error } = await supabase
      .from('games')
      .select('*')
      // Assuming categorySlug can be matched against game_type (perhaps after slugifying game_type)
      // Or, if category_slugs array *is* actually on DbGame via a view/function:
      // .contains('category_slugs', [categorySlug]); 
      // For now, let's assume game_type is the target:
      .eq('game_type', categorySlug); // This assumes categorySlug is the raw game_type string
                                       // Or that game_type values are already slugs.
    
    if (error) throw error;
    return data ? data.map(dbGame => convertAPIGameToUIGame(dbGame as unknown as DbGame)) : [];
  },
  
  getGameLaunchUrl: async (gameId: string, options: GameLaunchOptions): Promise<string | null> => {
    // Mock implementation, replace with actual API call to game provider or internal service
    // The gameId here might be the internal UUID or the provider's game_id. Clarify which one.
    // Assuming it's our internal UUID, we might need to fetch the game's provider_game_id first.
    console.log(`Requesting launch URL for game ${gameId} with options:`, options);
    // Example: needs to call an edge function or a provider's API
    // return `https://api.example.com/launch?game_id=${gameId}&token=${options.token}&mode=${options.mode}`;
    
    // For now, returning a placeholder. In a real scenario, this would involve API calls.
    // Let's find the game to get its game_id (external)
    const game = await gameService.getGameById(gameId);
    if (!game || !game.game_id) {
      toast.error("Game not found or missing external game ID.");
      return null;
    }

    return `/api/game-launch?gameId=${game.game_id}&mode=${options.mode}&lang=${options.language || 'en'}&currency=${options.currency || 'USD'}`;
  },
  
  getFeaturedGames: async (count: number = 8): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_featured', true)
      .limit(count);
    
    if (error) throw error;
    return data ? data.map(dbGame => convertAPIGameToUIGame(dbGame as unknown as DbGame)) : [];
  },
  
  getPopularGames: async (count: number = 8): Promise<Game[]> => {
    // Assuming 'is_popular' field exists, or sort by 'views'
    // The 'games' table schema doesn't list 'is_popular'. Adapter sets Game.isPopular based on DbGame.is_popular
    // Let's assume DbGame has is_popular field.
    const { data, error } = await supabase
      .from('games')
      .select('*')
      // .eq('is_popular', true) // If 'is_popular' field exists in DB
      .order('views', { ascending: false }) // Alternative for popular: sort by views
      .limit(count);
    
    if (error) throw error;
    return data ? data.map(dbGame => convertAPIGameToUIGame(dbGame as unknown as DbGame)) : [];
  },
  
  getNewGames: async (count: number = 8): Promise<Game[]> => {
    // Assuming 'is_new' field exists or sort by 'created_at'
    // DbGame is expected to have is_new by the adapter
    const { data, error } = await supabase
      .from('games')
      .select('*')
      // .eq('is_new', true) // If 'is_new' field exists in DB
      .order('created_at', { ascending: false }) // Alternative for new: sort by creation date
      .limit(count);
      
    if (error) throw error;
    return data ? data.map(dbGame => convertAPIGameToUIGame(dbGame as unknown as DbGame)) : [];
  },

  searchGames: async (searchTerm: string, limit: number = 20): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .or(`game_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,game_id.ilike.%${searchTerm}%`)
      // .contains('tags', [searchTerm]) // If tags is an array and we want exact match
      .limit(limit);

    if (error) throw error;
    return data ? data.map(dbGame => convertAPIGameToUIGame(dbGame as unknown as DbGame)) : [];
  },
};

interface GameContextType {
  games: Game[];
  providers: GameProvider[];
  categories: GameCategory[];
  favoriteGameIds: string[];
  isLoadingGames: boolean;
  isLoadingProviders: boolean;
  isLoadingCategories: boolean;
  isLoadingFavorites: boolean;
  errorGames: Error | null;
  errorProviders: Error | null;
  errorCategories: Error | null;
  errorFavorites: Error | null;
  
  fetchGames: (options?: { limit?: number; offset?: number; }) => Promise<void>;
  getGameById: (id: string) => Promise<Game | null>;
  getGameBySlug: (slug: string) => Promise<Game | null>;
  getGamesByProvider: (providerSlug: string) => Promise<Game[]>;
  getGamesByCategory: (categorySlug: string) => Promise<Game[]>;
  getFeaturedGames: (count?: number) => Promise<Game[]>;
  getPopularGames: (count?: number) => Promise<Game[]>;
  getNewGames: (count?: number) => Promise<Game[]>;
  searchGames: (searchTerm: string, limit?: number) => Promise<Game[]>;

  addFavoriteGame: (gameId: string) => void;
  removeFavoriteGame: (gameId: string) => void;
  isFavorite: (gameId: string) => boolean;
  
  handlePlayGame: (game: Game, mode: 'real' | 'demo') => void;
  handleGameDetails: (game: Game) => void;
  
  // Admin specific functions - might be better in a separate admin context/hook
  createGame?: (gameData: Partial<Game>) => Promise<Game | null>;
  updateGame?: (gameId: string, gameData: Partial<Game>) => Promise<Game | null>;
  deleteGame?: (gameId: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GamesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [games, setGames] = useState<Game[]>([]);
  
  const { data: providers = [], isLoading: isLoadingProviders, error: errorProviders } = useQuery<GameProvider[], Error>({
    queryKey: ['gameProviders'],
    queryFn: gameService.getProviders,
  });

  const { data: categories = [], isLoading: isLoadingCategories, error: errorCategories } = useQuery<GameCategory[], Error>({
    queryKey: ['gameCategories'],
    queryFn: gameService.getCategories,
  });

  const { data: favoriteGameIds = [], isLoading: isLoadingFavorites, error: errorFavorites, refetch: refetchFavorites } = useQuery<string[], Error>({
    queryKey: ['favoriteGames', user?.id],
    queryFn: () => user ? gameService.getFavoriteGames(user.id) : Promise.resolve([]),
    enabled: !!user,
  });
  
  // For all games list with pagination state
  const [allGamesQueryOptions, setAllGamesQueryOptions] = useState({ limit: 100, offset: 0 });
  const { data: allGamesData, isLoading: isLoadingGames, error: errorGames, refetch: fetchGamesManual } = useQuery<{ games: Game[], count: number }, Error>({
    queryKey: ['allGames', allGamesQueryOptions],
    queryFn: () => gameService.getAllGames(allGamesQueryOptions),
    // keepPreviousData: true, // Optional: for smoother pagination
  });

  useEffect(() => {
    if (allGamesData) {
      setGames(allGamesData.games);
    }
  }, [allGamesData]);

  const fetchGames = useCallback(async (options: { limit?: number; offset?: number; } = {}) => {
    const queryOpts = { ...allGamesQueryOptions, ...options };
    setAllGamesQueryOptions(queryOpts); // This will trigger useQuery to refetch if queryKey changes
                                        // or call fetchGamesManual if you want to force it with same key
    await fetchGamesManual();
  }, [allGamesQueryOptions, fetchGamesManual]);


  const addFavoriteMutation = useMutation<void, Error, string>(
    (gameId: string) => {
      if (!user) throw new Error("User not authenticated");
      return gameService.addFavoriteGame(user.id, gameId);
    },
    {
      onSuccess: () => {
        toast.success("Game added to favorites!");
        queryClient.invalidateQueries({ queryKey: ['favoriteGames', user?.id] });
      },
      onError: (error) => {
        toast.error(`Failed to add favorite: ${error.message}`);
      },
    }
  );

  const removeFavoriteMutation = useMutation<void, Error, string>(
    (gameId: string) => {
      if (!user) throw new Error("User not authenticated");
      return gameService.removeFavoriteGame(user.id, gameId);
    },
    {
      onSuccess: () => {
        toast.success("Game removed from favorites!");
        queryClient.invalidateQueries({ queryKey: ['favoriteGames', user?.id] });
      },
      onError: (error) => {
        toast.error(`Failed to remove favorite: ${error.message}`);
      },
    }
  );

  const handlePlayGame = useCallback(async (game: Game, mode: 'real' | 'demo') => {
    if (!isAuthenticated && mode === 'real') {
      toast.info("Please log in to play for real money.");
      navigate('/login');
      return;
    }
    
    // Placeholder: In a real app, you'd get a session token, etc.
    const launchOptions: GameLaunchOptions = {
      mode,
      // language: user?.language || 'en', // If user has language preference
      // currency: user?.currency || 'USD', // If user has currency preference
      // token: user?.sessionToken // If a session token is needed
    };

    try {
      const launchUrl = await gameService.getGameLaunchUrl(game.id, launchOptions); // Use game.id (UUID)
      if (launchUrl) {
        // For external URLs, window.open(launchUrl, '_blank') is common
        // For internal game routes:
        navigate(`/play/${game.slug || game.id}?mode=${mode}`); // Or navigate to launchUrl if it's internal
        // If launchUrl is a full URL to an external provider:
        // window.open(launchUrl, '_blank');
      } else {
        toast.error("Could not launch game. Please try again later.");
      }
    } catch (error: any) {
      toast.error(`Error launching game: ${error.message}`);
    }
  }, [isAuthenticated, navigate, user]);

  const handleGameDetails = useCallback((game: Game) => {
    navigate(`/casino/games/${game.slug || game.id}`);
  }, [navigate]);

  const isFavorite = useCallback((gameId: string) => {
    return favoriteGameIds?.includes(gameId) || false;
  }, [favoriteGameIds]);

  const contextValue: GameContextType = {
    games: games, // Paginated/filtered games
    providers,
    categories,
    favoriteGameIds,
    isLoadingGames,
    isLoadingProviders,
    isLoadingCategories,
    isLoadingFavorites,
    errorGames,
    errorProviders,
    errorCategories,
    errorFavorites,
    
    fetchGames,
    getGameById: gameService.getGameById,
    getGameBySlug: gameService.getGameBySlug,
    getGamesByProvider: gameService.getGamesByProvider,
    getGamesByCategory: gameService.getGamesByCategory,
    getFeaturedGames: gameService.getFeaturedGames,
    getPopularGames: gameService.getPopularGames,
    getNewGames: gameService.getNewGames,
    searchGames: gameService.searchGames,

    addFavoriteGame: (gameId) => addFavoriteMutation.mutate(gameId),
    removeFavoriteGame: (gameId) => removeFavoriteMutation.mutate(gameId),
    isFavorite,
    
    handlePlayGame,
    handleGameDetails,
  };

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

export const useGames = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GamesProvider');
  }
  return context;
};
