
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Game, GameProvider, GameCategory, GameLaunchOptions, DbGame } from '@/types/game';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { mapDbGameToGameAdapter } from '@/components/admin/GameAdapter';

// Game service implementation
const gameService = {
  getAllGames: async ({ limit = 100, offset = 0, category, provider, search, featured, popular, latest } = {}): Promise<{ games: Game[], count: number }> => {
    let query = supabase.from('games').select('*, providers:provider_id(*)', { count: 'exact' });

    // Apply filters
    if (category) {
      query = query.contains('category_slugs', [category]);
    }
    
    if (provider) {
      query = query.eq('provider_slug', provider);
    }
    
    if (search && search.trim() !== '') {
      query = query.ilike('game_name', `%${search}%`);
    }
    
    if (featured) {
      query = query.eq('is_featured', true);
    }
    
    if (popular) {
      query = query.eq('is_popular', true);
    }
    
    if (latest) {
      query = query.order('created_at', { ascending: false });
    } else {
      // Default sorting
      query = query.order('views', { ascending: false });
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Map DB games to Game interface
    const mappedGames = (data || []).map((dbGame: any) => {
      const game = mapDbGameToGameAdapter(dbGame as DbGame);
      return game;
    });
    
    return { 
      games: mappedGames,
      count: count || 0
    };
  },
  
  getProviders: async (): Promise<GameProvider[]> => {
    const { data, error } = await supabase.from('providers').select('*');
    
    if (error) throw error;
    
    return (data || []).map((provider: any) => ({
      id: provider.id || '',
      name: provider.name || '',
      slug: provider.name?.toLowerCase().replace(/\s+/g, '-') || '',
      logoUrl: provider.logo || '',
      description: provider.description || '',
      isActive: provider.status === 'active',
      games_count: 0, // This would need a separate query to count games
    }));
  },
  
  getCategories: async (): Promise<GameCategory[]> => {
    const { data, error } = await supabase.from('game_categories').select('*');
    
    if (error) throw error;
    
    return (data || []).map((category: any) => ({
      id: category.id || '',
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      icon: category.icon || '',
      image_url: category.image || '',
      order: category.order || 0,
    }));
  },
  
  getFavoriteGames: async (userId: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from('favorite_games')
      .select('game_id')
      .eq('user_id', userId);
    
    if (error) throw error;
    return (data || []).map(item => item.game_id);
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
      .select('*, providers:provider_id(*)')
      .eq('id', gameId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    return mapDbGameToGameAdapter(data as DbGame);
  },
  
  getGameBySlug: async (slug: string): Promise<Game | null> => {
    const { data, error } = await supabase
      .from('games')
      .select('*, providers:provider_id(*)')
      .eq('slug', slug)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    return mapDbGameToGameAdapter(data as DbGame);
  },
  
  getGamesByProvider: async (providerSlug: string): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*, providers:provider_id(*)')
      .eq('provider_slug', providerSlug);
    
    if (error) throw error;
    
    return (data || []).map((dbGame: any) => mapDbGameToGameAdapter(dbGame as DbGame));
  },
  
  getGamesByCategory: async (categorySlug: string): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*, providers:provider_id(*)')
      .contains('category_slugs', [categorySlug]);
    
    if (error) throw error;
    
    return (data || []).map((dbGame: any) => mapDbGameToGameAdapter(dbGame as DbGame));
  },
  
  getGameLaunchUrl: async (gameId: string, options: GameLaunchOptions): Promise<string | null> => {
    // Implementation depends on game integration
    // Mock implementation
    return `https://demo-games.example.com/play/${gameId}?mode=${options.mode}&lang=${options.language || 'en'}&currency=${options.currency || 'USD'}`;
  },
  
  getFeaturedGames: async (count: number = 8): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*, providers:provider_id(*)')
      .eq('is_featured', true)
      .limit(count);
    
    if (error) throw error;
    
    return (data || []).map((dbGame: any) => mapDbGameToGameAdapter(dbGame as DbGame));
  },
  
  getPopularGames: async (count: number = 8): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*, providers:provider_id(*)')
      .order('views', { ascending: false })
      .limit(count);
    
    if (error) throw error;
    
    return (data || []).map((dbGame: any) => mapDbGameToGameAdapter(dbGame as DbGame));
  },
  
  getLatestGames: async (count: number = 8): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*, providers:provider_id(*)')
      .order('created_at', { ascending: false })
      .limit(count);
    
    if (error) throw error;
    
    return (data || []).map((dbGame: any) => mapDbGameToGameAdapter(dbGame as DbGame));
  }
};

export interface GameLauncherProps {
  game: Game;
  mode?: 'real' | 'demo';
  onClose?: () => void;
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
  getGameById: (id: string | number) => Promise<Game | null>;
  
  getGameLaunchUrl: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  launchGame: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  handlePlayGame: (game: Game, mode: 'real' | 'demo') => void;
  handleGameDetails: (game: Game) => void;
  
  favoriteGames: string[];
  favoriteGameIds: Set<string>;
  toggleFavoriteGame: (gameIdOrSlug: string) => void;
  isFavorite: (gameIdOrSlug: string) => boolean;
  isLoadingFavorites: boolean;

  getFeaturedGames: (count?: number) => Promise<Game[]>;
  getPopularGames: (count?: number) => Promise<Game[]>;
  getLatestGames: (count?: number) => Promise<Game[]>;

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
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: providersData, isLoading: isLoadingProviders, error: providersError } = useQuery<GameProvider[], Error>({
    queryKey: ['allProviders'],
    queryFn: gameService.getProviders,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError } = useQuery<GameCategory[], Error>({
    queryKey: ['allCategories'],
    queryFn: gameService.getCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes
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
  const favoriteGames = favoriteGamesData || [];
  const favoriteGameIds = new Set(favoriteGames);

  const fetchGameById = useCallback(async (id: string | number): Promise<Game | null> => {
    try {
      return await gameService.getGameById(id.toString());
    } catch (error) {
      console.error(`Error fetching game by id ${id}:`, error);
      return null;
    }
  }, []);

  const getGameById = useCallback(async (id: string | number): Promise<Game | null> => {
    try {
      return await gameService.getGameById(id.toString());
    } catch (error) {
      console.error(`Error getting game by id ${id}:`, error);
      return null;
    }
  }, []);

  const getGameBySlug = useCallback(async (slug: string): Promise<Game | null> => {
    try {
      return await gameService.getGameBySlug(slug);
    } catch (error) {
      console.error(`Error getting game by slug ${slug}:`, error);
      return null;
    }
  }, []);

  const fetchGamesByProvider = useCallback(async (providerSlug: string): Promise<Game[]> => {
    try {
      return await gameService.getGamesByProvider(providerSlug);
    } catch (error) {
      console.error(`Error fetching games for provider ${providerSlug}:`, error);
      return [];
    }
  }, []);

  const fetchGamesByCategory = useCallback(async (categorySlug: string): Promise<Game[]> => {
     try {
      return await gameService.getGamesByCategory(categorySlug);
    } catch (error) {
      console.error(`Error fetching games for category ${categorySlug}:`, error);
      return [];
    }
  }, []);

  const getGameLaunchUrl = useCallback(async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    if (!isAuthenticated && !game.demo_url && options.mode === 'real') {
        toast.error("Please log in to play real money games.");
        navigate('/login');
        return null;
    }

    try {
      const launchOptionsWithUser = { ...options, user_id: user?.id, username: user?.email, currency: 'USD' };
      const url = await gameService.getGameLaunchUrl(game.id.toString(), launchOptionsWithUser);
      if (!url) throw new Error("Launch URL not available.");
      return url;
    } catch (error: any) {
      toast.error(`Error launching game: ${error.message}`);
      console.error("Error getting game launch URL:", error);
      return null;
    }
  }, [user, isAuthenticated, navigate]);

  const launchGame = useCallback(async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    return await getGameLaunchUrl(game, options);
  }, [getGameLaunchUrl]);

  const handlePlayGame = useCallback(async (game: Game, mode: 'real' | 'demo') => {
    console.log(`Attempting to play game: ${game.title}, mode: ${mode}`);
    const launchUrl = await getGameLaunchUrl(game, { mode });
    if (launchUrl) {
      navigate(`/casino/play/${game.slug || game.id}`);
    }
  }, [getGameLaunchUrl, navigate]);

  const handleGameDetails = useCallback((game: Game) => {
    navigate(`/casino/game/${game.slug || game.id}`);
  }, [navigate]);

  const toggleFavoriteMutation = useMutation<void, Error, string>({
    mutationFn: async (gameIdOrSlug: string) => {
      if (!user) throw new Error("User not authenticated");
      
      const gameToToggle = games.find(g => g.id === gameIdOrSlug || g.slug === gameIdOrSlug);
      if (!gameToToggle) throw new Error("Game not found");
      
      const currentFavorites = await gameService.getFavoriteGames(user.id);
      const isCurrentlyFavorite = currentFavorites.includes(gameToToggle.id.toString());

      if (isCurrentlyFavorite) {
        await gameService.removeFavoriteGame(user.id, gameToToggle.id.toString());
        toast.success(`${gameToToggle.title} removed from favorites.`);
      } else {
        await gameService.addFavoriteGame(user.id, gameToToggle.id.toString());
        toast.success(`${gameToToggle.title} added to favorites.`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteGames', user?.id] });
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
    const game = games.find(g => g.id === gameIdOrSlug || g.slug === gameIdOrSlug);
    if (!game) return false;
    return favoriteGames.includes(game.id.toString());
  }, [favoriteGames, games]);

  const getFeaturedGames = useCallback(async (count: number = 8): Promise<Game[]> => {
    return await gameService.getFeaturedGames(count);
  }, []);

  const getPopularGames = useCallback(async (count: number = 8): Promise<Game[]> => {
    return await gameService.getPopularGames(count);
  }, []);

  const getLatestGames = useCallback(async (count: number = 8): Promise<Game[]> => {
    return await gameService.getLatestGames(count);
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
