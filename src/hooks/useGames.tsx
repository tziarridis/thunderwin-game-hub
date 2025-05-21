
// src/hooks/useGames.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Game, GameProvider, GameCategory, GameLaunchOptions } from '@/types';
import gameProviderService from '@/services/gameProviderService'; // For launching games
import { toast } from 'sonner';

interface GamesContextType {
  games: Game[];
  filteredGames: Game[]; // Games after applying filters
  categories: GameCategory[];
  providers: GameProvider[];
  isLoading: boolean;
  error: string | null;
  favoriteGameIds: Set<string>;
  toggleFavoriteGame: (gameId: string) => void;
  launchGame: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  getGameById: (id: string) => Promise<Game | null>;
  getGameBySlug: (slug: string) => Promise<Game | null>;
  fetchGamesAndProviders: () => Promise<void>;
  filterGames: (searchTerm?: string, categorySlug?: string, providerSlug?: string) => void; // New filter method
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export const GamesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]); // State for filtered games
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteGameIds, setFavoriteGameIds] = useState<Set<string>>(new Set());
  // TODO: Add auth context to handle user-specific favorites
  // const { user } = useAuth(); 

  const mapDbGameToGameType = (dbGame: any): Game => {
    return {
      id: dbGame.id,
      game_id: dbGame.game_id, // External game ID
      title: dbGame.game_name || dbGame.title || 'Unknown Title', // Prioritize game_name
      slug: dbGame.game_code || dbGame.slug || dbGame.id, // Prioritize game_code as slug
      description: dbGame.description || '',
      providerName: dbGame.providers?.name || dbGame.provider_name || '',
      provider_slug: dbGame.providers?.slug || dbGame.provider_slug || '',
      provider_id: dbGame.provider_id,
      categoryName: Array.isArray(dbGame.game_categories) ? dbGame.game_categories.map((c: any) => c.name).join(', ') : (dbGame.game_categories?.name || ''),
      category_slugs: Array.isArray(dbGame.game_categories) ? dbGame.game_categories.map((c: any) => c.slug) : (dbGame.game_categories?.slug ? [dbGame.game_categories.slug] : []),
      tags: dbGame.tags || [],
      rtp: typeof dbGame.rtp === 'number' ? dbGame.rtp : (parseFloat(dbGame.rtp) || undefined),
      volatility: dbGame.volatility,
      cover: dbGame.cover || dbGame.image_url,
      image: dbGame.cover || dbGame.image_url, // Ensure image is also populated
      releaseDate: dbGame.release_date || dbGame.created_at,
      isNew: dbGame.is_new || false,
      isPopular: dbGame.is_popular || false,
      is_featured: dbGame.is_featured || false,
      only_demo: dbGame.only_demo || false,
      only_real: dbGame.only_real || false, // Add only_real
      views: dbGame.views || 0,
      status: dbGame.status || 'active',
      // ... any other fields
      lines: dbGame.lines,
      features: dbGame.features || [],
      default_bet: dbGame.default_bet,
    };
  };

  const mapDbProviderToProviderType = (dbProvider: any): GameProvider => {
    return {
        id: dbProvider.id,
        name: dbProvider.name,
        slug: dbProvider.slug || dbProvider.name.toLowerCase().replace(/\s+/g, '-'),
        logoUrl: dbProvider.logo || dbProvider.logo_url,
        description: dbProvider.description,
        isActive: dbProvider.status === 'active', // Assuming 'active' means true
        game_ids: dbProvider.game_ids || [], // if available
    };
  };
  
  const mapDbCategoryToCategoryType = (dbCategory: any): GameCategory => {
    return {
        id: dbCategory.id,
        name: dbCategory.name,
        slug: dbCategory.slug,
        icon: dbCategory.icon,
        imageUrl: dbCategory.image || dbCategory.image_url,
        description: dbCategory.description,
        gameCount: dbCategory.game_count || 0, // if available
        isActive: dbCategory.status === 'active',
    };
  };

  const fetchGamesAndProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const gameQuery = supabase.from('games').select(`
        *, 
        providers (id, name, slug, logo), 
        game_categories (id, name, slug, icon)
      `); 
      // Add filters for status if needed: .eq('status', 'active')

      const { data: gamesData, error: gamesError } = await gameQuery;
      if (gamesError) throw gamesError;
      const mappedGames = gamesData.map(mapDbGameToGameType);
      setGames(mappedGames);
      setFilteredGames(mappedGames); // Initially, filteredGames are all games


      const { data: categoriesData, error: categoriesError } = await supabase.from('game_categories').select('*').eq('status', 'active');
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData.map(mapDbCategoryToCategoryType));

      const { data: providersData, error: providersError } = await supabase.from('providers').select('*').eq('status', 'active');
      if (providersError) throw providersError;
      setProviders(providersData.map(mapDbProviderToProviderType));

    } catch (e: any) {
      console.error("Failed to fetch games/meta:", e);
      setError(e.message || "Failed to load game data.");
      toast.error(e.message || "Failed to load game data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGamesAndProviders();
  }, [fetchGamesAndProviders]);

  // Method to apply filters
  const filterGames = useCallback((searchTerm?: string, categorySlug?: string, providerSlug?: string) => {
    setIsLoading(true); // Indicate loading during filtering
    let tempFilteredGames = [...games];

    if (categorySlug) {
      tempFilteredGames = tempFilteredGames.filter(game => 
        Array.isArray(game.category_slugs) && game.category_slugs.includes(categorySlug)
      );
    }

    if (providerSlug) {
      tempFilteredGames = tempFilteredGames.filter(game => game.provider_slug === providerSlug);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempFilteredGames = tempFilteredGames.filter(game =>
        (game.title && game.title.toLowerCase().includes(lowerSearchTerm)) ||
        (game.providerName && game.providerName.toLowerCase().includes(lowerSearchTerm))
      );
    }
    setFilteredGames(tempFilteredGames);
    setIsLoading(false);
  }, [games]);


  const toggleFavoriteGame = async (gameId: string) => {
    // This needs user context to persist favorites to DB
    // For now, client-side only
    setFavoriteGameIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gameId)) {
        newSet.delete(gameId);
        toast.info("Removed from favorites");
      } else {
        newSet.add(gameId);
        toast.success("Added to favorites");
      }
      return newSet;
    });
    // Example DB interaction (needs user ID):
    // if (user) {
    //   const isCurrentlyFavorite = favoriteGameIds.has(gameId);
    //   if (isCurrentlyFavorite) {
    //     await supabase.from('favorite_games').delete().match({ user_id: user.id, game_id: gameId });
    //   } else {
    //     await supabase.from('favorite_games').insert({ user_id: user.id, game_id: gameId });
    //   }
    // }
  };

  const launchGame = async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    try {
      const providerIdentifier = game.provider_id || game.provider_slug || (game.providerName ? providers.find(p => p.name === game.providerName)?.id : null);
      if (!providerIdentifier) {
          toast.error("Game provider information is missing.");
          return null;
      }
      const gameIdentifier = game.game_id || game.id; // External game ID or internal if former not present
      
      const launchUrl = await gameProviderService.getLaunchUrl({
        gameId: gameIdentifier,
        providerId: providerIdentifier, // This should be the provider's unique ID/slug for the service
        mode: options.mode,
        user_id: options.user_id,
        username: options.username,
        currency: options.currency,
        language: options.language,
        platform: options.platform,
        returnUrl: options.returnUrl,
        token: options.token, // Pass token if available
        // ... any other necessary params
      });
      
      if (launchUrl) {
        return launchUrl;
      } else {
        toast.error("Could not get game launch URL from provider service.");
        return null;
      }
    } catch (e: any) {
      console.error("Error launching game via service:", e);
      toast.error(`Launch error: ${e.message || "Unknown error"}`);
      return null;
    }
  };
  
  const getGameById = async (id: string): Promise<Game | null> => {
    // First check local cache
    const cachedGame = games.find(g => String(g.id) === id);
    if (cachedGame) return cachedGame;

    // If not in cache, fetch from DB
    try {
      const { data, error } = await supabase
        .from('games')
        .select(`*, providers (id, name, slug, logo), game_categories (id, name, slug, icon)`)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? mapDbGameToGameType(data) : null;
    } catch (e: any) {
      console.error(`Error fetching game by ID ${id}:`, e);
      return null;
    }
  };

  const getGameBySlug = async (slug: string): Promise<Game | null> => {
    const cachedGame = games.find(g => g.slug === slug);
    if (cachedGame) return cachedGame;
    
    try {
      const { data, error } = await supabase
        .from('games')
        .select(`*, providers (id, name, slug, logo), game_categories (id, name, slug, icon)`)
        .eq('game_code', slug) // Assuming slug maps to game_code
        .maybeSingle();
      if (error) throw error;
      return data ? mapDbGameToGameType(data) : null;
    } catch (e: any) {
      console.error(`Error fetching game by slug ${slug}:`, e);
      return null;
    }
  };


  const contextValue = useMemo(() => ({
    games,
    filteredGames,
    categories,
    providers,
    isLoading,
    error,
    favoriteGameIds,
    toggleFavoriteGame,
    launchGame,
    getGameById,
    getGameBySlug,
    fetchGamesAndProviders,
    filterGames,
  }), [games, filteredGames, categories, providers, isLoading, error, favoriteGameIds, fetchGamesAndProviders, filterGames]); // Added filterGames to deps

  return (
    <GamesContext.Provider value={contextValue}>
      {children}
    </GamesContext.Provider>
  );
};

export const useGames = (): GamesContextType => {
  const context = useContext(GamesContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GamesProvider');
  }
  return context;
};

