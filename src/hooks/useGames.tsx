import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Game, GameLaunchOptions, GameCategory, GameProvider, DbGame, GameTag, GameStatusEnum, GameContextType as OriginalGameContextType, GameStatus } from '@/types/game';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { convertDbGameToGame, convertGameToDbGame, slugify } from '@/utils/gameTypeAdapter'; 
// Corrected: Removed Chinese character import. Assuming gameService might not be used directly here or needs a proper import if used.
// import { gameService } from "@/services/gameService"; 

// Define the shape of the context, ensuring it matches what components expect
// This merges OriginalGameContextType with what's actually provided by this hook
interface GamesContextType extends Omit<OriginalGameContextType, 'filteredGames' | 'isLoading' | 'isLoadingMore' | 'hasMore' | 'error' | 'activeFilters' | 'getGameById' | 'getGameBySlug' | 'setSearchTerm' | 'setProviderFilter' | 'setCategoryFilter' | 'setSortBy' | 'getGameLaunchUrl' | 'fetchGameDetails' | 'handleGameDetails' | 'handlePlayGame' | 'addGame' | 'updateGame' | 'deleteGame' | 'uploadGameImage'> {
  games: Game[];
  categories: GameCategory[];
  providers: GameProvider[];
  favoriteGameIds: string[]; // Changed from Set<string> to string[] for easier state management
  fetchGames: (filters?: any, page?: number, limit?: number) => Promise<{ games: Game[], totalCount: number }>;
  fetchGameBySlug: (slug: string) => Promise<Game | null>; // Added
  fetchCategories: () => Promise<void>;
  fetchProviders: () => Promise<void>;
  launchGame: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  toggleFavoriteGame: (gameId: string) => Promise<void>;
  isFavorite: (gameId: string) => boolean;
  isLoadingGames: boolean;
  isLoadingCategories: boolean;
  isLoadingProviders: boolean;
  getGamesByCategory: (categorySlug: string) => Game[];
  getGamesByProvider: (providerSlug: string) => Game[];
  loadMoreGames?: () => void;
  hasMoreGames?: boolean;
  searchGames: (searchTerm: string) => Promise<Game[]>;
  getFeaturedGames: (count?: number) => Promise<Game[]>; // Added
  // Added placeholder for methods that might be used by AdminGamesPage or other components
  // These would need full implementations if truly part of this context's responsibility
  getGameById?: (id: string) => Game | undefined; 
  setSearchTerm?: (searchTerm: string) => void;
  setProviderFilter?: (providerSlug: string) => void;
  setCategoryFilter?: (categorySlug: string) => void;
  setSortBy?: (sortBy: string) => void;
  fetchGameDetails?: (gameIdOrSlug: string) => Promise<Game | null>;
  getGameLaunchUrl?: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  handleGameDetails?: (game: Game) => void;
  handlePlayGame?: (game: Game, mode: 'real' | 'demo') => void;
}


// Create the context
const GamesContext = createContext<GamesContextType | undefined>(undefined);

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
  const [gamesPerPage] = useState(20);
  const [totalGamesCount, setTotalGamesCount] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<any>({});


  const fetchGames = useCallback(async (filters: any = {}, page: number = 1, limit: number = gamesPerPage) => {
    setIsLoadingGames(true);
    console.log('fetchGames called with filters:', filters, 'page:', page, 'limit:', limit);
    try {
      let query = supabase.from('games').select(`
        *,
        game_providers:providers!left(id, name, slug, logo_url, is_active),
        game_categories:game_categories!left(id, name, slug)
      `, { count: 'exact' });


      if (filters.provider_slug) query = query.eq('provider_slug', filters.provider_slug);
      // For category_slugs, it should be an array containment check if 'category_slugs' is an array column in DB
      // Assuming 'category_slugs' is an array text[]
      if (filters.category_slug) query = query.cs('category_slugs', `{${filters.category_slug}}`);
      if (filters.searchTerm) query = query.ilike('title', `%${filters.searchTerm}%`);
      if (filters.is_featured) query = query.is('is_featured', true);
      
      if (filters.status) {
        query = query.eq('status', filters.status as GameStatus);
      } else {
        query = query.eq('status', GameStatusEnum.ACTIVE);
      }


      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);
      query = query.order('title', { ascending: true });

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
        setGames(prev => [...prev, ...fetchedGames]);
      }
      setTotalGamesCount(count || 0);
      setCurrentPage(page);
      setCurrentFilters(filters);

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
    await fetchGames(currentFilters, currentPage + 1, gamesPerPage);
  }, [isLoadingGames, games.length, totalGamesCount, fetchGames, currentFilters, currentPage, gamesPerPage]);


  const fetchGameBySlug = async (slug: string): Promise<Game | null> => {
    setIsLoadingGames(true);
    try {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          game_providers:providers!left(id, name, slug, logo_url, is_active),
          game_categories:game_categories!left(id, name, slug)
        `)
        .eq('slug', slug)
        .maybeSingle(); // Use maybeSingle to handle not found gracefully

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine for maybeSingle
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
      // Corrected table name and ensure 'slug' is selected
      const { data, error } = await supabase.from('game_categories').select('id, name, slug, image_url, icon, status').eq('status', 'active');
      if (error) throw error;
      setCategories(data as GameCategory[] || []);
    } catch (error: any) {
      toast.error("Failed to load game categories: " + error.message);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchProviders = async () => {
    setIsLoadingProviders(true);
    try {
      // Ensure 'slug' is selected
      const { data, error } = await supabase.from('providers').select('id, name, slug, logo_url, is_active').eq('is_active', true);
      if (error) throw error;
      setProviders((data as GameProvider[]) || []);
    } catch (error: any) {
      toast.error("Failed to load game providers: " + error.message);
    } finally {
      setIsLoadingProviders(false);
    }
  };
  
  const launchGame = async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    console.log(`Attempting to launch game: ${game.title} with options:`, options);
    if (!isAuthenticated && options.mode === 'real') {
      toast.error("Please log in to play for real money.");
      return null;
    }
    
    try {
      const demoUrl = game.meta?.find(m => m.key === 'demo_url')?.value;
      const realUrl = game.meta?.find(m => m.key === 'real_url')?.value;
      let launchUrl = options.mode === 'demo' ? demoUrl : realUrl;

      if (!launchUrl && game.game_id && game.provider_slug) {
          launchUrl = `/api/games/launch?game_id=${game.game_id}&provider=${game.provider_slug}&mode=${options.mode}${user?.id ? `&player_id=${user.id}` : ''}`;
          console.warn(`Using constructed launch URL for ${game.title}: ${launchUrl}`);
      }

      if (launchUrl) {
        toast.success(`Launching ${game.title}...`);
        return launchUrl;
      } else {
        toast.error(`Could not find launch URL for ${game.title} in ${options.mode} mode.`);
        return null;
      }
    } catch (error: any) {
      toast.error(`Failed to launch game ${game.title}: ${error.message}`);
      return null;
    }
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
    return games.filter(game => game.category_slugs?.includes(categorySlug));
  };

  const getGamesByProvider = (providerSlug: string): Game[] => {
    return games.filter(game => game.provider_slug === providerSlug);
  };

  const searchGames = async (searchTerm: string): Promise<Game[]> => {
    if (!searchTerm.trim()) return games; 
    
    setIsLoadingGames(true);
    try {
        const { data, error } = await supabase
            .from('games')
            .select(`*, game_providers:providers!left(*), game_categories:game_categories!left(*)`)
            .ilike('title', `%${searchTerm}%`)
            .eq('status', GameStatusEnum.ACTIVE) 
            .limit(50);

        if (error) throw error;
        return data ? data.map(g => convertDbGameToGame(g as unknown as DbGame)) : [];
    } catch (err: any) {
        toast.error(`Search failed: ${err.message}`);
        return [];
    } finally {
        setIsLoadingGames(false);
    }
  };

  const getFeaturedGames = async (count: number = 10): Promise<Game[]> => {
    const { games: featured, totalCount } = await fetchGames({ is_featured: true, status: GameStatusEnum.ACTIVE }, 1, count);
    return featured;
  };

  // Placeholder implementations for other context methods if needed
  const getGameById = (id: string): Game | undefined => games.find(g => g.id === id);

  const value: GamesContextType = {
    games,
    categories,
    providers,
    favoriteGameIds,
    fetchGames,
    fetchGameBySlug,
    fetchCategories,
    fetchProviders,
    launchGame,
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
    getFeaturedGames, // Added
    getGameById, // Added placeholder
  };

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>;
};

// Create a custom hook to use the context
export const useGames = () => {
  const context = useContext(GamesContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GamesProvider');
  }
  return context;
};

export const fetchInitialSiteData = async () => {
    try {
        const providersPromise = supabase.from('providers').select('id, name, slug, logo_url, is_active').eq('is_active', true);
        const categoriesPromise = supabase.from('game_categories').select('id, name, slug, image_url, icon, status').eq('status', 'active');
        
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
