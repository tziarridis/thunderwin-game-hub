import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, QueryKey, DefinedInitialDataOptions, UndefinedInitialDataOptions, DefinedUseQueryResult, QueryFunction } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Game, DbGame, GameProvider, GameCategory, GameLaunchOptions, GameContextType, GameStatusEnum } from '@/types/game';
// import { PostgrestError } from '@supabase/supabase-js'; // Not directly used, covered by Error type
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
// Updated import names
import { convertDbGameToGame, convertGameToDbGame } from '@/utils/gameTypeAdapter';

const GAMES_PER_PAGE = 20;

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

  const fetchGamesQueryFn: QueryFunction<{ data: DbGame[], count: number }, QueryKey> = async ({ queryKey }) => {
    const page = queryKey[1] as number;
    const from = (page - 1) * GAMES_PER_PAGE;
    const to = from + GAMES_PER_PAGE - 1;
    
    let query = supabase.from('games').select('*, providers(id, name, slug)', { count: 'exact' }) // Assuming 'providers' is a related table with FK on games.provider_id
      .eq('status', GameStatusEnum.ACTIVE)
      .range(from, to);

    if (activeFilters.sortBy === 'popularity') query = query.order('views', { ascending: false });
    if (activeFilters.sortBy === 'name_asc') query = query.order('title', { ascending: true });
    if (activeFilters.sortBy === 'name_desc') query = query.order('title', { ascending: false });
    if (activeFilters.sortBy === 'newest') query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;
    // Ensure data matches DbGame[] before returning
    return { data: (data || []) as DbGame[], count: count || 0 };
  };
  

  const { data: fetchedGamesData, isLoading: isLoadingGames, error: gamesError } = useQuery<{ data: DbGame[], count: number }, Error, { data: DbGame[], count: number }, QueryKey>({
    queryKey: ['allGames', currentPage, activeFilters.sortBy], // Added sortBy to queryKey
    queryFn: fetchGamesQueryFn,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // keepPreviousData: true, // Consider implications of keepPreviousData with pagination
  });

  useEffect(() => {
    if (fetchedGamesData?.data) {
      const newGames = fetchedGamesData.data.map(convertDbGameToGame);
      setAllGames(prev => currentPage === 1 ? newGames : [...prev, ...newGames]);
      setHasMore(allGames.length < (fetchedGamesData.count ?? 0));
    }
  }, [fetchedGamesData, currentPage]); // allGames.length was causing re-runs, removed from deps


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

  const addFavoriteMutation = useMutation<void, Error, string>({
    mutationFn: async (gameId: string) => {
      console.warn("Add favorite needs user context. Simulating success for gameId:", gameId);
      await new Promise(res => setTimeout(res, 300)); 
    },
    onSuccess: (_, gameId) => {
      queryClient.invalidateQueries({ queryKey: ['favoriteGames'] });
      toast.success(`Game added to favorites!`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to add favorite: ${error.message}`);
    },
  });

  const removeFavoriteMutation = useMutation<void, Error, string>({
    mutationFn: async (gameId: string) => {
      console.warn("Remove favorite needs user context. Simulating success for gameId:", gameId);
      await new Promise(res => setTimeout(res, 300));
    },
    onSuccess: (_, gameId) => {
      queryClient.invalidateQueries({ queryKey: ['favoriteGames'] });
      toast.info(`Game removed from favorites.`);
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
    let tempGames = [...allGames]; // Use allGames which is populated from fetchedGamesData
    if (activeFilters.searchTerm) {
      tempGames = tempGames.filter(game => game.title.toLowerCase().includes(activeFilters.searchTerm.toLowerCase()));
    }
    if (activeFilters.provider && activeFilters.provider !== '') { // Check for non-empty provider
      tempGames = tempGames.filter(game => game.provider_slug === activeFilters.provider);
    }
    if (activeFilters.category && activeFilters.category !== '') { // Check for non-empty category
      tempGames = tempGames.filter(game => game.category_slugs?.includes(activeFilters.category));
    }
    setFilteredGames(tempGames);
  }, [allGames, activeFilters]);


  const fetchGamesCb = useCallback(async (page = 1) => { // Renamed to avoid conflict with React Query's fetchGames
    setCurrentPage(page);
    // query will refetch due to `currentPage` or `activeFilters.sortBy` in queryKey changing
    queryClient.invalidateQueries({ queryKey: ['allGames'] }); // More general invalidation
  }, [queryClient]);
  
  const loadMoreGames = useCallback(() => {
    if (hasMore && !isLoadingGames && !isLoadingMore) {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      // Prefetch or rely on useEffect to fetch based on currentPage change
      queryClient.prefetchQuery({
        queryKey: ['allGames', nextPage, activeFilters.sortBy],
        queryFn: fetchGamesQueryFn,
      }).finally(() => setIsLoadingMore(false));
    }
  }, [hasMore, isLoadingGames, isLoadingMore, currentPage, activeFilters.sortBy, queryClient, fetchGamesQueryFn]);


  const getGameById = useCallback((id: string): Game | undefined => {
    return allGames.find(game => String(game.id) === id);
  }, [allGames]);

  // Game Launching
  const getGameLaunchUrl = useCallback(async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    console.log(`Requesting launch URL for ${game.title} with options:`, options);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    if (game.slug) {
      return `/mock-game-frame/${game.slug}?mode=${options.mode}`;
    }
    toast.error("Game launch URL not available.");
    return null;
  }, []);

  const launchGame = useCallback(async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    try {
      const url = await getGameLaunchUrl(game, options);
      if (url) {
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
      .select('*, providers(id, name, slug)') // Assuming 'providers' relation
      .eq('status', GameStatusEnum.ACTIVE)
      .eq('is_featured', true)
      .limit(count)
      .order('views', { ascending: false });

    if (error) {
      console.error('Error fetching featured games:', error);
      return [];
    }
    return data?.map(dbGame => convertDbGameToGame(dbGame as DbGame)) || [];
  }, []);
  
  const handleGameDetails = (game: Game) => {
    navigate(`/casino/game/${game.slug || game.id}`);
  };

  const handlePlayGame = (game: Game, mode: 'real' | 'demo') => {
    console.log("Request to play game:", game.title, "in mode:", mode);
    launchGame(game, { mode }).then(url => {
      if (url) {
         window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
  };

  const setSearchTerm = (searchTerm: string) => setActiveFilters(prev => ({ ...prev, searchTerm }));
  const setProviderFilter = (provider: string) => {
    setCurrentPage(1); // Reset to page 1 when filter changes
    setActiveFilters(prev => ({ ...prev, provider, searchTerm: '' })); // Clear search on provider change
  };
  const setCategoryFilter = (category: string) => {
    setCurrentPage(1); // Reset to page 1
    setActiveFilters(prev => ({ ...prev, category, searchTerm: '' })); // Clear search on category change
  };
  const setSortBy = (sortBy: string) => {
    setCurrentPage(1); // Reset to page 1
    setActiveFilters(prev => ({ ...prev, sortBy }));
  };


  return {
    games: allGames,
    filteredGames, 
    providers,
    categories,
    isLoading: isLoadingGames || isLoadingProviders || isLoadingCategories,
    isLoadingMore,
    hasMore,
    error: gamesError || null,
    activeFilters,
    favoriteGameIds,
    getGameById,
    fetchGames: fetchGamesCb, // Use renamed callback
    setSearchTerm,
    setProviderFilter,
    setCategoryFilter,
    setSortBy,
    toggleFavoriteGame,
    isFavorite,
    launchGame,
    getGameLaunchUrl,
    getFeaturedGames,
    handleGameDetails,
    handlePlayGame,
    loadMoreGames,
  };
};
