// src/hooks/useGames.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Game, GameProvider, GameCategory, GameLaunchOptions, DbGame } from '@/types/game';
import gameProviderService from '@/services/gameProviderService'; 
import { toast } from 'sonner';
import { mapDbGameToGameAdapter } from '@/components/admin/GameAdapter';

interface GamesContextType {
  games: Game[];
  filteredGames: Game[]; 
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
  filterGames: (searchTerm?: string, categorySlug?: string, providerSlug?: string) => void;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

// Helper function to sanitize raw game data from Supabase, especially the 'providers' field
const sanitizeRawSupabaseGame = (rawGame: any): DbGame => {
  const sanitizedProviders = 
    rawGame.providers && 
    typeof rawGame.providers === 'object' &&
    'name' in rawGame.providers && 
    'slug' in rawGame.providers
    ? rawGame.providers
    : null;

  return {
    ...(rawGame as Omit<DbGame, 'providers'>), // Spread all properties, type assertion for clarity
    providers: sanitizedProviders as { id?: string; name: string; slug: string; } | null,
  };
};


export const GamesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteGameIds, setFavoriteGameIds] = useState<Set<string>>(new Set());

  const mapDbProviderToProviderType = (dbProvider: any): GameProvider => {
    // Assuming dbProvider matches the structure from Supabase 'providers' table
    return {
        id: dbProvider.id,
        name: dbProvider.name,
        slug: dbProvider.slug || dbProvider.name?.toLowerCase().replace(/\s+/g, '-'),
        logoUrl: dbProvider.logo || dbProvider.logo_url,
        description: dbProvider.description,
        status: dbProvider.status || 'inactive', // Align with GameProvider type
        // game_ids are usually not directly on provider, but on games linked to provider
    };
  };
  
  const mapDbCategoryToCategoryType = (dbCategory: any): GameCategory => {
    // Assuming dbCategory matches structure from Supabase 'game_categories' table
    return {
        id: dbCategory.id,
        name: dbCategory.name,
        slug: dbCategory.slug,
        icon_svg: dbCategory.icon || dbCategory.icon_svg, // map to icon_svg
        icon: dbCategory.icon || dbCategory.icon_svg, // also map to icon for compatibility
        image_url: dbCategory.image || dbCategory.image_url,
        description: dbCategory.description,
        // gameCount: dbCategory.game_count || 0, // Not in GameCategory type
        // isActive: dbCategory.status === 'active', // Not in GameCategory type, use status if needed elsewhere
    };
  };

  const fetchGamesAndProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('*, providers(id, name, slug)') 
        .eq('status', 'active'); 
        
      if (gamesError) throw gamesError;

      const mappedGames = gamesData.map(rawDbGame => mapDbGameToGameAdapter(sanitizeRawSupabaseGame(rawDbGame)));
      setGames(mappedGames);
      setFilteredGames(mappedGames);

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

  const filterGames = useCallback((searchTerm?: string, categorySlug?: string, providerSlug?: string) => {
    setIsLoading(true); 
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
  };

  const launchGame = async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    try {
      // Use provider.id if available, otherwise provider_id, then provider_slug
      const providerIdentifier = game.provider?.id || game.provider_id || game.provider_slug || (game.providerName ? providers.find(p => p.name === game.providerName)?.id : null);

      if (!providerIdentifier) {
          toast.error("Game provider information is missing.");
          return null;
      }
      const gameIdentifier = game.game_id || game.id; 
      
      const launchUrl = await gameProviderService.getLaunchUrl({
        gameId: gameIdentifier,
        providerId: providerIdentifier, 
        mode: options.mode,
        user_id: options.user_id,
        username: options.username,
        currency: options.currency,
        language: options.language,
        platform: options.platform,
        returnUrl: options.returnUrl,
        token: options.token,
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
    const cachedGame = games.find(g => String(g.id) === id);
    if (cachedGame) return cachedGame;

    try {
      const { data, error } = await supabase
        .from('games')
        .select('*, providers(id, name, slug)')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? mapDbGameToGameAdapter(sanitizeRawSupabaseGame(data)) : null;
    } catch (e: any) {
      console.error(`Error fetching game by ID ${id}:`, e);
      return null;
    }
  };

  const getGameBySlug = async (slug: string): Promise<Game | null> => {
    const cachedGame = games.find(g => g.slug === slug); // Check slug first
    if (cachedGame) return cachedGame;
    
    // Fallback to game_code if slug is often mapped to game_code
    const cachedGameByCode = games.find(g => g.game_code === slug);
    if (cachedGameByCode) return cachedGameByCode;
    
    try {
      let { data, error } = await supabase
        .from('games')
        .select('*, providers(id, name, slug)')
        .eq('slug', slug) 
        .maybeSingle();

      if (error) throw error;
      if (data) return mapDbGameToGameAdapter(sanitizeRawSupabaseGame(data));

      ({ data, error } = await supabase
        .from('games')
        .select('*, providers(id, name, slug)')
        .eq('game_code', slug) 
        .maybeSingle());
      
      if (error) throw error;
      return data ? mapDbGameToGameAdapter(sanitizeRawSupabaseGame(data)) : null;

    } catch (e: any) {
      console.error(`Error fetching game by slug/code ${slug}:`, e);
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
  }), [games, filteredGames, categories, providers, isLoading, error, favoriteGameIds, fetchGamesAndProviders, filterGames, toggleFavoriteGame, launchGame, getGameById, getGameBySlug]);

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
