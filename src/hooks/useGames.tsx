
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Game, DbGame, GameProvider, GameCategory, GameLaunchOptions, GameContextType, GameStatusEnum } from '@/types/game';
import { PostgrestError } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { convertAPIGameToUIGame, convertDbGameToGame, convertGameToDbGame } from '@/utils/gameTypeAdapter';

const GAMES_PER_PAGE = 20; // Or whatever your desired page size is

// Default empty context for initialization, actual value provided by GamesProvider
export const defaultGamesContextValue: GameContextType = {
  games: [],
  filteredGames: [],
  providers: [],
  categories: [],
  isLoading: true,
  isLoadingMore: false,
  hasMore: false,
  error: null,
  activeFilters: {
    searchTerm: '',
    provider: '',
    category: '',
    sortBy: 'popularity',
  },
  favoriteGameIds: new Set<string>(),
  getGameById: () => undefined,
  fetchGames: async () => {},
  setSearchTerm: () => {},
  setProviderFilter: () => {},
  setCategoryFilter: () => {},
  setSortBy: () => {},
  toggleFavoriteGame: async () => {},
  isFavorite: () => false,
  launchGame: async () => null,
  getGameLaunchUrl: async () => null,
  getFeaturedGames: async () => [],
  handleGameDetails: () => {},
  handlePlayGame: () => {},
  loadMoreGames: () => {},
};


export const useGamesData = (): GameContextType => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [allGames, setAllGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const [activeFilters, setActiveFilters] = useState({
    searchTerm: '',
    provider: '',
    category: '',
    sortBy: 'popularity', // Default sort
  });

  // Fetch initial games, providers, categories
  const { data: fetchedGamesData, isLoading: isLoadingGames, error: gamesError } = useQuery<{ data: DbGame[], count: number }, Error>({
    queryKey: ['allGames', currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * GAMES_PER_PAGE;
      const to = from + GAMES_PER_PAGE - 1;
      
      let query = supabase.from('games').select('*', { count: 'exact' })
        .eq('status', GameStatusEnum.ACTIVE) // Only active games for frontend
        .range(from, to);

      // Apply sorting based on activeFilters.sortBy, e.g.,
      if (activeFilters.sortBy === 'popularity') query = query.order('views', { ascending: false });
      if (activeFilters.sortBy === 'name_asc') query = query.order('title', { ascending: true });
      if (activeFilters.sortBy === 'name_desc') query = query.order('title', { ascending: false });
      if (activeFilters.sortBy === 'newest') query = query.order('created_at', { ascending: false });


      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true,
  });

  useEffect(() => {
    if (fetchedGamesData?.data) {
      const newGames = fetchedGamesData.data.map(convertDbGameToGame);
      setAllGames(prev => currentPage === 1 ? newGames : [...prev, ...newGames]);
      setHasMore(allGames.length < (fetchedGamesData.count ?? 0));
    }
  }, [fetchedGamesData, currentPage]);


  const { data: providers = [], isLoading: isLoadingProviders } = useQuery<GameProvider[], Error>({
    queryKey: ['gameProviders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('game_providers').select('*').eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
    staleTime: Infinity,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<GameCategory[], Error>({
    queryKey: ['gameCategories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('game_categories').select('*').eq('status', 'active');
      if (error) throw error;
      return data || [];
    },
    staleTime: Infinity,
  });

  // Favorite Games Logic
  const { data: favoriteGameRows } = useQuery<Array<{ game_id: string }>, Error>({
    queryKey: ['favoriteGames'],
    queryFn: async () => {
      // This assumes you have access to the user's ID, e.g., from an AuthContext
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) return [];
      // const { data, error } = await supabase.from('favorite_games').select('game_id').eq('user_id', user.id);
      // For now, let's mock or assume it's handled if auth isn't fully integrated here
      // This part needs user_id to be functional.
      // console.warn("Favorite games fetch needs user context");
      return []; // Placeholder if user is not available
    },
    // enabled: !!user, // Only run if user is logged in
  });

  const favoriteGameIds = useMemo(() => {
    return new Set(favoriteGameRows?.map(fav => fav.game_id) || []);
  }, [favoriteGameRows]);

  const addFavoriteMutation = useMutation({
    mutationFn: async (gameId: string) => {
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) throw new Error("User not authenticated");
      // const { error } = await supabase.from('favorite_games').insert({ game_id: gameId, user_id: user.id });
      // if (error) throw error;
      // This part needs user_id.
      console.warn("Add favorite needs user context. Simulating success for gameId:", gameId);
      await new Promise(res => setTimeout(res, 300)); // Simulate async
    },
    onSuccess: (_, gameId) => {
      queryClient.invalidateQueries({ queryKey: ['favoriteGames'] });
      toast.success(`Game added to favorites!`);
      // Optimistic update:
      // queryClient.setQueryData(['favoriteGames'], (old: any) => old ? [...old, {game_id: gameId}] : [{game_id: gameId}]);
    },
    onError: (error: Error) => {
      toast.error(`Failed to add favorite: ${error.message}`);
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (gameId: string) => {
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) throw new Error("User not authenticated");
      // const { error } = await supabase.from('favorite_games').delete().match({ game_id: gameId, user_id: user.id });
      // if (error) throw error;
      // This part needs user_id.
      console.warn("Remove favorite needs user context. Simulating success for gameId:", gameId);
      await new Promise(res => setTimeout(res, 300)); // Simulate async
    },
    onSuccess: (_, gameId) => {
      queryClient.invalidateQueries({ queryKey: ['favoriteGames'] });
      toast.info(`Game removed from favorites.`);
      // Optimistic update:
      // queryClient.setQueryData(['favoriteGames'], (old: any[]) => old ? old.filter(fav => fav.game_id !== gameId) : []);
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove favorite: ${error.message}`);
    },
  });

  const toggleFavoriteGame = useCallback(async (gameId: string) => {
    if (!gameId) {
      toast.error("Game ID is missing.");
      return;
    }
    // Needs auth check
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) {
    //   toast.error("Please log in to manage favorites.");
    //   return;
    // }
    if (favoriteGameIds.has(gameId)) {
      await removeFavoriteMutation.mutateAsync(gameId);
    } else {
      await addFavoriteMutation.mutateAsync(gameId);
    }
  }, [favoriteGameIds, addFavoriteMutation, removeFavoriteMutation]);

  const isFavorite = useCallback((gameId: string) => {
    return favoriteGameIds.has(gameId);
  }, [favoriteGameIds]);

  // Filtering and Sorting Logic
  useEffect(() => {
    let tempGames = [...allGames];
    if (activeFilters.searchTerm) {
      tempGames = tempGames.filter(game => game.title.toLowerCase().includes(activeFilters.searchTerm.toLowerCase()));
    }
    if (activeFilters.provider) {
      tempGames = tempGames.filter(game => game.provider_slug === activeFilters.provider);
    }
    if (activeFilters.category) {
      tempGames = tempGames.filter(game => game.category_slugs?.includes(activeFilters.category));
    }
    // Sorting is handled by API for initial load, client-side sort if needed for already loaded 'allGames'
    setFilteredGames(tempGames);
  }, [allGames, activeFilters]);


  const fetchGames = useCallback(async (page = 1) => {
    setCurrentPage(page);
    // query will refetch due to `currentPage` in queryKey
  }, []);
  
  const loadMoreGames = useCallback(() => {
    if (hasMore && !isLoadingGames && !isLoadingMore) {
      setIsLoadingMore(true);
      setCurrentPage(prevPage => prevPage + 1);
      // isLoadingMore will be set to false via isLoadingGames effect or error
      queryClient.prefetchQuery({
        queryKey: ['allGames', currentPage + 1],
        queryFn: async () => { /* same as main queryFn */ 
            const from = currentPage * GAMES_PER_PAGE; // currentPage is old value here, so it's `nextPage -1`
            const to = from + GAMES_PER_PAGE - 1;
            const { data, error, count } = await supabase.from('games').select('*', { count: 'exact' })
                .eq('status', GameStatusEnum.ACTIVE)
                .range(from, to)
                // .order( activeFilters.sortBy === 'popularity' ? 'views' : 'title', { ascending: activeFilters.sortBy !== 'name_desc' })
                // Apply sorting as in main query
                .order('title', { ascending: true }); // Simplified for prefetch
            if (error) throw error;
            return { data: data || [], count: count || 0 };
        },
      }).finally(() => setIsLoadingMore(false));
    }
  }, [hasMore, isLoadingGames, isLoadingMore, currentPage, queryClient]);


  const getGameById = useCallback((id: string): Game | undefined => {
    return allGames.find(game => String(game.id) === id);
  }, [allGames]);

  // Game Launching
  const getGameLaunchUrl = useCallback(async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    // This would typically involve an API call to your backend or a game aggregator
    console.log(`Requesting launch URL for ${game.title} with options:`, options);
    // const { data: { user } } = await supabase.auth.getUser();
    // if (options.mode === 'real' && !user) {
    //   toast.error("Please log in to play real money games.");
    //   return null;
    // }
    
    // Example: Construct a URL or call a Supabase Edge Function
    // const { data, error } = await supabase.functions.invoke('launch-game', {
    //   body: { gameId: game.game_id || game.id, provider: game.provider_slug, mode: options.mode, userId: user?.id },
    // });
    // if (error) throw error;
    // return data?.launchUrl || null;

    // Mock implementation:
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    if (game.slug) { // Using slug as a proxy for availability
      return `/mock-game-frame/${game.slug}?mode=${options.mode}`;
    }
    toast.error("Game launch URL not available.");
    return null;
  }, []);

  const launchGame = useCallback(async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    try {
      const url = await getGameLaunchUrl(game, options);
      if (url) {
        // Could open in iframe, new tab, or navigate, depending on UX desired
        // For now, just returning URL for GameLauncher component or direct window.open
        return url;
      } else {
        toast.error('Could not launch game: No URL received.');
        return null;
      }
    } catch (error: any) {
      toast.error(`Failed to launch game: ${error.message}`);
      return null;
    }
  }, [getGameLaunchUrl]);

  const getFeaturedGames = useCallback(async (count: number = 8): Promise<Game[]> => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('status', GameStatusEnum.ACTIVE)
      .eq('is_featured', true)
      .limit(count)
      .order('views', { ascending: false }); // Example: order by views or a specific featured_order column

    if (error) {
      console.error('Error fetching featured games:', error);
      return [];
    }
    return data?.map(convertDbGameToGame) || [];
  }, []);
  
  const handleGameDetails = (game: Game) => {
    navigate(`/casino/game/${game.slug || game.id}`);
  };

  const handlePlayGame = (game: Game, mode: 'real' | 'demo') => {
    // This could open a GameLauncher modal or directly navigate/open a new tab
    // For simplicity, let's assume it triggers something that uses launchGame
    console.log("Request to play game:", game.title, "in mode:", mode);
    // Example: setSelectedGameForLauncher({ game, mode }); setIsLauncherOpen(true);
    // Or:
    launchGame(game, { mode }).then(url => {
      if (url) {
        // Decide how to open: could be a modal, new window, or navigation
        // This depends on how GameLauncher.tsx or similar components are integrated
        // For now, we can assume a GameLauncher component will pick this up or GameCard calls window.open
         window.open(url, '_blank', 'noopener,noreferrer'); // Example direct open
      }
    });
  };


  return {
    games: allGames, // All loaded games, could be paginated for performance on client
    filteredGames, // Games after client-side filtering (if any)
    providers,
    categories,
    isLoading: isLoadingGames || isLoadingProviders || isLoadingCategories,
    isLoadingMore,
    hasMore,
    error: gamesError || null, // Combine errors if necessary
    activeFilters,
    favoriteGameIds,
    getGameById,
    fetchGames,
    setSearchTerm: (searchTerm) => setActiveFilters(prev => ({ ...prev, searchTerm })),
    setProviderFilter: (provider) => setActiveFilters(prev => ({ ...prev, provider })),
    setCategoryFilter: (category) => setActiveFilters(prev => ({ ...prev, category })),
    setSortBy: (sortBy) => setActiveFilters(prev => ({ ...prev, sortBy })),
    toggleFavoriteGame,
    isFavorite,
    launchGame,
    getGameLaunchUrl,
    getFeaturedGames,
    handleGameDetails,
    handlePlayGame,
    loadMoreGames,
    // Admin functions can be added here if this hook is also for admin panel
  };
};
