import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Game, GameLaunchOptions } from '@/types';
import { gameService } from '@/services/gameService'; 
import { pragmaticPlayService } from '@/services/providers/pragmaticPlayService';
import { supabase } from '@/integrations/supabase/client'; 
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext'; 

const getGameIdString = (gameId: string | number | undefined): string => {
  if (gameId === undefined) return '';
  return String(gameId);
};

interface GamesContextType {
  games: Game[];
  isLoading: boolean;
  error: Error | null;
  categories: string[];
  providers: string[];
  fetchGames: (filter?: any) => Promise<void>;
  getGameById: (id: string) => Promise<Game | null>;
  getGameBySlug: (slug: string) => Promise<Game | null>;
  favoriteGameIds: Set<string>;
  toggleFavoriteGame: (gameId: string) => Promise<void>;
  launchGame: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  fetchGameLaunchUrl: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export const GamesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [favoriteGameIds, setFavoriteGameIds] = useState<Set<string>>(new Set());
  const { user, isAuthenticated } = useAuth();

  const fetchGames = useCallback(async (filter?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedGames = await gameService.getAllGames(filter); 
      setGames(fetchedGames);
      const uniqueCategories = new Set<string>();
      const uniqueProviders = new Set<string>();
      fetchedGames.forEach(game => {
        if (game.categoryName) uniqueCategories.add(game.categoryName);
        else if (typeof game.category_slugs === 'string') uniqueCategories.add(game.category_slugs);
        else if (Array.isArray(game.category_slugs)) game.category_slugs.forEach(c => uniqueCategories.add(c));
        
        if (game.providerName) uniqueProviders.add(game.providerName);
        else if (game.provider_slug) uniqueProviders.add(game.provider_slug);
        else if (game.provider) uniqueProviders.add(game.provider);
      });
      setCategories(Array.from(uniqueCategories));
      setProviders(Array.from(uniqueProviders));
    } catch (err: any) {
      setError(err);
      toast.error("Failed to load games: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFavorites = useCallback(async () => {
    if (!user?.id) {
      setFavoriteGameIds(new Set()); 
      return;
    }
    try {
      const { data, error: favError } = await supabase
        .from('favorite_games')
        .select('game_id')
        .eq('user_id', user.id);

      if (favError) throw favError;
      setFavoriteGameIds(new Set(data.map(fav => getGameIdString(fav.game_id))));
    } catch (err: any) {
      console.error("Error fetching favorites:", err);
    }
  }, [user?.id]);


  useEffect(() => {
    fetchGames(); 
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavoriteGameIds(new Set()); 
    }
  }, [fetchGames, isAuthenticated, fetchFavorites]);
  
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchFavorites();
    }
  }, [user?.id, isAuthenticated, fetchFavorites]);


  const getGameById = async (id: string): Promise<Game | null> => {
    const localGame = games.find(g => getGameIdString(g.id) === id || getGameIdString(g.game_id) === id || getGameIdString(g.game_code) === id);
    if (localGame) return localGame;
    try {
      setIsLoading(true);
      const game = await gameService.getGameById(id);
      setIsLoading(false);
      return game;
    } catch (err) {
      setIsLoading(false);
      console.error(`Error fetching game by ID ${id}:`, err);
      return null;
    }
  };

  const getGameBySlug = async (slug: string): Promise<Game | null> => {
    const localGame = games.find(g => g.slug === slug);
    if (localGame) return localGame;
    try {
      setIsLoading(true);
      // Corrected: Use 'search' if 'slug' is not a direct filter option for getAllGames
      // This assumes 'slug' values are searchable text.
      const allGames = await gameService.getAllGames({ search: slug }); 
      const game = allGames.find(g => g.slug === slug) || null;
      setIsLoading(false);
      return game;
    } catch (err) {
      setIsLoading(false);
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
  
  const fetchGameLaunchUrl = async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    try {
      if (game.provider_slug === 'pragmaticplay' || game.provider === 'pragmaticplay') {
        const url = await pragmaticPlayService.getLaunchUrl(
            {}, 
            game.game_id || game.id.toString(),
            options.user_id || 'demoUser', 
            options.mode,
            options.language || 'en',
            options.currency || 'USD',
            options.platform || 'WEB',
            options.returnUrl
        );
        return url;
      } else {
        console.error(`Game launch for provider '${game.provider_slug || game.provider}' is not supported through this generic hook yet.`);
        toast.error(`Launching ${game.title} from provider '${game.provider_slug || game.provider}' is not yet supported here.`);
        return null;
      }
    } catch (err: any) {
      console.error("Error fetching game launch URL in useGames:", err);
      toast.error(`Could not launch ${game.title}: ${err.message}`);
      return null;
    }
  };

  const launchGame = async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    if (options.mode === 'real' && !isAuthenticated) {
      toast.error("Please log in to play for real money.");
      return null;
    }
    if (options.mode === 'real' && user) {
      options.user_id = user.id;
      options.username = user.username || user.email?.split('@')[0];
      options.currency = user.user_metadata?.currency || 'USD'; // Ensure currency is from user_metadata if available
      options.language = user.user_metadata?.language || 'en'; // Ensure language is from user_metadata if available
    } else if (options.mode === 'demo') {
        options.language = options.language || 'en';
        options.currency = options.currency || 'USD';
    }
    return fetchGameLaunchUrl(game, options);
  };


  return (
    <GamesContext.Provider value={{ 
        games, 
        isLoading, 
        error, 
        categories, 
        providers, 
        fetchGames, 
        getGameById, 
        getGameBySlug,
        favoriteGameIds,
        toggleFavoriteGame,
        launchGame,
        fetchGameLaunchUrl
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
