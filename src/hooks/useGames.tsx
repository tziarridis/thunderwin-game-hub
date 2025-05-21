import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Game, GameProvider, GameCategory, GameLaunchOptions, DbGame } from '@/types/game';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { convertAPIGameToUIGame, convertUIGameToDbGame } from '@/utils/gameTypeAdapter';

// Game service implementation
const gameService = {
  getAllGames: async ({ limit = 100 } = {}): Promise<{ games: Game[], count: number }> => {
    const { data, error, count } = await supabase
      .from('games')
      .select('*', { count: 'exact' })
      .limit(limit);
    
    if (error) throw error;
    const convertedGames = data ? data.map(dbGame => convertAPIGameToUIGame(dbGame as DbGame)) : [];
    return { games: convertedGames, count: count || 0 };
  },
  
  getProviders: async (): Promise<GameProvider[]> => {
    const { data, error } = await supabase.from('providers').select('id, name, logo, description, status');
    if (error) throw error;
    
    return data ? data.map(p => ({
      id: String(p.id), 
      slug: p.name ? p.name.toLowerCase().replace(/\s+/g, '-') : String(p.id),
      name: p.name,
      logoUrl: p.logo,
      description: p.description,
      isActive: p.status === 'active',
      status: (p.status === 'active' || p.status === 'inactive' || p.status === 'coming_soon') 
        ? p.status 
        : 'inactive',
    } as GameProvider)) : [];
  },
  
  getCategories: async (): Promise<GameCategory[]> => {
    const { data, error } = await supabase.from('game_categories').select('*');
    if (error) throw error;
    return data as GameCategory[];
  },
  
  getFavoriteGames: async (userId: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from('favorite_games')
      .select('game_id')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data.map(item => String(item.game_id)); // Ensure game_id is string
  },
  
  addFavoriteGame: async (userId: string, gameId: string): Promise<void> => {
    const { error } = await supabase
      .from('favorite_games')
      .insert({ user_id: userId, game_id: gameId });
    
    if (error) throw error;
  },
  
  removeFavoriteGame: async (userId: string, gameId: string): Promise<void> => {
    const { error } = await supabase
      .from('favorite_games')
      .delete()
      .eq('user_id', userId)
      .eq('game_id', gameId);
    
    if (error) throw error;
  },
  
  getGameById: async (gameId: string): Promise<Game | null> => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .maybeSingle();
    
    if (error) {
      if (error.code === 'PGRST116') return null; 
      throw error;
    }
    return data ? convertAPIGameToUIGame(data as DbGame) : null;
  },
  
  getGameBySlug: async (slug: string): Promise<Game | null> => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data ? convertAPIGameToUIGame(data as DbGame) : null;
  },
  
  getGamesByProvider: async (providerSlug: string): Promise<Game[]> => {
    // This query might be tricky if provider_slug isn't directly on 'games' table
    // Or if it needs to join with 'providers' table first
    // For now, assuming 'provider_slug' exists on 'games' or is handled by a DB view/function.
    // If 'provider_slug' is not directly on the 'games' table, this will need adjustment.
    // The current 'games' table schema shows 'provider_id' (uuid) and 'distribution' (varchar, mapped from provider name).
    // It does not show 'provider_slug'.
    // Let's assume we first fetch provider by slug, then games by provider_id.
    
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('provider_slug', providerSlug);
    
    if (error) throw error;
    return data ? data.map(dbGame => convertAPIGameToUIGame(dbGame as DbGame)) : [];
  },
  
  getGamesByCategory: async (categorySlug: string): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .contains('category_slugs', [categorySlug]);
    
    if (error) throw error;
    return data ? data.map(dbGame => convertAPIGameToUIGame(dbGame as DbGame)) : [];
  },
  
  getGameLaunchUrl: async (gameId: string, options: GameLaunchOptions): Promise<string | null> => {
    // Implementation depends on game integration
    // Mock implementation
    return `https://demo-games.example.com/play/${gameId}?mode=${options.mode}&lang=${options.language || 'en'}&currency=${options.currency || 'USD'}`;
  },
  
  getFeaturedGames: async (count: number = 8): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_featured', true)
      .limit(count);
    
    if (error) throw error;
    return data ? data.map(dbGame => convertAPIGameToUIGame(dbGame as DbGame)) : [];
  },
  
  getPopularGames: async (count: number = 8): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('views', { ascending: false }) // Assuming 'views' correlates to popularity
      .limit(count);
    
    if (error) throw error;
    return data ? data.map(dbGame => convertAPIGameToUIGame(dbGame as DbGame)) : [];
  },
  
  getLatestGames: async (count: number = 8): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false }) // Or 'releaseDate' if that's the field
      .limit(count);
    
    if (error) throw error;
    return data ? data.map(dbGame => convertAPIGameToUIGame(dbGame as DbGame)) : [];
  }
};

export interface GameLauncherProps {
  game: Game;
  mode?: 'real' | 'demo';
  onClose?: () => void;
  // These might be part of the context now, check usage
  onPlay?: (game: Game, mode: 'real' | 'demo') => void; 
  onDetails?: (game: Game) => void;
}

interface GamesContextType {
  games: Game[];
  isLoadingGames: boolean;
  gamesError: Error | null;
  providers: GameProvider[];
  isLoadingProviders: boolean;
  providersError: Error | null;
  categories: GameCategory[];
  isLoadingCategories: boolean;
  categoriesError: Error | null;
  
  fetchGamesByProvider: (providerSlug: string) => Promise<Game[]>;
  fetchGamesByCategory: (categorySlug: string) => Promise<Game[]>;
  fetchGameById: (id: string | number) => Promise<Game | null>;
  getGameBySlug: (slug: string) => Promise<Game | null>;
  getGameById: (id: string | number) => Promise<Game | null>; // Duplicate of fetchGameById?
  
  getGameLaunchUrl: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  launchGame: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  handlePlayGame: (game: Game, mode: 'real' | 'demo') => void;
  handleGameDetails: (game: Game) => void;
  
  favoriteGames: string[]; // Array of game IDs/slugs
  favoriteGameIds: Set<string>; // Set of game IDs/slugs for quick lookup
  toggleFavoriteGame: (gameIdOrSlug: string) => void;
  isFavorite: (gameIdOrSlug: string) => boolean;
  isLoadingFavorites: boolean;

  getFeaturedGames: (count?: number) => Promise<Game[]>;
  getPopularGames: (count?: number) => Promise<Game[]>;
  getLatestGames: (count?: number) => Promise<Game[]>;

  // General loading state combining all initial fetches
  isLoading: boolean; 
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export const GamesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const { data: gamesData, isLoading: isLoadingGames, error: gamesError } = useQuery<{ games: Game[], count: number }, Error>({
    queryKey: ['allGames'],
    queryFn: () => gameService.getAllGames({ limit: 500 }),
    staleTime: 1000 * 60 * 5,
  });

  const { data: providersData, isLoading: isLoadingProviders, error: providersError } = useQuery<GameProvider[], Error>({
    queryKey: ['allProviders'],
    queryFn: gameService.getProviders,
    staleTime: 1000 * 60 * 30,
  });

  const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError } = useQuery<GameCategory[], Error>({
    queryKey: ['allCategories'],
    queryFn: gameService.getCategories,
    staleTime: 1000 * 60 * 30,
  });

  const { data: favoriteGamesData, isLoading: isLoadingFavorites } = useQuery<string[], Error>({
    queryKey: ['favoriteGames', user?.id],
    queryFn: () => user ? gameService.getFavoriteGames(user.id) : Promise.resolve([]),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const games = gamesData?.games || [];
  const providers = providersData || [];
  const categories = categoriesData || [];
  const favoriteGames = favoriteGamesData || []; // These are string IDs
  const favoriteGameIds = new Set(favoriteGames);


  const fetchGameById = useCallback(async (id: string | number): Promise<Game | null> => {
    return gameService.getGameById(String(id));
  }, []);

  // getGameById seems redundant if fetchGameById exists and does the same. Consolidate if identical.
  // For now, keeping both as per existing structure, but pointing gameService.getGameById
  const getGameById = useCallback(async (id: string | number): Promise<Game | null> => {
    return gameService.getGameById(String(id));
  }, []);

  const getGameBySlug = useCallback(async (slug: string): Promise<Game | null> => {
    return gameService.getGameBySlug(slug);
  }, []);

  const fetchGamesByProvider = useCallback(async (providerSlug: string): Promise<Game[]> => {
    return gameService.getGamesByProvider(providerSlug);
  }, []);

  const fetchGamesByCategory = useCallback(async (categorySlug: string): Promise<Game[]> => {
     return gameService.getGamesByCategory(categorySlug);
  }, []);

  const getGameLaunchUrl = useCallback(async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    if (!isAuthenticated && options.mode === 'real' && !game.demo_url /* check if game allows demo without login */) {
        toast.error("Please log in to play real money games.");
        navigate('/login');
        return null;
    }

    try {
      const launchOptionsWithUser = { ...options, user_id: user?.id, username: user?.email?.split('@')[0], currency: 'USD' }; // TODO: get currency from wallet
      // Use game.id for launching, ensure it's the correct ID for the provider (often game.game_id or external_id)
      const gameIdForLaunch = game.game_id || String(game.id);
      const url = await gameService.getGameLaunchUrl(gameIdForLaunch, launchOptionsWithUser);
      if (!url) throw new Error("Launch URL not available.");
      return url;
    } catch (error: any) {
      toast.error(`Error launching game: ${error.message}`);
      console.error("Error getting game launch URL:", error);
      return null;
    }
  }, [user, isAuthenticated, navigate]);

  const launchGame = useCallback(async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    return getGameLaunchUrl(game, options);
  }, [getGameLaunchUrl]);

  const handlePlayGame = useCallback(async (game: Game, mode: 'real' | 'demo') => {
    console.log(`Attempting to play game: ${game.title}, mode: ${mode}`);
    const launchUrl = await getGameLaunchUrl(game, { mode });
    if (launchUrl) {
      // Decide navigation target: could be a dedicated play page or opening in new tab
      // For now, navigate to a play page that might embed the game or redirect
      // Ensure game.slug or game.id is valid for URL
      const gameSlugForUrl = game.slug || String(game.id);
      navigate(`/casino/play/${gameSlugForUrl}`); // Assumes a route like /casino/play/:slug exists
    }
  }, [getGameLaunchUrl, navigate]);

  const handleGameDetails = useCallback((game: Game) => {
    const gameSlugForUrl = game.slug || String(game.id);
    navigate(`/casino/game/${gameSlugForUrl}`);
  }, [navigate]);

  const toggleFavoriteMutation = useMutation<void, Error, string>({
    mutationFn: async (gameIdOrSlug: string) => {
      if (!user) throw new Error("User not authenticated");
      
      const gameToToggle = games.find(g => String(g.id) === gameIdOrSlug || g.slug === gameIdOrSlug);
      if (!gameToToggle) throw new Error("Game not found to toggle favorite status.");
      
      const gameId = String(gameToToggle.id); // Use the actual ID for DB operations

      // No need to fetch currentFavorites again, favoriteGameIds set is the source of truth
      const isCurrentlyFavorite = favoriteGameIds.has(gameId);

      if (isCurrentlyFavorite) {
        await gameService.removeFavoriteGame(user.id, gameId);
        toast.success(`${gameToToggle.title} removed from favorites.`);
      } else {
        await gameService.addFavoriteGame(user.id, gameId);
        toast.success(`${gameToToggle.title} added to favorites.`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteGames', user?.id] });
      // Optionally, can optimistically update UI here
    },
    onError: (error) => {
      toast.error(`Failed to update favorites: ${error.message}`);
    }
  });

  const toggleFavoriteGame = useCallback((gameIdOrSlug: string) => {
    if (!isAuthenticated || !user) {
      toast.info("Please log in to manage your favorites.");
      navigate('/login');
      return;
    }
    toggleFavoriteMutation.mutate(gameIdOrSlug);
  }, [isAuthenticated, user, navigate, toggleFavoriteMutation]);

  const isFavorite = useCallback((gameIdOrSlug: string): boolean => {
    const game = games.find(g => String(g.id) === gameIdOrSlug || g.slug === gameIdOrSlug);
    if (!game) return false;
    return favoriteGameIds.has(String(game.id));
  }, [favoriteGameIds, games]);

  const getFeaturedGames = useCallback(async (count: number = 8): Promise<Game[]> => {
    return gameService.getFeaturedGames(count);
  }, []);

  const getPopularGames = useCallback(async (count: number = 8): Promise<Game[]> => {
    return gameService.getPopularGames(count);
  }, []);

  const getLatestGames = useCallback(async (count: number = 8): Promise<Game[]> => {
    return gameService.getLatestGames(count);
  }, []);
  
  const isLoading = isLoadingGames || isLoadingProviders || isLoadingCategories || (!!user && isLoadingFavorites);

  return (
    <GamesContext.Provider value={{
      games, isLoadingGames, gamesError,
      providers, isLoadingProviders, providersError,
      categories, isLoadingCategories, categoriesError,
      fetchGameById, fetchGamesByProvider, fetchGamesByCategory,
      getGameById, getGameBySlug,
      getGameLaunchUrl, launchGame, handlePlayGame, handleGameDetails,
      favoriteGames, favoriteGameIds, toggleFavoriteGame, isFavorite, isLoadingFavorites,
      getFeaturedGames, getPopularGames, getLatestGames,
      isLoading
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
