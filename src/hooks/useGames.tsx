import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Game, GameLaunchOptions } from '@/types';
import { gameService } from '@/services/gameService'; // Main game service
import { supabase } from '@/integrations/supabase/client'; // For favorites
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext'; // To get user_id for favorites and launch

// Helper to get game ID as string
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
      const fetchedGames = await gameService.getGames(filter);
      setGames(fetchedGames);
      // Extract categories and providers
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
      setFavoriteGameIds(new Set()); // Clear favorites if no user
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
      // Do not toast here as it might be too noisy
    }
  }, [user?.id]);


  useEffect(() => {
    fetchGames(); // Initial fetch
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavoriteGameIds(new Set()); // Clear favorites if user logs out
    }
  }, [fetchGames, isAuthenticated, fetchFavorites]);
  
  // Refetch favorites when user changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchFavorites();
    }
  }, [user?.id, isAuthenticated, fetchFavorites]);


  const getGameById = async (id: string): Promise<Game | null> => {
    // First, try to find in local state
    const localGame = games.find(g => getGameIdString(g.id) === id || getGameIdString(g.game_id) === id || getGameIdString(g.game_code) === id);
    if (localGame) return localGame;
    // If not found, fetch from service
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
      // Assuming gameService might have getGameBySlug or adapt getGames
      const allGames = await gameService.getGames({ slug }); // Example filter
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
        // Remove from favorites
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
        // Add to favorites
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
      const launchUrl = await gameService.getGameLaunchUrl(game, options);
      return launchUrl;
    } catch (err: any) {
      console.error("Error fetching game launch URL:", err);
      toast.error(`Could not launch ${game.title}: ${err.message}`);
      return null;
    }
  };

  // This is the launchGame function that pages/components will call
  const launchGame = async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    if (options.mode === 'real' && !isAuthenticated) {
      toast.error("Please log in to play for real money.");
      // Consider redirecting to login page: navigate('/login');
      return null;
    }
    // Enrich options with user details if available and mode is real
    if (options.mode === 'real' && user) {
      options.user_id = user.id;
      options.username = user.username || user.email?.split('@')[0];
      options.currency = user.user_metadata?.currency || 'USD';
      options.language = user.user_metadata?.language || 'en';
    } else if (options.mode === 'demo') {
        // Demo mode might not need user specific details, or might use defaults
        options.language = options.language || 'en';
        options.currency = options.currency || 'USD'; // Provider might require a currency even for demo
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
        launchGame, // Expose the simplified launchGame
        fetchGameLaunchUrl // Also expose the raw fetch if needed elsewhere
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
