import { useState, useCallback } from 'react';
import { Game, GameProvider, GamesContextType } from '@/types';
import { toast } from 'sonner';
import { gamesDatabaseService } from '@/services/gamesDatabaseService';
import { gameAggregatorService } from '@/services/gameAggregatorService';
import { useAuth } from '@/contexts/AuthContext';
import { trackEvent } from '@/utils/analytics';

export const useGames = (): GamesContextType => {
  const [games, setGames] = useState<Game[]>([]);
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [newGames, setNewGames] = useState<Game[]>([]);
  const [popularGames, setPopularGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  // Function to toggle favorite status for a game
  const toggleFavorite = useCallback(async (gameId: string) => {
    try {
      if (!user?.id) {
        toast.error('Please log in to add favorites');
        return;
      }

      // Find game in our state
      const gameIndex = games.findIndex(g => g.id === gameId);
      if (gameIndex === -1) return;
      
      const game = games[gameIndex];
      const currentFavoriteStatus = game.isFavorite || false;
      
      // Optimistically update the UI
      const updatedGames = [...games];
      updatedGames[gameIndex] = {
        ...game,
        isFavorite: !currentFavoriteStatus
      };
      setGames(updatedGames);
      
      // Also update in other game lists
      updateGameInLists(gameId, { isFavorite: !currentFavoriteStatus });
      
      // Call API to toggle favorite
      await gamesDatabaseService.toggleFavorite(gameId, user.id, currentFavoriteStatus);
      
      // Show toast
      if (!currentFavoriteStatus) {
        toast.success(`${game.title} added to favorites`);
        trackEvent('game_favorite_add', { gameId: game.id, gameName: game.title });
      } else {
        toast.success(`${game.title} removed from favorites`);
        trackEvent('game_favorite_remove', { gameId: game.id, gameName: game.title });
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
      
      // Revert the optimistic update
      refreshGames();
    }
  }, [games, user]);

  // Helper function to update a game in all lists
  const updateGameInLists = (gameId: string, updates: Partial<Game>) => {
    const updateGameInList = (list: Game[]) => 
      list.map(g => g.id === gameId ? { ...g, ...updates } : g);
    
    setFeaturedGames(updateGameInList(featuredGames));
    setNewGames(updateGameInList(newGames));
    setPopularGames(updateGameInList(popularGames));
  };

  // Function to launch a game
  const launchGame = useCallback(async (game: Game, options?: any) => {
    try {
      // Track analytics
      trackEvent('game_launch_attempt', {
        gameId: game.id,
        gameName: game.title,
        provider: game.provider,
      });
      
      // Increment game views in the database
      gamesDatabaseService.incrementGameViews(game.id);
      
      // Launch the game with the aggregator service
      const response = await gameAggregatorService.createSession(
        game.id,
        options?.playerId || user?.id || 'demo',
        options?.currency || user?.currency || 'EUR',
        options?.platform || 'web'
      );
      
      if (!response.success || !response.gameUrl) {
        throw new Error(response.errorMessage || 'Failed to launch game');
      }
      
      // Track successful launch
      trackEvent('game_launch_success', {
        gameId: game.id,
        gameName: game.title
      });
      
      return response.gameUrl;
    } catch (error: any) {
      console.error("Error launching game:", error);
      toast.error(error.message || "Failed to launch game");
      trackEvent('game_launch_error', {
        gameId: game.id || 'unknown',
        error: error.message || "Unknown error"
      });
      return undefined;
    }
  }, [user]);

  // Function to search games
  const searchGames = useCallback(async (query: string): Promise<Game[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await gamesDatabaseService.getGames({
        search: query,
        limit: 20
      });

      return response.data;
    } catch (error: any) {
      setError(error.message || 'Failed to search games');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to get games by provider
  const getGamesByProvider = useCallback(async (providerId: string): Promise<Game[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await gamesDatabaseService.getGames({
        provider: providerId,
        limit: 50
      });

      return response.data;
    } catch (error: any) {
      setError(error.message || 'Failed to get games by provider');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to get games by category
  const getGamesByCategory = useCallback(async (categoryId: string): Promise<Game[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await gamesDatabaseService.getGames({
        category: categoryId,
        limit: 50
      });

      return response.data;
    } catch (error: any) {
      setError(error.message || 'Failed to get games by category');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to get favorite games
  const getFavoriteGames = useCallback(async (): Promise<Game[]> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.id) {
        return [];
      }

      const favoriteGames = await gamesDatabaseService.getFavoriteGames(user.id);
      return favoriteGames;
    } catch (error: any) {
      setError(error.message || 'Failed to get favorite games');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Function to get game by ID
  const getGameById = useCallback(async (gameId: string): Promise<Game | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const game = await gamesDatabaseService.getGameById(gameId);
      return game;
    } catch (error: any) {
      setError(error.message || 'Failed to get game by ID');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load function
  const refreshGames = useCallback(async () => {
    // ... keep existing code if there's a refreshGames function
  }, []);

  return {
    games,
    providers,
    categories,
    featuredGames,
    newGames,
    popularGames,
    isLoading,
    error,
    toggleFavorite,
    launchGame,
    searchGames,
    getGamesByProvider,
    getGamesByCategory,
    getFavoriteGames,
    getGameById
  };
};

export default useGames;
