
import { Game as UIGame } from '@/types';
import { Game as APIGame } from '@/types/game';
import { adaptGameForUI, adaptGameForAPI } from '@/utils/gameAdapter';
import { clientGamesApi } from '@/services/gamesService';

/**
 * Helper functions for the admin games management page
 * to handle the type conversion between UI and API game types
 */

export const addGameHelper = async (gameData: Omit<UIGame, 'id'>): Promise<UIGame> => {
  try {
    // Convert UI game to API game format
    const apiGame = adaptGameForAPI(gameData as UIGame);
    const result = await clientGamesApi.addGame(apiGame);
    // Convert the result back to UI format
    const uiGame = adaptGameForUI(result);
    return uiGame;
  } catch (err) {
    console.error("Error adding game:", err);
    throw err;
  }
};

export const updateGameHelper = async (game: UIGame): Promise<UIGame> => {
  try {
    // Convert UI game to API game format
    const apiGame = {
      id: game.id,
      ...adaptGameForAPI(game)
    };
    
    const result = await clientGamesApi.updateGame(apiGame);
    // Convert the result back to UI format
    const uiGame = adaptGameForUI(result);
    return uiGame;
  } catch (err) {
    console.error("Error updating game:", err);
    throw err;
  }
};

export const deleteGameHelper = async (id: string): Promise<void> => {
  try {
    await clientGamesApi.deleteGame(id);
  } catch (err) {
    console.error("Error deleting game:", err);
    throw err;
  }
};

export const toggleGameFeatureHelper = async (
  id: string, 
  feature: 'isPopular' | 'isNew', 
  value: boolean
): Promise<UIGame> => {
  try {
    // Map UI feature names to API feature names
    const apiFeature = feature === 'isPopular' ? 'is_featured' : 'show_home';
    
    const updatedGame = await clientGamesApi.toggleGameFeature(id, apiFeature, value);
    const adaptedGame = adaptGameForUI(updatedGame);
    
    return adaptedGame;
  } catch (err) {
    console.error(`Error toggling feature for game:`, err);
    throw err;
  }
};

// Convert an array of games for admin display
export const convertGamesForAdmin = (apiGames: APIGame[]): UIGame[] => {
  return apiGames.map(game => adaptGameForUI(game));
};
