import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Game, GameProvider, GameCategory, GameLaunchOptions, DbGame, GameTag } from '@/types/game';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { mapDbGameToGameAdapter } from '@/components/admin/GameAdapter';

// Define interface for the gameService getAllGames method
interface GetAllGamesOptions {
  limit?: number;
  offset?: number;
  category?: string;
  provider?: string;
  search?: string;
  featured?: boolean;
  popular?: boolean;
  latest?: boolean;
}

// Game service implementation
const gameService = {
  getAllGames: async (options: GetAllGamesOptions = {}): Promise<{ games: Game[], count: number }> => {
    const { limit = 100, offset = 0, category, provider, search, featured, popular, latest } = options;
    
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
      return mapDbGameToGameAdapter(dbGame);
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
    try {
      const { data, error } = await supabase
        .from('favorite_games')
        .select('game_id')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching favorites:', error);
        throw error;
      }
      
      return (data || []).map(item => item.game_id);
    } catch (err) {
      console.error('Error in getFavoriteGames:', err);
      return [];
    }
  },
  
  addFavoriteGame: async (userId: string, gameId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('favorite_games')
        .insert({ user_id: userId, game_id: gameId });
      
      if (error) {
        console.error('Error adding favorite game:', error);
        throw error;
      }
    } catch (err) {
      console.error('Error in addFavoriteGame:', err);
      throw err;
    }
  },
  
  removeFavoriteGame: async (userId: string, gameId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('favorite_games')
        .delete()
        .eq('user_id', userId)
        .eq('game_id', gameId);
      
      if (error) {
        console.error('Error removing favorite game:', error);
        throw error;
      }
    } catch (err) {
      console.error('Error in removeFavoriteGame:', err);
      throw err;
    }
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
    
    return mapDbGameToGameAdapter(data);
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
    
    return mapDbGameToGameAdapter(data);
  },
  
  getGamesByProvider: async (providerSlug: string): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*, providers:provider_id(*)')
      .eq('provider_slug', providerSlug);
    
    if (error) throw error;
    
    return (data || []).map((dbGame: any) => mapDbGameToGameAdapter(dbGame));
  },
  
  getGamesByCategory: async (categorySlug: string): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*, providers:provider_id(*)')
      .contains('category_slugs', [categorySlug]);
    
    if (error) throw error;
    
    return (data || []).map((dbGame: any) => mapDbGameToGameAdapter(dbGame));
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
    
    return (data || []).map((dbGame: any) => mapDbGameToGameAdapter(dbGame));
  },
  
  getPopularGames: async (count: number = 8): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*, providers:provider_id(*)')
      .order('views', { ascending: false })
      .limit(count);
    
    if (error) throw error;
    
    return (data || []).map((dbGame: any) => mapDbGameToGameAdapter(dbGame));
  },
  
  getLatestGames: async (count: number = 8): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*, providers:provider_id(*)')
      .order('created_at', { ascending: false })
      .limit(count);
    
    if (error) throw error;
    
    return (data || []).map((dbGame: any) => mapDbGameToGameAdapter(dbGame));
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
  
  favoriteGames: string[]; // These are favorite game IDs
  favoriteGameIds: Set<string>;
  toggleFavoriteGame: (gameIdOrSlug: string) => void;
  isFavorite: (gameIdOrSlug: string) => boolean;
  isLoadingFavoriteGameIds: boolean; // Renamed from isLoadingFavorites to avoid conflict

  getFeaturedGames: (count?: number) => Promise<Game[]>;
  getPopularGames: (count?: number) => Promise<Game[]>;
  getLatestGames: (count?: number) => Promise<Game[]>;

  isLoading: boolean; 
  getFavoriteGames: () => Promise<Game[]>; // This fetches full game objects for favorites
  // isLoadingFavorites was duplicated, using isLoadingFavoriteGameIds for the query fetching IDs.
  // The getFavoriteGames function is async and its loading state is managed by the caller (e.g. FavoritesPage)
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export const GamesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const { data: gamesData, isLoading: isLoadingGames, error: gamesError } = useQuery({
    queryKey: ['allGames'],
    queryFn: () => gameService.getAllGames({ limit: 500 }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: providersData, isLoading: isLoadingProviders, error: providersError } = useQuery({
    queryKey: ['allProviders'],
    queryFn: gameService.getProviders,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError } = useQuery({
    queryKey: ['allCategories'],
    queryFn: gameService.getCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Renamed isLoading to isLoadingFavoriteGameIds to avoid duplicate identifier
  const { data: favoriteGamesData, isLoading: isLoadingFavoriteGameIds } = useQuery({
    queryKey: ['favoriteGames', user?.id],
    queryFn: () => user?.id ? gameService.getFavoriteGames(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
    retry: false,
    meta: {
      onError: (error: Error) => { // Corrected onError syntax for Tanstack Query v5
        console.error('Error fetching favoriteGames (IDs):', error);
      }
    }
  });

  const games = gamesData?.games || [];
  const providers = providersData || [];
  const categories = categoriesData || [];
  const favoriteGames = favoriteGamesData || []; // These are favorite game IDs from the query
  const favoriteGameIds = new Set(favoriteGames);

  // Function to fetch favorite games with details
  const getFavoriteGamesWithDetails = useCallback(async (): Promise<Game[]> => {
    if (!user?.id) {
      return [];
    }
    
    try {
      const favoriteIds = await gameService.getFavoriteGames(user.id); // Fetches IDs
      
      if (!favoriteIds.length) {
        return [];
      }
      
      // If we already have all games loaded, filter from local data
      // This check might need refinement: `games` refers to all games, not just favorites.
      // It should be: const detailedFavoriteGames = allGames.filter(game => favoriteIds.includes(String(game.id)));
      const allFetchedGames = queryClient.getQueryData<Game[]>(['allGames', 'details']); // Assuming a query key structure
      if (allFetchedGames && allFetchedGames.length > 0) {
         const filteredGames = allFetchedGames.filter(game => favoriteIds.includes(String(game.id)));
         if (filteredGames.length === favoriteIds.length) return filteredGames;
      }
      
      // Otherwise query specifically for these games
      // Note: Supabase `in` filter usually takes an array of values for a column, not 'game_id' column with 'favoriteIds' array.
      // Assuming 'games' table has an 'id' column that matches 'game_id' in 'favorite_games' table.
      const { data, error } = await supabase
        .from('games')
        .select('*, providers:provider_id(*)')
        .in('id', favoriteIds); // Assuming 'id' is the game's primary key in the 'games' table.
      
      if (error) {
        console.error('Error fetching favorite games details:', error);
        return [];
      }
      
      return (data || []).map((dbGame: any) => mapDbGameToGameAdapter(dbGame));
    } catch (error) {
      console.error('Error in getFavoriteGamesWithDetails:', error);
      return [];
    }
  }, [user, queryClient]);

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
      // Instead of navigating to /casino/play, we might directly open the game or use a game launcher component
      // For now, let's assume it opens in a new tab or a modal, or navigates to a specific play page.
      // navigate(`/casino/play/${game.slug || game.id}`); // This line was causing issues if /casino/play is not set up.
      // Let's use window.open for simplicity or rely on GameCard's own onPlay logic if available
      window.open(launchUrl, '_blank'); // Example: open in new tab
    }
  }, [getGameLaunchUrl]); // removed navigate dependency for now

  const handleGameDetails = useCallback((game: Game) => {
    navigate(`/casino/game/${game.slug || game.id}`);
  }, [navigate]);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (gameIdOrSlug: string) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      let gameId = gameIdOrSlug;
      const gameToToggle = games.find(g => String(g.id) === gameIdOrSlug || g.slug === gameIdOrSlug);
      
      if (gameToToggle) {
        gameId = String(gameToToggle.id);
      } else {
        // If game is not in the main `games` list (e.g., on a details page not part of main list)
        // We might need to fetch game details by slug/ID to get its actual ID if only slug is passed
        // For now, assume gameIdOrSlug is an ID if not found by slug in the list.
        // This part might need more robust handling if gameIdOrSlug can frequently be a slug for a non-listed game.
        console.warn(`Game with ID/Slug "${gameIdOrSlug}" not found in the current game list for toggling favorite. Proceeding with the provided identifier.`);
      }
      
      const currentFavorites = await gameService.getFavoriteGames(user.id);
      const isCurrentlyFavorite = currentFavorites.includes(gameId);

      if (isCurrentlyFavorite) {
        await gameService.removeFavoriteGame(user.id, gameId);
        return { success: true, added: false, gameTitle: gameToToggle?.title || gameId };
      } else {
        await gameService.addFavoriteGame(user.id, gameId);
        return { success: true, added: true, gameTitle: gameToToggle?.title || gameId };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['favoriteGames', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['getFavoriteGamesWithDetails', user?.id] }); // Invalidate detailed favorites query
      if (result.added) {
        toast.success(`${result.gameTitle} added to favorites.`);
      } else {
        toast.success(`${result.gameTitle} removed from favorites.`);
      }
    },
    onError: (error) => {
      toast.error(`Failed to update favorites: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    // Find game by ID or slug from the locally available 'games' list.
    const game = games.find(g => String(g.id) === gameIdOrSlug || g.slug === gameIdOrSlug);
    if (!game) { 
      // If not found in main list, it could be that favoriteGameIds (Set of strings) already contains it directly.
      // This happens if gameIdOrSlug is an ID not present in `games` but is in `favoriteGameIds`.
      return favoriteGameIds.has(gameIdOrSlug);
    }
    return favoriteGameIds.has(String(game.id));
  }, [favoriteGameIds, games]);

  const getFeaturedGames = useCallback(async (count: number = 8): Promise<Game[]> => {
    return await gameService.getFeaturedGames(count);
  }, []);

  const getPopularGames = useCallback(async (count: number = 8): Promise<Game[]> => {
    return await gameService.getPopularGames(count);
  }, []);

  const getLatestGames = useCallback(async (count: number = 8): Promise<Game[]> => {
    return await gameService.getLatestGames(count);
  }, []);
  
  const isLoading = isLoadingGames || isLoadingProviders || isLoadingCategories || (!!user && isLoadingFavoriteGameIds);


  return (
    <GamesContext.Provider value={{
      games, isLoadingGames, gamesError,
      providers, isLoadingProviders, providersError,
      categories, isLoadingCategories, categoriesError,
      fetchGameById, fetchGamesByProvider, fetchGamesByCategory,
      getGameById, getGameBySlug,
      getGameLaunchUrl, launchGame, handlePlayGame, handleGameDetails,
      favoriteGames, // These are IDs
      favoriteGameIds, // This is the Set of IDs
      toggleFavoriteGame, isFavorite, 
      isLoadingFavoriteGameIds, // Pass the renamed loading state for IDs
      getFeaturedGames, getPopularGames, getLatestGames,
      isLoading,
      getFavoriteGames: getFavoriteGamesWithDetails // Provide the function that fetches detailed games
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
