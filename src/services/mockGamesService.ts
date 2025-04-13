
import { Game } from '@/types/game'; 

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
