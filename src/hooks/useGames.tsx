import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query'; // Removed unused QueryFunction type
import { supabase } from '@/integrations/supabase/client';
import { Game, DbGame, GameProvider, GameCategory, GameLaunchOptions, GameContextType, GameStatusEnum } from '@/types/game';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { convertDbGameToGame, convertGameToDbGame, slugify } from '@/utils/gameTypeAdapter'; // Added slugify import

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
  const [hasMoreState, setHasMoreState] = useState(true); // Renamed to avoid conflict with RQ hasMore
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const [activeFilters, setActiveFilters] = useState({
    searchTerm: '',
    provider: '',
    category: '',
    sortBy: 'popularity',
  });

  const fetchGamesQueryFn = async ({ queryKey }: { queryKey: QueryKey }) => {
    const page = queryKey[1] as number;
    const from = (page - 1) * GAMES_PER_PAGE;
    const to = from + GAMES_PER_PAGE - 1;
    
    let query = supabase.from('games').select('*, providers(id, name, slug)', { count: 'exact' })
      .eq('status', GameStatusEnum.ACTIVE)
      .range(from, to);

    if (activeFilters.sortBy === 'popularity') query = query.order('views', { ascending: false });
    if (activeFilters.sortBy === 'name_asc') query = query.order('title', { ascending: true });
    if (activeFilters.sortBy === 'name_desc') query = query.order('title', { ascending: false });
    if (activeFilters.sortBy === 'newest') query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;
    // Explicitly cast to DbGame[] after checking data
    const dbGames: DbGame[] = (data || []).map(g => g as DbGame);
    return { data: dbGames, count: count || 0 };
  };
  

  const { data: fetchedGamesData, isLoading: isLoadingGames, error: gamesError } = useQuery<{ data: DbGame[], count: number }, Error>({
    queryKey: ['allGames', currentPage, activeFilters.sortBy],
    queryFn: fetchGamesQueryFn,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (fetchedGamesData?.data) {
      const newGames = fetchedGamesData.data.map(convertDbGameToGame);
      setAllGames(prev => currentPage === 1 ? newGames : [...prev, ...newGames]);
      // Use a different name for hasMore state to avoid conflict with RQ's hasMore
      setHasMoreState( (currentPage * GAMES_PER_PAGE) < (fetchedGamesData.count ?? 0) );
    }
  }, [fetchedGamesData, currentPage]);


  const { data: providers = [], isLoading: isLoadingProviders } = useQuery<GameProvider[], Error>({
    queryKey: ['gameProvidersList'], // Changed queryKey to avoid conflicts
    queryFn: async () => {
      // Assuming 'providers' is the correct table for general provider info
      // And it has 'name' and 'logo' (or 'logo_url')
      // 'slug' is often derived or part of another table like 'game_providers'
      const { data, error } = await supabase
        .from('providers') // Changed from 'game_providers'
        .select('id, name, logo'); // Select specific fields. 'logo' is used in schema
      
      if (error) throw error;

      return (data || []).map(p => ({
        id: String(p.id),
        name: p.name,
        slug: slugify(p.name), // Derive slug from name as 'providers' table lacks it
        logo_url: p.logo, // Map 'logo' to 'logo_url'
        is_active: true, // Assuming active if fetched, or add status column to 'providers'
      }));
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

  const { data: favoriteGameRows } = useQuery<Array<{ game_id: string }>, Error>({
    queryKey: ['favoriteGames'],
    queryFn: async () => {
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) return [];
      // const { data, error } = await supabase.from('favorite_games').select('game_id').eq('user_id', user.id);
      // if (error) throw error;
      // return data || [];
      return []; // Placeholder, requires user context
    },
    // enabled: !!user, 
  });

  const favoriteGameIds = useMemo(() => {
    return new Set(favoriteGameRows?.map(fav => fav.game_id) || []);
  }, [favoriteGameRows]);

  const addFavoriteMutation = useMutation<void, Error, string>({
    mutationFn: async (gameId: string) => {
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) throw new Error("User not logged in");
      // const { error } = await supabase.from('favorite_games').insert({ game_id: gameId, user_id: user.id });
      // if (error) throw error;
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
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) throw new Error("User not logged in");
      // const { error } = await supabase.from('favorite_games').delete().match({ game_id: gameId, user_id: user.id });
      // if (error) throw error;
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

  useEffect(() => {
    let tempGames = [...allGames];
    if (activeFilters.searchTerm) {
      tempGames = tempGames.filter(game => game.title.toLowerCase().includes(activeFilters.searchTerm.toLowerCase()));
    }
    if (activeFilters.provider && activeFilters.provider !== '') {
      tempGames = tempGames.filter(game => game.provider_slug === activeFilters.provider);
    }
    if (activeFilters.category && activeFilters.category !== '') {
      tempGames = tempGames.filter(game => game.category_slugs?.includes(activeFilters.category));
    }
    setFilteredGames(tempGames);
  }, [allGames, activeFilters]);


  const fetchGamesCb = useCallback(async (page = 1) => {
    setCurrentPage(page);
    queryClient.invalidateQueries({ queryKey: ['allGames'] });
  }, [queryClient]);
  
  const loadMoreGames = useCallback(() => {
    if (hasMoreState && !isLoadingGames && !isLoadingMore) { // Use hasMoreState
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      queryClient.prefetchQuery({
        queryKey: ['allGames', nextPage, activeFilters.sortBy],
        queryFn: fetchGamesQueryFn,
      }).finally(() => setIsLoadingMore(false));
    }
  }, [hasMoreState, isLoadingGames, isLoadingMore, currentPage, activeFilters.sortBy, queryClient, fetchGamesQueryFn]);

  const getGameById = useCallback((id: string): Game | undefined => {
    return allGames.find(game => String(game.id) === id);
  }, [allGames]);

  const getGameLaunchUrl = useCallback(async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    console.log(`Requesting launch URL for ${game.title} with options:`, options);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    if (game.slug) {
      return `/mock-game-frame/${game.slug}?mode=${options.mode}&lang=${options.language || 'en'}`;
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
      .select('*, providers(id, name, slug)')
      .eq('status', GameStatusEnum.ACTIVE)
      .eq('is_featured', true)
      .limit(count)
      .order('views', { ascending: false });

    if (error) {
      console.error('Error fetching featured games:', error);
      return [];
    }
    // Ensure data is DbGame[] before mapping
    const dbGames: DbGame[] = (data || []).map(g => g as DbGame);
    return dbGames.map(convertDbGameToGame);
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
    setCurrentPage(1); 
    setAllGames([]); // Clear games to ensure fresh load for new filter
    setActiveFilters(prev => ({ ...prev, provider, searchTerm: '' })); 
  };
  const setCategoryFilter = (category: string) => {
    setCurrentPage(1); 
    setAllGames([]); // Clear games
    setActiveFilters(prev => ({ ...prev, category, searchTerm: '' })); 
  };
  const setSortBy = (sortBy: string) => {
    setCurrentPage(1); 
    setAllGames([]); // Clear games
    setActiveFilters(prev => ({ ...prev, sortBy }));
  };

  return {
    games: allGames,
    filteredGames, 
    providers,
    categories,
    isLoading: isLoadingGames || isLoadingProviders || isLoadingCategories,
    isLoadingMore,
    hasMore: hasMoreState, // Use renamed state variable
    error: gamesError || null,
    activeFilters,
    favoriteGameIds,
    getGameById,
    fetchGames: fetchGamesCb,
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
