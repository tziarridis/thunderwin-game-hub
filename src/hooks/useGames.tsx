
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { Game, GameLaunchOptions, GameCategory, GameProvider } from '@/types'; // Ensure all types are imported
import { gameService } from '@/services/gameService'; 
import { pragmaticPlayService } from '@/services/providers/pragmaticPlayService'; // Assuming this service path is correct
import { supabase } from '@/integrations/supabase/client'; 
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext'; 
import gameProviderService from '@/services/gameProviderService'; // Import the new service

const getGameIdString = (gameId: string | number | undefined): string => {
  if (gameId === undefined) return '';
  return String(gameId);
};

interface GamesContextType {
  games: Game[];
  isLoading: boolean;
  error: Error | null;
  categories: GameCategory[]; // Typed categories
  providers: GameProvider[];   // Typed providers
  fetchGamesAndProviders: (filter?: any) => Promise<void>; // Renamed for clarity
  getGameById: (id: string) => Promise<Game | null>;
  getGameBySlug: (slug: string) => Promise<Game | null>;
  favoriteGameIds: Set<string>;
  toggleFavoriteGame: (gameId: string) => Promise<void>;
  launchGame: (game: Game, options: Omit<GameLaunchOptions, 'user_id' | 'username' | 'currency' | 'language'> & Partial<Pick<GameLaunchOptions, 'user_id' | 'username' | 'currency' | 'language'>>) => Promise<string | null>;
  // fetchGameLaunchUrl: (game: Game, options: GameLaunchOptions) => Promise<string | null>; // This seems redundant if launchGame uses gameProviderService
  
  // For Slots.tsx and potentially other filtered views
  filteredGames: Game[];
  filterGames: (searchTerm?: string, categorySlug?: string, providerSlug?: string) => void;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export const GamesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allGames, setAllGames] = useState<Game[]>([]); // Store all fetched games
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [providers, setProviders] = useState<GameProvider[]>([]);
  
  const [favoriteGameIds, setFavoriteGameIds] = useState<Set<string>>(new Set());
  const { user, isAuthenticated } = useAuth();

  // State for filtering
  const [currentSearchTerm, setCurrentSearchTerm] = useState<string | undefined>();
  const [currentCategorySlug, setCurrentCategorySlug] = useState<string | undefined>();
  const [currentProviderSlug, setCurrentProviderSlug] = useState<string | undefined>();


  const fetchGamesAndProviders = useCallback(async (filter?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch games
      const { games: fetchedGames, count } = await gameService.getAllGames({ ...filter, limit: 200 }); // Fetch more games initially or implement pagination
      setAllGames(fetchedGames);

      // Derive categories and providers from fetched games and gameProviderService
      const uniqueCategoriesMap = new Map<string, GameCategory>();
      fetchedGames.forEach(game => {
        const slugs = Array.isArray(game.category_slugs) ? game.category_slugs : (typeof game.category_slugs === 'string' ? [game.category_slugs] : []);
        slugs.forEach(slug => {
          if (slug && !uniqueCategoriesMap.has(slug)) {
            uniqueCategoriesMap.set(slug, { 
              id: slug, 
              slug: slug, 
              name: game.categoryName || slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '), // Basic name generation
              // game_count: 1 // Initialize, can be aggregated later
            });
          }
          // else if (slug) {
          //   const cat = uniqueCategoriesMap.get(slug)!;
          //   cat.game_count = (cat.game_count || 0) + 1;
          // }
        });
      });
      setCategories(Array.from(uniqueCategoriesMap.values()));

      // Fetch providers from gameProviderService (or map from games if service doesn't list them)
      // This part needs to align with how providers are managed. If `gameService` fetches providers, use that.
      // For now, deriving from games:
      const uniqueProvidersMap = new Map<string, GameProvider>();
      fetchedGames.forEach(game => {
        if (game.provider_slug && !uniqueProvidersMap.has(game.provider_slug)) {
          uniqueProvidersMap.set(game.provider_slug, {
            id: game.provider_id || game.provider_slug,
            slug: game.provider_slug,
            name: game.providerName || game.provider_slug,
            logoUrl: undefined, // Fetch separately or add to Game type if available
            // game_count: 1
          });
        }
        // else if (game.provider_slug) {
        //    const prov = uniqueProvidersMap.get(game.provider_slug)!;
        //    prov.game_count = (prov.game_count || 0) + 1;
        // }
      });
       // TODO: Better provider fetching, e.g., from a dedicated providerService or gameProviderService list
      const dbProviders = await supabase.from('providers').select('id, name, slug, logo_url, status').eq('status', 'active'); // Assuming logo_url field
        if (dbProviders.data) {
            setProviders(dbProviders.data.map(p => ({
                id: p.id,
                name: p.name,
                slug: p.slug || p.name.toLowerCase().replace(/\s+/g, '-'),
                logoUrl: p.logo_url || undefined, // map logo_url
                status: p.status as GameProvider['status']
            })));
        } else {
             setProviders(Array.from(uniqueProvidersMap.values())); // Fallback
        }


    } catch (err: any) {
      setError(err);
      toast.error("Failed to load games and providers: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFavorites = useCallback(async () => {
    if (!user?.id) {
      setFavoriteGameIds(new Set()); 
      return;
    }
    // setIsLoading(true); // Potentially set sub-loading for favorites
    try {
      const { data, error: favError } = await supabase
        .from('favorite_games')
        .select('game_id')
        .eq('user_id', user.id);

      if (favError) throw favError;
      setFavoriteGameIds(new Set(data.map(fav => getGameIdString(fav.game_id))));
    } catch (err: any) {
      console.error("Error fetching favorites:", err);
      // toast.error("Could not load your favorite games.");
    } finally {
      // setIsLoading(false);
    }
  }, [user?.id]);


  useEffect(() => {
    fetchGamesAndProviders(); 
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavoriteGameIds(new Set()); 
    }
  }, [fetchGamesAndProviders, isAuthenticated, fetchFavorites]); // fetchGamesAndProviders is the correct dependency
  
  // Re-fetch favorites if user changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchFavorites();
    } else if (!isAuthenticated) {
      setFavoriteGameIds(new Set());
    }
  }, [user?.id, isAuthenticated, fetchFavorites]);


  const getGameById = async (id: string): Promise<Game | null> => {
    const localGame = allGames.find(g => getGameIdString(g.id) === id || getGameIdString(g.game_id) === id || getGameIdString(g.game_code) === id);
    if (localGame) return localGame;
    // setIsLoading(true); // Potentially set sub-loading
    try {
      const game = await gameService.getGameById(id);
      // setIsLoading(false);
      return game;
    } catch (err) {
      // setIsLoading(false);
      console.error(`Error fetching game by ID ${id}:`, err);
      return null;
    }
  };

  const getGameBySlug = async (slug: string): Promise<Game | null> => {
    const localGame = allGames.find(g => g.slug === slug);
    if (localGame) return localGame;
    // setIsLoading(true);
    try {
      const game = await gameService.getGameBySlug(slug); 
      // setIsLoading(false);
      return game;
    } catch (err) {
      // setIsLoading(false);
      console.error(`Error fetching game by slug ${slug}:`, err);
      return null;
    }
  };

  const toggleFavoriteGame = async (gameId: string) => {
    if (!user?.id) {
      toast.error("Please log in to add favorites.");
      return;
    }
    const gameIdStr = getGameIdString(gameId);
    if (!gameIdStr) {
        toast.error("Invalid game identifier for favorite toggle.");
        return;
    }

    const isCurrentlyFavorite = favoriteGameIds.has(gameIdStr);
    
    try {
      if (isCurrentlyFavorite) {
        const { error: deleteError } = await supabase
          .from('favorite_games')
          .delete()
          .match({ user_id: user.id, game_id: gameIdStr });
        if (deleteError) throw deleteError;
        setFavoriteGameIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(gameIdStr);
          return newSet;
        });
        toast.success("Removed from favorites");
      } else {
        const { error: insertError } = await supabase
          .from('favorite_games')
          .insert({ user_id: user.id, game_id: gameIdStr });
        if (insertError) throw insertError;
        setFavoriteGameIds(prev => new Set(prev).add(gameIdStr));
        toast.success("Added to favorites");
      }
    } catch (err: any) {
      toast.error(`Failed to update favorites: ${err.message}`);
    }
  };
  
  const launchGame = async (
    game: Game, 
    options: Omit<GameLaunchOptions, 'user_id' | 'username' | 'currency' | 'language'> & Partial<Pick<GameLaunchOptions, 'user_id' | 'username' | 'currency' | 'language'>>
  ): Promise<string | null> => {
    if (options.mode === 'real' && !isAuthenticated) {
      toast.error("Please log in to play for real money.");
      return null;
    }

    const fullOptions: GameLaunchOptions = {
      ...options,
      user_id: options.mode === 'real' && user ? user.id : undefined,
      username: options.mode === 'real' && user ? (user.user_metadata?.username || user.email?.split('@')[0]) : 'demo_player',
      currency: options.mode === 'real' && user ? (user.user_metadata?.currency || 'USD') : (options.currency || 'USD'),
      language: options.mode === 'real' && user ? (user.user_metadata?.language || 'en') : (options.language || 'en'),
      platform: options.platform || 'web',
    };
    
    if (!game.game_id) {
        toast.error(`Game ID missing for ${game.title}. Cannot launch.`);
        return null;
    }

    try {
      // Use gameProviderService for launching games
      // The providerId for getLaunchUrl should match the key used in gameProviderService (e.g., 'ppeur', 'gitslotpark')
      // This needs to be mapped from game.provider_slug or game.provider_id
      const providerIdentifier = game.provider_slug || String(game.provider_id); // This needs to be the ID gameProviderService expects

      const url = await gameProviderService.getLaunchUrl({
        gameId: game.game_id, // game_id is the external ID
        providerId: providerIdentifier, // Pass the provider's identifier
        ...fullOptions,
      });
      return url;
    } catch (err: any) {
      console.error("Error launching game via gameProviderService:", err);
      toast.error(`Could not launch ${game.title}: ${err.message}`);
      return null;
    }
  };

  const filterGames = useCallback((searchTerm?: string, categorySlug?: string, providerSlug?: string) => {
    setCurrentSearchTerm(searchTerm);
    setCurrentCategorySlug(categorySlug);
    setCurrentProviderSlug(providerSlug);
  }, []);

  const filteredGames = useMemo(() => {
    let gamesToFilter = allGames;
    if (currentSearchTerm) {
      gamesToFilter = gamesToFilter.filter(game => game.title.toLowerCase().includes(currentSearchTerm.toLowerCase()));
    }
    if (currentCategorySlug) {
      gamesToFilter = gamesToFilter.filter(game => 
        (Array.isArray(game.category_slugs) && game.category_slugs.includes(currentCategorySlug)) ||
        (typeof game.category_slugs === 'string' && game.category_slugs === currentCategorySlug) ||
        game.categoryName === currentCategorySlug // Fallback if slug isn't primary key
      );
    }
    if (currentProviderSlug) {
      gamesToFilter = gamesToFilter.filter(game => game.provider_slug === currentProviderSlug || game.providerName === currentProviderSlug);
    }
    return gamesToFilter;
  }, [allGames, currentSearchTerm, currentCategorySlug, currentProviderSlug]);


  return (
    <GamesContext.Provider value={{ 
        games: allGames, // Provide all games as 'games'
        isLoading, 
        error, 
        categories, 
        providers, 
        fetchGamesAndProviders, 
        getGameById, 
        getGameBySlug,
        favoriteGameIds,
        toggleFavoriteGame,
        launchGame,
        // fetchGameLaunchUrl: launchGame, // Can alias launchGame for this if desired, or remove fetchGameLaunchUrl if gameProviderService is sole launcher
        filteredGames,
        filterGames,
    }}>
      {children}
    </GamesContext.Provider>
  );
};

export const useGames = () => {
  const context = useContext(GamesContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GamesProvider');
  }
  return context;
};

