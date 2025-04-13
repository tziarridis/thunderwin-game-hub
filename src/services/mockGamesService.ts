
import { Game } from '@/types/game'; 
import { clientGamesApi } from '@/services/gamesService';

// This function fixes the undefined errors and safely converts a game ID
export const safelyParseGameId = (gameId: string | number | undefined): string => {
  if (gameId === undefined) {
    return '';
  }
  return gameId.toString();
};

// This function can be used in your mockGamesService to safely check if a game exists
export const safelyParseGameCategory = (category: string | undefined): string => {
  return category || 'slots';
};

// Export clientGamesApi from mockGamesService to fix import errors
export { clientGamesApi };
