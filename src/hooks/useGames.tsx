
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameService, ProviderFilters, CategoryFilters, GameFilters } from '@/services/gameService'; // Assuming these types are defined in gameService
import { Game, GameProvider, GameCategory } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient'; // For direct Supabase calls if needed

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
    queryFn: () => gameService.getProviders({} as ProviderFilters), // Pass empty filters or define default
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Fetch all categories
  const { data: categories = [], isLoading: isLoadingCategories, error: categoriesError } = useQuery<GameCategory[], Error>({
    queryKey: [CATEGORIES_CACHE_KEY],
    queryFn: () => gameService.getCategories({} as CategoryFilters), // Pass empty filters or define default
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
  
  // Fetch favorite game IDs for the current user
  const { data: favoriteGameIds = new Set<string>(), isLoading: isLoadingFavorites } = useQuery<Set<string>, Error>({
    queryKey: [FAVORITES_CACHE_KEY, user?.id],
    queryFn: async () => {
      if (!user?.id) return new Set<string>();
      const favs = await gameService.getFavoriteGameIds(user.id);
      return new Set(favs.map(String)); // Ensure IDs are strings
    },
    enabled: !!isAuthenticated && !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Toggle favorite game mutation
  const toggleFavoriteMutation = useMutation<
    void, // onSuccess returns void
    Error, // onError returns Error
    { gameId: string; isCurrentlyFavorite: boolean } // variables
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
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: [FAVORITES_CACHE_KEY, user?.id] });
      const previousFavorites = queryClient.getQueryData<Set<string>>([FAVORITES_CACHE_KEY, user?.id]) || new Set<string>();
      const newFavorites = new Set(previousFavorites);
      if (isCurrentlyFavorite) {
        newFavorites.delete(gameId);
      } else {
        newFavorites.add(gameId);
      }
      queryClient.setQueryData([FAVORITES_CACHE_KEY, user?.id], newFavorites);
      return { previousFavorites }; // Context for rollback
    },
    onError: (err, variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData([FAVORITES_CACHE_KEY, user?.id], context.previousFavorites);
      }
      toast.error(`Failed to update favorites: ${err.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [FAVORITES_CACHE_KEY, user?.id] });
      // Potentially invalidate queries for lists that display favorite status if not handled by local state
    },
  });

  const toggleFavoriteGame = useCallback(async (gameId: string) => {
    if (!isAuthenticated || !user?.id) {
      toast.error('Please log in to manage favorites.');
      return;
    }
    const gameIdStr = String(gameId);
    const isCurrentlyFavorite = favoriteGameIds.has(gameIdStr);
    const game = games.find(g => String(g.id) === gameIdStr || g.game_id === gameIdStr);
    
    toast.promise(
        toggleFavoriteMutation.mutateAsync({ gameId: gameIdStr, isCurrentlyFavorite }),
        {
            loading: 'Updating favorites...',
            success: () => `${game?.title || 'Game'} ${isCurrentlyFavorite ? 'removed from' : 'added to'} favorites!`,
            error: 'Failed to update favorites.',
        }
    );
  }, [isAuthenticated, user?.id, favoriteGameIds, toggleFavoriteMutation, games]);


  // Local state for filtered games (e.g., for a specific casino page like Slots)
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [currentFilters, setCurrentFilters] = useState<GameFilters | null>(null);

  const filterGamesCallback = useCallback((
    searchTerm?: string, 
    categorySlug?: string, 
    providerSlug?: string, 
    otherFilters?: Partial<Omit<GameFilters, 'searchTerm' | 'categorySlug' | 'providerSlug'>>
  ) => {
    setCurrentFilters({ searchTerm, categorySlug, providerSlug, ...otherFilters });

    let result = [...games];

    if (categorySlug && categorySlug !== 'all') {
      result = result.filter(game =>
        (Array.isArray(game.category_slugs) && game.category_slugs.includes(categorySlug)) ||
        game.category === categorySlug || // fallback
        game.categoryName === categorySlug // fallback
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
        (game.tags && Array.isArray(game.tags) && game.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(term)))
      );
    }
    
    if (otherFilters?.isNew) {
        result = result.filter(game => game.isNew);
    }
    if (otherFilters?.isFeatured) {
        result = result.filter(game => game.is_featured);
    }
    // Add more specific filters from otherFilters if needed

    setFilteredGames(result);
  }, [games]);

  // Effect to initialize filteredGames or update when main games list changes
  useEffect(() => {
    if (games.length > 0 && !currentFilters) { // Initial load or if filters cleared
      setFilteredGames(games);
    } else if (games.length > 0 && currentFilters) { // Re-apply filters if games list itself changes
      filterGamesCallback(
        currentFilters.searchTerm,
        currentFilters.categorySlug,
        currentFilters.providerSlug,
        currentFilters // Pass all other filters
      );
    }
  }, [games, currentFilters, filterGamesCallback]);
  
  // Simplified launchGame logic
  const launchGame = useCallback(async (game: Game, options: { mode: 'real' | 'demo' }): Promise<string | null> => {
    if (!isAuthenticated && options.mode === 'real') {
      toast.error('Please log in to play real money games.');
      // Consider navigating to login page: navigate('/login', { state: { from: location.pathname } });
      throw new Error('User not authenticated for real play.');
    }

    // Prevent demo play if game is real_only, or real play if demo_only
    if (options.mode === 'demo' && game.only_real === true) {
        toast.info('This game is available for real money play only.');
        return null; // Or throw new Error('Demo play not allowed.');
    }
    if (options.mode === 'real' && game.only_demo === true) {
        toast.info('This game is available for demo play only.');
        return null; // Or throw new Error('Real play not allowed.');
    }

    try {
      const gameIdToLaunch = game.game_id || String(game.id);
      if (!gameIdToLaunch) {
          throw new Error('Game identifier is missing.');
      }
      // The gameService.launchGame should handle backend calls to get the actual session URL
      const launchUrl = await gameService.launchGame(gameIdToLaunch, options.mode, user?.id, user?.app_metadata?.language || 'en');
      
      if (launchUrl) {
        return launchUrl;
      } else {
        toast.error('Could not retrieve game URL.');
        return null;
      }
    } catch (error: any) {
      console.error('Error launching game:', error);
      toast.error(error.message || 'Failed to launch game.');
      return null; // Or re-throw error if preferred
    }
  }, [isAuthenticated, user]);

  // This is where the "Type instantiation is excessively deep" error (line 221) might have been.
  // The complexity could arise from deeply nested generics or complex conditional types in `useQuery` or `useMutation`
  // if they were using more complex type parameters. The current structure is fairly standard.
  // If the error persists, it might be related to how `GameFilters`, `ProviderFilters`, `CategoryFilters` are defined
  // in `gameService.ts` or the return types of service functions.
  // For now, the structure above aims for clarity.

  return {
    games, // All games
    isLoadingGames,
    gamesError,
    providers,
    isLoadingProviders,
    providersError,
    categories,
    isLoadingCategories,
    categoriesError,
    favoriteGameIds,
    isLoadingFavorites,
    toggleFavoriteGame,
    launchGame,
    filteredGames, // Games after local filtering
    filterGames: filterGamesCallback, // Function to apply filters
    isLoading: isLoadingGames || isLoadingProviders || isLoadingCategories || isLoadingFavorites, // Combined loading state
  };
};
