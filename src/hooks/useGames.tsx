import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Game, GameLaunchOptions, GameCategory, GameProvider, DbGame, GameTag, GameStatusEnum } from '@/types/game';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { convertDbGameToGame, convertGameToDbGame } from '@/utils/gameTypeAdapter'; // Ensure these are robust
import {游戏Provider} from "@/services/gameService"; //This import seems to have a typo "游戏Provider"

// Define the shape of the context
interface GamesContextType {
  games: Game[];
  categories: GameCategory[];
  providers: GameProvider[];
  favoriteGameIds: string[];
  fetchGames: (filters?: any, page?: number, limit?: number) => Promise<{ games: Game[], totalCount: number }>;
  fetchGameBySlug: (slug: string) => Promise<Game | null>;
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

  // Pagination and load more state
  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage] = useState(20); // Configurable
  const [totalGamesCount, setTotalGamesCount] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<any>({});


  const fetchGames = useCallback(async (filters: any = {}, page: number = 1, limit: number = gamesPerPage) => {
    setIsLoadingGames(true);
    console.log('fetchGames called with filters:', filters, 'page:', page, 'limit:', limit);
    try {
      let query = supabase.from('games').select(`
        *,
        game_providers:providers!inner(id, name, slug, logo_url, is_active),
        game_categories:categories!inner(id, name, slug)
      `, { count: 'exact' });

      if (filters.provider_slug) query = query.eq('provider_slug', filters.provider_slug);
      if (filters.category_slug) query = query.eq('category_slugs', filters.category_slug); // This needs to be an array containment check: cs.{slug}
      if (filters.searchTerm) query = query.ilike('title', `%${filters.searchTerm}%`);
      if (filters.is_featured) query = query.is('is_featured', true);
      if (filters.status) query = query.eq('status', filters.status);
      else query = query.eq('status', GameStatusEnum.ACTIVE); // Default to active games


      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);
      query = query.order('title', { ascending: true }); // Default order

      const { data: rawGames, error, count } = await query;

      if (error) {
        console.error('Error fetching games:', error);
        toast.error(`Failed to load games: ${error.message}`);
        return { games: [], totalCount: 0 };
      }
      
      const fetchedGames = rawGames ? rawGames.map(convertDbGameToGame) : [];
      console.log('Fetched games raw:', rawGames);
      console.log('Fetched games converted:', fetchedGames);
      
      // For pagination and load more
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
          game_providers:providers!inner(id, name, slug, logo_url, is_active),
          game_categories:categories!inner(id, name, slug)
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          toast.info(`Game with slug "${slug}" not found.`);
          return null;
        }
        throw error;
      }
      return data ? convertDbGameToGame(data as DbGame) : null;
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
      const { data, error } = await supabase.from('categories').select('*').eq('is_active', true);
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast.error("Failed to load game categories: " + error.message);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchProviders = async () => {
    setIsLoadingProviders(true);
    try {
      // Corrected table name from 'game_providers' to 'providers'
      const { data, error } = await supabase.from('providers').select('*').eq('is_active', true);
      if (error) throw error;
      // Assuming the data structure matches GameProvider type
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
    
    // This is a placeholder. Integration with a game aggregator or provider API is needed.
    // For example, call a Supabase Edge Function that handles game launching.
    try {
      // const { data, error } = await supabase.functions.invoke('launch-game', {
      //   body: { gameId: game.id, mode: options.mode, playerId: user?.id }
      // });
      // if (error) throw error;
      // return data.launchUrl;
      
      // Mock launch URL for now
      const demoUrl = game.meta?.find(m => m.key === 'demo_url')?.value;
      const realUrl = game.meta?.find(m => m.key === 'real_url')?.value; // Or construct from game_code/provider
      let launchUrl = options.mode === 'demo' ? demoUrl : realUrl;

      if (!launchUrl && game.game_id && game.provider_slug) {
          // Fallback or default launch mechanism if specific URLs aren't in meta
          // This might involve calling a service like PragmaticPlayService or a generic aggregator service
          // For demonstration, constructing a placeholder URL:
          launchUrl = `/api/games/launch?game_id=${game.game_id}&provider=${game.provider_slug}&mode=${options.mode}${user?.id ? `&player_id=${user.id}` : ''}`;
          console.warn(`Using constructed launch URL for ${game.title}: ${launchUrl}`);
      }


      if (launchUrl) {
        toast.success(`Launching ${game.title}...`);
        return launchUrl;
      } else {
        toast.error(`Could not find launch URL for ${game.title} in ${options.mode} mode.`);
        // Try navigating to game detail page as fallback
        // navigate(`/casino/game/${game.slug || game.id}`);
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
      // Remove from favorites
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
      // Add to favorites
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
          setFavoriteGameIds(data.map(fav => fav.game_id));
        }
      };
      fetchFavorites();
    } else {
      setFavoriteGameIds([]); // Clear favorites if user logs out
    }
  }, [isAuthenticated, user]);
  
  const getGamesByCategory = (categorySlug: string): Game[] => {
    return games.filter(game => game.category_slugs?.includes(categorySlug));
  };

  const getGamesByProvider = (providerSlug: string): Game[] => {
    return games.filter(game => game.provider_slug === providerSlug);
  };

  const searchGames = async (searchTerm: string): Promise<Game[]> => {
    if (!searchTerm.trim()) return games; // Return all if search is empty, or an empty array
    
    setIsLoadingGames(true);
    try {
        const { data, error } = await supabase
            .from('games')
            .select(`*, game_providers:providers!inner(*), game_categories:categories!inner(*)`) // Adjust select as needed
            .ilike('title', `%${searchTerm}%`)
            // Add other search fields if necessary: .or(`description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
            .eq('status', GameStatusEnum.ACTIVE) 
            .limit(50); // Limit search results

        if (error) throw error;
        return data ? data.map(g => convertDbGameToGame(g as DbGame)) : [];
    } catch (err: any) {
        toast.error(`Search failed: ${err.message}`);
        return [];
    } finally {
        setIsLoadingGames(false);
    }
  };


  const value = {
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

// Helper function for initial data load or specific scenarios
export const fetchInitialSiteData = async () => {
    // This is an example; adapt it to your needs for fetching essential data on app load
    // It's often better to fetch data within components using useQuery or the context's fetch methods
    try {
        const providersPromise = supabase.from('providers').select('*').eq('is_active', true);
        const categoriesPromise = supabase.from('categories').select('*').eq('is_active', true);
        // Potentially featured games, etc.

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
