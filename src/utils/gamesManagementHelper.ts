
import { Game as UIGame } from '@/types';
import { Game as APIGame } from '@/types/game';
import { adaptGameForUI, adaptGameForAPI } from '@/utils/gameAdapter';
import { clientGamesApi } from '@/services/gamesService';
import { GameDataExtended } from '@/types/gameService';

/**
 * Helper functions specifically for the Games Management page
 * These bridge the gap between API and UI game types
 */

// Convert an API game for admin display
export const convertAPIGameToAdminFormat = (apiGame: APIGame): UIGame => {
  return adaptGameForUI(apiGame);
};

// Convert an array of API games for admin display
export const convertAPIGamesForAdmin = (apiGames: APIGame[]): UIGame[] => {
  return apiGames.map(convertAPIGameToAdminFormat);
};

// Add a new game via the admin interface
export const adminAddGame = async (gameData: Omit<UIGame, 'id'>): Promise<UIGame> => {
  // Convert UI game to API game format
  const apiGame = adaptGameForAPI(gameData as UIGame);
  // Cast to the expected API format
  const apiGameData = { ...apiGame } as unknown as APIGame;
  const result = await clientGamesApi.addGame(apiGameData);
  // Convert the result back to UI format
  return convertAPIGameToAdminFormat(result);
};

// Update an existing game via the admin interface
export const adminUpdateGame = async (gameData: UIGame): Promise<UIGame> => {
  // Convert UI game to API game format with proper type casting
  const apiGameData = {
    id: parseInt(gameData.id),
    ...adaptGameForAPI(gameData)
  } as unknown as APIGame;
  
  const result = await clientGamesApi.updateGame(apiGameData);
  // Convert the result back to UI format
  return convertAPIGameToAdminFormat(result);
};

// Toggle game feature (popular/new) via the admin interface
export const adminToggleGameFeature = async (
  id: string,
  feature: 'isPopular' | 'isNew',
  value: boolean
): Promise<UIGame> => {
  // Map UI feature names to API feature names
  const apiFeature = feature === 'isPopular' ? 'is_featured' : 'show_home';
  const numericId = parseInt(id);
  
  const updatedGame = await clientGamesApi.toggleGameFeature(numericId, apiFeature, value);
  return convertAPIGameToAdminFormat(updatedGame);
};

// Delete a game via the admin interface
export const adminDeleteGame = async (id: string): Promise<void> => {
  await clientGamesApi.deleteGame(id);
};

// Helper for managing game type conversions in forms
export const getGameFormHandlers = () => {
  const handleAddGame = async (gameData: UIGame | Omit<UIGame, 'id'>): Promise<void> => {
    if ('id' in gameData) {
      await adminUpdateGame(gameData);
    } else {
      await adminAddGame(gameData);
    }
  };

  const handleUpdateGame = async (gameData: UIGame | Omit<UIGame, 'id'>): Promise<void> => {
    if ('id' in gameData) {
      await adminUpdateGame(gameData);
    } else {
      await adminAddGame(gameData);
    }
  };

  return {
    handleAddGame,
    handleUpdateGame
  };
};
