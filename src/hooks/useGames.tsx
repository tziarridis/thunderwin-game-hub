import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameService, ProviderFilters, CategoryFilters, GameFilters } from '@/services/gameService';
import { Game, GameProvider, GameCategory, GameLaunchOptions, GameTag } from '@/types'; // GameLaunchOptions might be needed by launchGame
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
// import { supabase } from '@/lib/supabaseClient'; // For direct Supabase calls if needed - remove if not used here

const GAMES_CACHE_KEY = 'allGames';
const PROVIDERS_CACHE_KEY = 'gameProviders';
const CATEGORIES_CACHE_KEY = 'gameCategories';
const FAVORITES_CACHE_KEY = 'favoriteGameIds';

export const useGames = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all games
  const { data: games = [], isLoading: isLoadingGames, error: gamesError } = useQuery<Game[], Error>({
    queryKey: [GAMES_CACHE_KEY],
    queryFn: gameService.getAllGames,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch all providers
  const { data: providers = [], isLoading: isLoadingProviders, error: providersError } = useQuery<GameProvider[], Error>({
    queryKey: [PROVIDERS_CACHE_KEY],
    queryFn: () => gameService.getProviders({} as ProviderFilters),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Fetch all categories
  const { data: categories = [], isLoading: isLoadingCategories, error: categoriesError } = useQuery<GameCategory[], Error>({
    queryKey: [CATEGORIES_CACHE_KEY],
    queryFn: () => gameService.getCategories({} as CategoryFilters),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
  
  const { data: favoriteGameIds = new Set<string>(), isLoading: isLoadingFavorites } = useQuery<Set<string>, Error>({
    queryKey: [FAVORITES_CACHE_KEY, user?.id],
    queryFn: async () => {
      if (!user?.id) return new Set<string>();
      const favs = await gameService.getFavoriteGameIds(user.id);
      return new Set(favs.map(String));
    },
    enabled: !!isAuthenticated && !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const toggleFavoriteMutation = useMutation<
    void,
    Error,
    { gameId: string; isCurrentlyFavorite: boolean }
  >({
    mutationFn: async ({ gameId, isCurrentlyFavorite }) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (isCurrentlyFavorite) {
        await gameService.removeFavoriteGame(user.id, gameId);
      } else {
        await gameService.addFavoriteGame(user.id, gameId);
      }
    },
    onMutate: async ({ gameId, isCurrentlyFavorite }) => {
      await queryClient.cancelQueries({ queryKey: [FAVORITES_CACHE_KEY, user?.id] });
      const previousFavorites = queryClient.getQueryData<Set<string>>([FAVORITES_CACHE_KEY, user?.id]) || new Set<string>();
      const newFavorites = new Set(previousFavorites);
      if (isCurrentlyFavorite) {
        newFavorites.delete(gameId);
      } else {
        newFavorites.add(gameId);
      }
      queryClient.setQueryData([FAVORITES_CACHE_KEY, user?.id], newFavorites);
      return { previousFavorites };
    },
    onError: (err, variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData([FAVORITES_CACHE_KEY, user?.id], context.previousFavorites);
      }
      toast.error(`Failed to update favorites: ${err.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [FAVORITES_CACHE_KEY, user?.id] });
    },
  });

  const toggleFavoriteGame = useCallback(async (gameId: string) => {
    if (!isAuthenticated || !user?.id) {
      toast.error('Please log in to manage favorites.');
      return;
    }
    const gameIdStr = String(gameId); // Ensure it's a string
    const isCurrentlyFavorite = favoriteGameIds.has(gameIdStr);
    // Ensure 'games' is an array before finding. It should be due to default `[]`.
    const game = Array.isArray(games) ? games.find(g => String(g.id) === gameIdStr || g.game_id === gameIdStr) : undefined;
    
    toast.promise(
        toggleFavoriteMutation.mutateAsync({ gameId: gameIdStr, isCurrentlyFavorite }),
        {
            loading: 'Updating favorites...',
            success: () => `${game?.title || 'Game'} ${isCurrentlyFavorite ? 'removed from' : 'added to'} favorites!`,
            error: 'Failed to update favorites.',
        }
    );
  }, [isAuthenticated, user?.id, favoriteGameIds, toggleFavoriteMutation, games]);

  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [currentFilters, setCurrentFilters] = useState<GameFilters | null>(null);

  const filterGamesCallback = useCallback((
    searchTerm?: string, 
    categorySlug?: string, 
    providerSlug?: string, 
    otherFilters?: Partial<Omit<GameFilters, 'searchTerm' | 'categorySlug' | 'providerSlug'>>
  ) => {
    setCurrentFilters({ searchTerm, categorySlug, providerSlug, ...otherFilters });

    let result: Game[] = Array.isArray(games) ? [...games] : [];

    if (categorySlug && categorySlug !== 'all') {
      result = result.filter(game =>
        (Array.isArray(game.category_slugs) && game.category_slugs.includes(categorySlug)) ||
        game.category === categorySlug || 
        game.categoryName === categorySlug 
      );
    }

    if (providerSlug && providerSlug !== 'all') {
      result = result.filter(game => game.provider_slug === providerSlug);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(game =>
        game.title.toLowerCase().includes(term) ||
        (game.providerName && typeof game.providerName === 'string' && game.providerName.toLowerCase().includes(term)) ||
        (game.tags && Array.isArray(game.tags) && game.tags.some(tag => {
          if (typeof tag === 'string') return tag.toLowerCase().includes(term);
          // If GameTag object
          if (typeof tag === 'object' && tag !== null && 'name' in tag) return (tag as GameTag).name.toLowerCase().includes(term);
          return false;
        }))
      );
    }
    
    if (otherFilters?.isNew) {
        result = result.filter(game => game.isNew);
    }
    if (otherFilters?.isFeatured) {
        result = result.filter(game => game.is_featured);
    }

    setFilteredGames(result);
  }, [games]);

  useEffect(() => {
    const gamesArray = Array.isArray(games) ? games : [];
    if (gamesArray.length > 0 && !currentFilters) {
      setFilteredGames(gamesArray);
    } else if (gamesArray.length > 0 && currentFilters) {
      filterGamesCallback(
        currentFilters.searchTerm,
        currentFilters.categorySlug,
        currentFilters.providerSlug,
        currentFilters
      );
    } else if (gamesArray.length === 0) {
      setFilteredGames([]); // Clear filtered games if source is empty
    }
  }, [games, currentFilters, filterGamesCallback]);
  
  const launchGame = useCallback(async (game: Game, launchOptions: GameLaunchOptions): Promise<string | null> => {
    if (!isAuthenticated && launchOptions.mode === 'real') {
      toast.error('Please log in to play real money games.');
      throw new Error('User not authenticated for real play.');
    }

    if (launchOptions.mode === 'demo' && game.only_real === true) {
        toast.info('This game is available for real money play only.');
        return null;
    }
    if (launchOptions.mode === 'real' && game.only_demo === true) {
        toast.info('This game is available for demo play only.');
        return null;
    }

    try {
      const gameIdToLaunch = game.game_id || String(game.id);
      if (!gameIdToLaunch) {
          throw new Error('Game identifier is missing.');
      }
      
      const finalOptions = {
          ...launchOptions,
          language: launchOptions.language || user?.app_metadata?.language || 'en',
          user_id: launchOptions.user_id || user?.id,
      };

      const launchUrl = await gameService.launchGame(gameIdToLaunch, finalOptions.mode, finalOptions.user_id, finalOptions.language, finalOptions);
      
      if (launchUrl) {
        return launchUrl;
      } else {
        toast.error('Could not retrieve game URL.');
        return null;
      }
    } catch (error: any) {
      console.error('Error launching game:', error);
      toast.error(error.message || 'Failed to launch game.');
      return null;
    }
  }, [isAuthenticated, user]);

  const getGameBySlug = useCallback(async (slug: string): Promise<Game | null> => {
    const gamesArray = Array.isArray(games) ? games : [];
    const localGame = gamesArray.find(g => g.slug === slug);
    if (localGame) return localGame;
    try {
        // This could also be a separate useQuery in the component needing it for better state management
        return await gameService.getGameBySlug(slug);
    } catch (e) {
        console.error(`Error fetching game by slug ${slug} in useGames:`, e);
        return null;
    }
  }, [games]);

  const getGameById = useCallback(async (id: string): Promise<Game | null> => {
    const gamesArray = Array.isArray(games) ? games : [];
    const localGame = gamesArray.find(g => String(g.id) === id || g.game_id === id);
    if (localGame) return localGame;
     try {
        // This could also be a separate useQuery in the component needing it
        return await gameService.getGameById(id);
    } catch (e) {
        console.error(`Error fetching game by ID ${id} in useGames:`, e);
        return null;
    }
  }, [games]);

  return {
    games: Array.isArray(games) ? games : [], // Ensure games is always an array
    isLoadingGames,
    gamesError,
    providers: Array.isArray(providers) ? providers : [],
    isLoadingProviders,
    providersError,
    categories: Array.isArray(categories) ? categories : [],
    isLoadingCategories,
    categoriesError,
    favoriteGameIds,
    isLoadingFavorites,
    toggleFavoriteGame,
    launchGame,
    getGameBySlug, // Added
    getGameById, // Added
    filteredGames,
    filterGames: filterGamesCallback,
    isLoading: isLoadingGames || isLoadingProviders || isLoadingCategories || isLoadingFavorites,
  };
};
