
import { useState, useCallback, useEffect } from 'react';
import { Game } from '@/types';
import { toast } from 'sonner';
import { pragmaticPlayService } from '@/services/pragmaticPlayService';
import { useAuth } from '@/contexts/AuthContext';
import { getAllGames, createGame, updateGame as updateGameService, deleteGame as deleteGameService } from '@/services/gamesService';

interface LaunchGameOptions {
  providerId?: string;
  mode?: 'real' | 'demo';
  language?: string;
  returnUrl?: string;
}

export function useGames() {
  const [launchingGame, setLaunchingGame] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated, user } = useAuth();

  // Fetch games on mount
  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const gamesData = await getAllGames();
      setGames(gamesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch games'));
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const launchGame = useCallback(async (game: Game, options: LaunchGameOptions = {}) => {
    try {
      setLaunchingGame(true);
      
      const { 
        providerId = 'ppeur', 
        mode = 'demo',
        language = 'en',
        returnUrl = window.location.origin + '/casino' 
      } = options;

      // Handle the case where a player tries to play in real mode without being logged in
      if (mode === 'real' && !isAuthenticated) {
        toast.warning('Please log in to play with real money');
        return pragmaticPlayService.launchGame({
          playerId: 'guest',
          gameCode: game.id, // Use game.id as game_code
          mode: 'demo',
          language,
          returnUrl
        });
      }

      // Extract game code
      let gameCode = game.id;
      
      // Handle game code format - some providers might add a prefix
      if (providerId.startsWith('pp') && !gameCode.includes('vs')) {
        // If this is a Pragmatic Play game but doesn't have the correct format
        gameCode = gameCode.replace('pp_', '');
      }

      // Launch the game
      const gameUrl = await pragmaticPlayService.launchGame({
        playerId: isAuthenticated ? user?.id || 'guest' : 'guest',
        gameCode,
        mode,
        language,
        returnUrl
      });

      // Open game in new window
      window.open(gameUrl, '_blank');
      
      return gameUrl;
    } catch (error: any) {
      console.error('Error launching game:', error);
      toast.error(`Unable to launch game: ${error.message || 'Unknown error'}`);
      throw error;
    } finally {
      setLaunchingGame(false);
    }
  }, [isAuthenticated, user]);

  const addGame = async (game: Omit<Game, 'id'>): Promise<Game> => {
    try {
      const newGame = await createGame(game);
      await fetchGames(); // Refresh games list
      return newGame;
    } catch (error) {
      console.error('Error adding game:', error);
      toast.error('Failed to add game');
      throw error;
    }
  };

  const updateGame = async (game: Game): Promise<Game> => {
    try {
      const updated = await updateGameService(game.id, game);
      await fetchGames(); // Refresh games list
      return updated;
    } catch (error) {
      console.error('Error updating game:', error);
      toast.error('Failed to update game');
      throw error;
    }
  };

  const deleteGame = async (id: string): Promise<boolean> => {
    try {
      const result = await deleteGameService(id);
      await fetchGames(); // Refresh games list
      return result;
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.error('Failed to delete game');
      throw error;
    }
  };

  const importGamesFromAggregator = async (): Promise<number> => {
    try {
      // This would normally make an API call to import games
      // For now, just refresh the games list
      await fetchGames();
      return games.length;
    } catch (error) {
      console.error('Error importing games:', error);
      toast.error('Failed to import games');
      return 0;
    }
  };

  return {
    games,
    loading,
    error,
    launchGame,
    launchingGame,
    addGame,
    updateGame,
    deleteGame,
    fetchGames,
    totalGames: games.length,
    importGamesFromAggregator
  };
}
