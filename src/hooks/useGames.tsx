
import { useState, useCallback } from 'react';
import { Game } from '@/types';
import { toast } from 'sonner';
import { pragmaticPlayService } from '@/services/pragmaticPlayService';
import { useAuth } from '@/contexts/AuthContext';

interface LaunchGameOptions {
  providerId?: string;
  mode?: 'real' | 'demo';
  language?: string;
  returnUrl?: string;
}

export function useGames() {
  const [launchingGame, setLaunchingGame] = useState(false);
  const { isAuthenticated, user } = useAuth();

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
          gameCode: game.game_code,
          mode: 'demo',
          language,
          returnUrl
        });
      }

      // Extract game code
      let gameCode = game.game_code;
      
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

  return {
    launchGame,
    launchingGame
  };
}
