
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Game, GameProvider, GameCategory, GameLaunchOptions, GameStatusEnum, GameVolatilityEnum } from '@/types/game';
import { gameService } from '@/services/gameService'; // Assuming gameService is correctly implemented
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Props for GameLauncher component, if it's still being used directly with these specific prop names
export interface GameLauncherProps {
  game: Game;
  mode?: 'real' | 'demo';
  onClose?: () => void;
  // These might be part of the context now, check usage
  onPlay?: (game: Game, mode: 'real' | 'demo') => void; 
  onDetails?: (game: Game) => void;
}

interface GamesContextType {
  games: Game[];
  isLoadingGames: boolean;
  gamesError: Error | null;
  providers: GameProvider[];
  isLoadingProviders: boolean;
  providersError: Error | null;
  categories: GameCategory[];
  isLoadingCategories: boolean;
  categoriesError: Error | null;
  
  fetchGamesByProvider: (providerSlug: string) => Promise<Game[]>;
  fetchGamesByCategory: (categorySlug: string) => Promise<Game[]>;
  fetchGameById: (id: string | number) => Promise<Game | null>;
  
  getGameLaunchUrl: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  handlePlayGame: (game: Game, mode: 'real' | 'demo') => void;
  handleGameDetails: (game: Game) => void;
  
  favoriteGames: string[]; // Array of game IDs or slugs
  toggleFavoriteGame: (gameIdOrSlug: string) => void;
  isFavorite: (gameIdOrSlug: string) => boolean;
  isLoadingFavorites: boolean;

  getFeaturedGames: (count?: number) => Promise<Game[]>;
  getPopularGames: (count?: number) => Promise<Game[]>;
  getLatestGames: (count?: number) => Promise<Game[]>;

  // General loading state combining all initial fetches
  isLoading: boolean; 
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export const GamesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const { data: gamesData, isLoading: isLoadingGames, error: gamesError } = useQuery<{ games: Game[], count: number }, Error>({
    queryKey: ['allGames'],
    queryFn: () => gameService.getAllGames({ limit: 500 }), // Fetch a larger initial set or implement pagination
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: providersData, isLoading: isLoadingProviders, error: providersError } = useQuery<GameProvider[], Error>({
    queryKey: ['allProviders'],
    queryFn: gameService.getProviders,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError } = useQuery<GameCategory[], Error>({
    queryKey: ['allCategories'],
    queryFn: gameService.getCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const { data: favoriteGamesData, isLoading: isLoadingFavorites } = useQuery<string[], Error>({
    queryKey: ['favoriteGames', user?.id],
    queryFn: () => user ? gameService.getFavoriteGames(user.id) : Promise.resolve([]),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const games = gamesData?.games || [];
  const providers = providersData || [];
  const categories = categoriesData || [];
  const favoriteGames = favoriteGamesData || [];

  const fetchGameById = useCallback(async (id: string | number): Promise<Game | null> => {
    // This could also use gameService.getGameById if available, or filter from `games`
    const game = games.find(g => g.id === id || g.slug === id || g.game_id === id);
    if (game) return game;
    try {
      return await gameService.getGameById(id.toString()); // Ensure service expects string
    } catch (error) {
      console.error(`Error fetching game by id ${id}:`, error);
      return null;
    }
  }, [games]);

  const fetchGamesByProvider = useCallback(async (providerSlug: string): Promise<Game[]> => {
    try {
      return await gameService.getGamesByProvider(providerSlug);
    } catch (error) {
      console.error(`Error fetching games for provider ${providerSlug}:`, error);
      return [];
    }
  }, []);

  const fetchGamesByCategory = useCallback(async (categorySlug: string): Promise<Game[]> => {
     try {
      return await gameService.getGamesByCategory(categorySlug);
    } catch (error) {
      console.error(`Error fetching games for category ${categorySlug}:`, error);
      return [];
    }
  }, []);

  const getGameLaunchUrl = useCallback(async (game: Game, options: GameLaunchOptions): Promise<string | null> => {
    if (!isAuthenticated && !game.demo_url) {
        toast.error("Please log in to play real money games.");
        navigate('/login');
        return null;
    }
    if (!isAuthenticated && game.demo_url && options.mode === 'real') {
        toast.error("Please log in to play real money games.");
        navigate('/login');
        return null;
    }

    try {
      const launchOptionsWithUser = { ...options, user_id: user?.id, username: user?.email, currency: 'USD' /* TODO: get user currency */ };
      const url = await gameService.getGameLaunchUrl(game.id.toString(), launchOptionsWithUser); // Ensure service uses game.id
      if (!url) throw new Error("Launch URL not available.");
      return url;
    } catch (error: any) {
      toast.error(`Error launching game: ${error.message}`);
      console.error("Error getting game launch URL:", error);
      return null;
    }
  }, [user, isAuthenticated, navigate]);

  const handlePlayGame = useCallback(async (game: Game, mode: 'real' | 'demo') => {
    console.log(`Attempting to play game: ${game.title}, mode: ${mode}`);
    const launchUrl = await getGameLaunchUrl(game, { mode });
    if (launchUrl) {
      navigate(`/casino/seamless?gameUrl=${encodeURIComponent(launchUrl)}&gameTitle=${encodeURIComponent(game.title)}`);
    }
  }, [getGameLaunchUrl, navigate]);

  const handleGameDetails = useCallback((game: Game) => {
    navigate(`/casino/game/${game.slug || game.id}`);
  }, [navigate]);

  const toggleFavoriteMutation = useMutation<void, Error, string>({
    mutationFn: async (gameIdOrSlug: string) => {
      if (!user) throw new Error("User not authenticated");
      // Find the actual game ID if a slug is passed
      const gameToToggle = games.find(g => g.id === gameIdOrSlug || g.slug === gameIdOrSlug);
      if (!gameToToggle) throw new Error("Game not found");
      
      const currentFavorites = await gameService.getFavoriteGames(user.id);
      const isCurrentlyFavorite = currentFavorites.includes(gameToToggle.id.toString());

      if (isCurrentlyFavorite) {
        await gameService.removeFavoriteGame(user.id, gameToToggle.id.toString());
        toast.success(`${gameToToggle.title} removed from favorites.`);
      } else {
        await gameService.addFavoriteGame(user.id, gameToToggle.id.toString());
        toast.success(`${gameToToggle.title} added to favorites.`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteGames', user?.id] });
    },
    onError: (error) => {
      toast.error(`Failed to update favorites: ${error.message}`);
    }
  });

  const toggleFavoriteGame = useCallback((gameIdOrSlug: string) => {
    if (!isAuthenticated || !user) {
      toast.info("Please log in to manage your favorites.");
      navigate('/login');
      return;
    }
    toggleFavoriteMutation.mutate(gameIdOrSlug);
  }, [isAuthenticated, user, navigate, toggleFavoriteMutation]);

  const isFavorite = useCallback((gameIdOrSlug: string): boolean => {
    const game = games.find(g => g.id === gameIdOrSlug || g.slug === gameIdOrSlug);
    if (!game) return false;
    return favoriteGames.includes(game.id.toString());
  }, [favoriteGames, games]);

  const getFeaturedGames = useCallback(async (count: number = 8): Promise<Game[]> => {
    // return gameService.getFeaturedGames(count); // Assuming service method
    return games.filter(g => g.is_featured).slice(0, count); // Placeholder
  }, [games]);

  const getPopularGames = useCallback(async (count: number = 8): Promise<Game[]> => {
    // return gameService.getPopularGames(count); // Assuming service method
    return games.filter(g => g.isPopular).slice(0, count); // Placeholder
  }, [games]);

  const getLatestGames = useCallback(async (count: number = 8): Promise<Game[]> => {
    // return gameService.getLatestGames(count); // Assuming service method
    return [...games].sort((a,b) => new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime()).slice(0,count); // Placeholder
  }, [games]);
  
  const isLoading = isLoadingGames || isLoadingProviders || isLoadingCategories || (!!user && isLoadingFavorites);

  return (
    <GamesContext.Provider value={{
      games, isLoadingGames, gamesError,
      providers, isLoadingProviders, providersError,
      categories, isLoadingCategories, categoriesError,
      fetchGameById, fetchGamesByProvider, fetchGamesByCategory,
      getGameLaunchUrl, handlePlayGame, handleGameDetails,
      favoriteGames, toggleFavoriteGame, isFavorite, isLoadingFavorites,
      getFeaturedGames, getPopularGames, getLatestGames,
      isLoading
    }}>
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
