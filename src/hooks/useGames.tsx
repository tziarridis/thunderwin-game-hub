import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Game, GameLaunchOptions, GameCategory, GameProvider, DbGame, GameStatusEnum, GameContextType, GameStatus } from '@/types/game'; // GameContextType from game.ts
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { convertDbGameToGame } from '@/utils/gameTypeAdapter'; // Assuming convertGameToDbGame and slugify are also here

// Create the context with the updated GameContextType from src/types/game.ts
const GamesContext = createContext<GameContextType | undefined>(undefined);

// Create a provider component
export const GamesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [favoriteGameIds, setFavoriteGameIds] = useState<string[]>([]);
  
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage] = useState(20); // Default games per page
  const [totalGamesCount, setTotalGamesCount] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<any>({});

  const fetchGames = useCallback(async (filters: any = {}, page: number = 1, limit: number = gamesPerPage) => {
    setIsLoadingGames(true);
    console.log('fetchGames called with filters:', filters, 'page:', page, 'limit:', limit);
    try {
      let query = supabase.from('games').select(`
        *,
        game_providers:providers!inner(id, name, slug, logo, is_active), 
        game_categories:game_categories!inner(id, name, slug, image)
      `, { count: 'exact' });
      // Note: Using !inner will filter out games that don't have a matching provider/category. 
      // Use !left if you want to include games even if their provider/category is missing/inactive.
      // For now, assuming `providers` table has `slug`, `logo`, `is_active`.
      // And `game_categories` table has `slug`, `image`.

      if (filters.provider_slug) query = query.eq('provider_slug', filters.provider_slug);
      
      // Assuming 'category_slugs' is a text[] column in 'games' table storing an array of category slugs
      if (filters.category_slug) {
        query = query.filter('category_slugs', 'cs', `{${filters.category_slug}}`);
      }
      if (filters.searchTerm) query = query.ilike('title', `%${filters.searchTerm}%`);
      if (filters.is_featured !== undefined) query = query.is('is_featured', filters.is_featured);
      
      if (filters.status) {
        query = query.eq('status', filters.status as GameStatus);
      } else {
        // Default to fetching active games if no status filter is provided
        query = query.eq('status', GameStatusEnum.ACTIVE);
      }

      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);
      query = query.order('title', { ascending: true }); // Example ordering

      const { data: rawGames, error, count } = await query;

      if (error) {
        console.error('Error fetching games:', error);
        toast.error(`Failed to load games: ${error.message}`);
        return { games: [], totalCount: 0 };
      }
      
      const fetchedGames = rawGames ? rawGames.map(g => convertDbGameToGame(g as unknown as DbGame)) : [];
      console.log('Fetched games raw:', rawGames);
      console.log('Fetched games converted:', fetchedGames);
      
      if (page === 1) {
        setGames(fetchedGames);
      } else {
        // Append if loading more
        setGames(prev => [...prev, ...fetchedGames]);
      }
      setTotalGamesCount(count || 0);
      setCurrentPage(page);
      setCurrentFilters(filters); // Store current filters for loadMore

      return { games: fetchedGames, totalCount: count || 0 };

    } catch (err: any) {
      console.error("Error in fetchGames:", err);
      toast.error("An unexpected error occurred while fetching games.");
      return { games: [], totalCount: 0 };
    } finally {
      setIsLoadingGames(false);
    }
  }, [gamesPerPage]);

  const loadMoreGames = useCallback(async () => {
    if (isLoadingGames || games.length >= totalGamesCount) return;
    // Use currentFilters and increment currentPage
    await fetchGames(currentFilters, currentPage + 1, gamesPerPage);
  }, [isLoadingGames, games.length, totalGamesCount, fetchGames, currentFilters, currentPage, gamesPerPage]);


  const fetchGameBySlug = async (slug: string): Promise<Game | null> => {
    setIsLoadingGames(true);
    try {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          game_providers:providers!left(id, name, slug, logo, is_active),
          game_categories:game_categories!left(id, name, slug, image)
        `)
        .eq('slug', slug)
        .maybeSingle(); 

      if (error && error.code !== 'PGRST116') { 
        console.error('Error fetching game by slug:', error);
        toast.error(`Error fetching game ${slug}: ${error.message}`);
        return null;
      }
      return data ? convertDbGameToGame(data as unknown as DbGame) : null;
    } catch (error: any) {
      toast.error(`Error fetching game ${slug}: ${error.message}`);
      return null;
    } finally {
      setIsLoadingGames(false);
    }
  };
  
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      // Assuming 'game_categories' table has 'slug' and 'image' (not image_url)
      const { data, error } = await supabase.from('game_categories').select('id, name, slug, image, icon, status').eq('status', 'active');
      if (error) throw error;
      setCategories((data as GameCategory[]) || []);
    } catch (error: any) {
      toast.error("Failed to load game categories: " + error.message);
      setCategories([]); // Set to empty array on error
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchProviders = async () => {
    setIsLoadingProviders(true);
    try {
      // Assuming 'providers' table has 'slug', 'logo' (not logo_url), and 'is_active'
      const { data, error } = await supabase.from('providers').select('id, name, slug, logo, is_active').eq('is_active', true);
      if (error) throw error;
      setProviders((data as GameProvider[]) || []);
    } catch (error: any) {
      toast.error("Failed to load game providers: " + error.message);
      setProviders([]); // Set to empty array on error
    } finally {
      setIsLoadingProviders(false);
    }
  };
  
  const getGameLaunchUrl = async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    console.log(`Context: getGameLaunchUrl for ${game.title} with options:`, options);
    // This is a placeholder implementation. Actual implementation might call an API or use game.meta.
    // For now, mirroring the logic that was in the old launchGame function.
    if (!isAuthenticated && options.mode === 'real') {
      toast.error("Please log in to play for real money.");
      return null;
    }
    
    const demoUrl = game.meta?.find(m => m.key === 'demo_url')?.value;
    const realUrl = game.meta?.find(m => m.key === 'real_url')?.value;
    let launchUrl = options.mode === 'demo' ? demoUrl : realUrl;

    if (!launchUrl && game.game_id && game.provider_slug) {
        // Fallback to constructing a URL (if your backend handles this route)
        launchUrl = `/api/games/launch?game_id=${game.game_id}&provider=${game.provider_slug}&mode=${options.mode}${user?.id ? `&player_id=${user.id}` : ''}`;
        console.warn(`Using constructed launch URL for ${game.title}: ${launchUrl}`);
    }

    if (launchUrl) {
      return launchUrl;
    } else {
      toast.error(`Could not find launch URL for ${game.title} in ${options.mode} mode.`);
      return null;
    }
  };

  const launchGame = async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    console.log(`Context: launchGame (main action) for: ${game.title} with options:`, options);
    const url = await getGameLaunchUrl(game, options);
    if (url) {
      toast.success(`Launching ${game.title}...`);
      // Actual window opening or navigation should be handled by the component calling this.
      // This function now primarily resolves the URL.
    }
    // Errors are handled by getGameLaunchUrl or the calling component.
    return url;
  };

  const toggleFavoriteGame = async (gameId: string) => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to manage favorites.");
      return;
    }
    const isCurrentlyFavorite = favoriteGameIds.includes(gameId);
    if (isCurrentlyFavorite) {
      const { error } = await supabase
        .from('favorite_games')
        .delete()
        .match({ user_id: user.id, game_id: gameId });
      if (error) {
        toast.error("Failed to remove from favorites: " + error.message);
      } else {
        setFavoriteGameIds(prev => prev.filter(id => id !== gameId));
        toast.success("Removed from favorites.");
      }
    } else {
      const { error } = await supabase
        .from('favorite_games')
        .insert({ user_id: user.id, game_id: gameId });
      if (error) {
        toast.error("Failed to add to favorites: " + error.message);
      } else {
        setFavoriteGameIds(prev => [...prev, gameId]);
        toast.success("Added to favorites!");
      }
    }
  };

  const isFavorite = (gameId: string) => favoriteGameIds.includes(gameId);

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchFavorites = async () => {
        const { data, error } = await supabase
          .from('favorite_games')
          .select('game_id')
          .eq('user_id', user.id);
        if (error) {
          console.error("Error fetching favorites:", error);
        } else {
          setFavoriteGameIds(data.map(fav => fav.game_id as string));
        }
      };
      fetchFavorites();
    } else {
      setFavoriteGameIds([]);
    }
  }, [isAuthenticated, user]);

  const getGamesByCategory = (categorySlug: string): Game[] => {
    return games.filter(game => game.category_slugs?.includes(categorySlug) && game.status === GameStatusEnum.ACTIVE);
  };

  const getGamesByProvider = (providerSlug: string): Game[] => {
    return games.filter(game => game.provider_slug === providerSlug && game.status === GameStatusEnum.ACTIVE);
  };

  const searchGames = async (searchTerm: string): Promise<Game[]> => {
    if (!searchTerm.trim()) { // If search term is empty, return all currently loaded active games
        return games.filter(g => g.status === GameStatusEnum.ACTIVE);
    }
    
    // For actual search against DB, use fetchGames with searchTerm filter
    const { games: searchedGames } = await fetchGames({ searchTerm, status: GameStatusEnum.ACTIVE }, 1, 50); // Limit search results
    return searchedGames;
  };

  const getFeaturedGames = async (count: number = 10): Promise<Game[]> => {
    const { games: featured } = await fetchGames({ is_featured: true, status: GameStatusEnum.ACTIVE }, 1, count);
    return featured;
  };
  
  const getGameById = (id: string): Game | undefined => games.find(g => g.id === id);

  // Basic implementations for context methods that components might expect
  const handleGameDetails = (game: Game) => {
    // Typically navigates to a game detail page
    // This requires useNavigate, so components might handle navigation themselves
    // or this context could be enhanced to accept a navigate function during init.
    console.log("handleGameDetails called for:", game.title);
    toast.info(`Displaying details for ${game.title}. (Navigation not implemented in context)`);
    // Example: navigate(`/casino/game/${game.slug || game.id}`);
  };

  const handlePlayGame = async (game: Game, mode: 'real' | 'demo') => {
    console.log(`handlePlayGame called for ${game.title}, mode: ${mode}`);
    const url = await launchGame(game, { mode });
    if (url) {
      // This part is tricky for a context, as it involves side effects like window.open
      // Components might prefer to call launchGame and then handle the URL themselves.
      // For now, let's keep it simple.
      window.open(url, '_blank'); 
    }
  };

  const value: GameContextType = {
    games,
    categories,
    providers,
    favoriteGameIds,
    isAuthenticated, // Added
    fetchGames,
    fetchGameBySlug,
    fetchCategories,
    fetchProviders,
    launchGame,
    getGameLaunchUrl, // Added
    toggleFavoriteGame,
    isFavorite,
    isLoadingGames,
    isLoadingCategories,
    isLoadingProviders,
    getGamesByCategory,
    getGamesByProvider,
    loadMoreGames,
    hasMoreGames: games.length < totalGamesCount,
    searchGames,
    getFeaturedGames,
    getGameById,
    handleGameDetails, // Added
    handlePlayGame, // Added
  };

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>;
};

// Custom hook to use the context
export const useGames = () => {
  const context = useContext(GamesContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GamesProvider');
  }
  return context;
};

// fetchInitialSiteData remains largely the same, but ensure select statements are correct
export const fetchInitialSiteData = async () => {
    try {
        // Ensure these select statements match your actual DB columns and desired types
        const providersPromise = supabase.from('providers').select('id, name, slug, logo, is_active').eq('is_active', true);
        const categoriesPromise = supabase.from('game_categories').select('id, name, slug, image, icon, status').eq('status', 'active');
        
        const [{data: providersData, error: providersError}, {data: categoriesData, error: categoriesError}] = await Promise.all([providersPromise, categoriesPromise]);

        if (providersError) throw providersError;
        if (categoriesError) throw categoriesError;

        return {
            providers: (providersData as GameProvider[]) || [],
            categories: (categoriesData as GameCategory[]) || [],
        };
    } catch (error: any) {
        console.error("Error fetching initial site data:", error);
        toast.error("Could not load essential site data: " + error.message);
        return { providers: [], categories: [] };
    }
};
