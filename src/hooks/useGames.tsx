import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Game, DbGame, GameProvider, GameCategory, GameLaunchOptions, GameContextType, GameStatusEnum } from '@/types/game';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { convertDbGameToGame, slugify } from '@/utils/gameTypeAdapter';

const GAMES_PER_PAGE = 20;

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
  getGameBySlug: () => undefined,
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

const GamesContext = createContext<GameContextType>(defaultGamesContextValue);

export const GamesProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [allGames, setAllGames] = useState<Game[]>([]);
  const [filteredGamesState, setFilteredGamesState] = useState<Game[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreState, setHasMoreState] = useState(true);
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
    
    let query = supabase
      .from('games')
      .select(`
        *,
        game_providers (id, name, slug)
      `, { count: 'exact' })
      .eq('status', GameStatusEnum.ACTIVE)
      .range(from, to);

    if (activeFilters.sortBy === 'popularity') query = query.order('views', { ascending: false });
    if (activeFilters.sortBy === 'name_asc') query = query.order('title', { ascending: true });
    if (activeFilters.sortBy === 'name_desc') query = query.order('title', { ascending: false });
    if (activeFilters.sortBy === 'newest') query = query.order('created_at', { ascending: false });
    if (activeFilters.provider) {
        query = query.eq('provider_slug', activeFilters.provider);
    }
    if (activeFilters.category) {
        query = query.contains('category_slugs', [activeFilters.category]);
    }

    const { data, error, count } = await query;
    if (error) {
        console.error("Error fetching games:", error);
        throw error;
    }
    const dbGames: DbGame[] = (data || []).map(g => g as DbGame);
    return { data: dbGames, count: count || 0 };
  };
  
  const { data: fetchedGamesData, isLoading: isLoadingGamesHook, error: gamesError } = useQuery<{ data: DbGame[], count: number }, Error>({
    queryKey: ['allGames', currentPage, activeFilters],
    queryFn: fetchGamesQueryFn,
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  useEffect(() => {
    if (fetchedGamesData?.data) {
      const newGames = fetchedGamesData.data.map(convertDbGameToGame);
      setAllGames(prev => currentPage === 1 ? newGames : [...prev, ...newGames]);
      setHasMoreState( (currentPage * GAMES_PER_PAGE) < (fetchedGamesData.count ?? 0) );
    }
  }, [fetchedGamesData, currentPage]);

  const { data: providersData = [], isLoading: isLoadingProvidersHook } = useQuery<GameProvider[], Error>({
    queryKey: ['gameProvidersList'], 
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_providers') 
        .select('id, name, slug, logo_url, is_active')
        .eq('is_active', true);
      
      if (error) throw error;

      return (data || []).map(p => ({
        id: String(p.id),
        name: p.name,
        slug: p.slug,
        logo_url: p.logo_url, 
        is_active: p.is_active,
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
      return []; // Placeholder, requires user context
    },
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

  useEffect(() => {
    let tempGames = [...allGames];
    if (activeFilters.searchTerm) {
      tempGames = tempGames.filter(game => 
        game.title.toLowerCase().includes(activeFilters.searchTerm.toLowerCase()) ||
        (game.providerName && game.providerName.toLowerCase().includes(activeFilters.searchTerm.toLowerCase()))
      );
    }
    setFilteredGamesState(tempGames);
  }, [allGames, activeFilters]);

  const fetchGamesCb = useCallback(async (page = 1) => {
    setCurrentPage(page);
  }, []);
  
  // Reset isLoadingMore when isLoadingGamesHook becomes false after a page change
  useEffect(() => {
    if (!isLoadingGamesHook) {
      setIsLoadingMore(false);
    }
  }, [isLoadingGamesHook]);

  const loadMoreGames = useCallback(() => {
    if (hasMoreState && !isLoadingGamesHook && !isLoadingMore) {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
    }
  }, [hasMoreState, isLoadingGamesHook, isLoadingMore, currentPage]);

  const getGameById = useCallback((id: string): Game | undefined => {
    return allGames.find(game => String(game.id) === id || String(game.game_id) === id);
  }, [allGames]);

  const getGameBySlug = useCallback((slug: string): Game | undefined => {
    return allGames.find(game => game.slug === slug);
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
      .select('*, game_providers(id, name, slug)')
      .eq('status', GameStatusEnum.ACTIVE)
      .eq('is_featured', true)
      .limit(count)
      .order('views', { ascending: false });

    if (error) {
      console.error('Error fetching featured games:', error);
      return [];
    }
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

  const setSearchTerm = (searchTerm: string) => {
    setActiveFilters(prev => ({ ...prev, searchTerm }));
  };

  const setProviderFilter = (provider: string) => {
    setCurrentPage(1); 
    setActiveFilters(prev => ({ ...prev, provider, searchTerm: '', category: '' })); 
  };
  const setCategoryFilter = (category: string) => {
    setCurrentPage(1); 
    setActiveFilters(prev => ({ ...prev, category, searchTerm: '', provider: '' })); 
  };
  const setSortBy = (sortBy: string) => {
    setCurrentPage(1); 
    setActiveFilters(prev => ({ ...prev, sortBy }));
  };

  const contextValue: GameContextType = {
    games: allGames,
    filteredGames: filteredGamesState, 
    providers: providersData,
    categories: categories,
    isLoading: isLoadingGamesHook || isLoadingProvidersHook || isLoadingCategories,
    isLoadingMore,
    hasMore: hasMoreState,
    error: gamesError || null,
    activeFilters,
    favoriteGameIds,
    getGameById,
    getGameBySlug,
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

  return <GamesContext.Provider value={contextValue}>{children}</GamesContext.Provider>;
};

export const useGames = (): GameContextType => {
  const context = useContext(GamesContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GamesProvider');
  }
  return context;
};
