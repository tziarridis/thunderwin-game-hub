
import { Game as APIGame } from '@/types/game';
import { Game as UIGame } from '@/types';
import { adaptGameForUI, adaptGameForAPI } from '@/utils/gameAdapter';
import { clientGamesApi } from '@/services/gamesService';

/**
 * This adapter specifically helps the CMS GamesManagement component
 * by providing type-safe functions for managing games with correct type conversions
 */

// Add a new game
export const addGameAdapter = async (uiGame: Omit<UIGame, 'id'>): Promise<UIGame> => {
  try {
    // Convert UI game format to API game format
    const apiGame = adaptGameForAPI(uiGame as UIGame);
    // Send to API
    const resultApiGame = await clientGamesApi.addGame(apiGame);
    // Convert back to UI format
    return adaptGameForUI(resultApiGame);
  } catch (err) {
    console.error("Error adding game:", err);
    throw err;
  }
};

// Update an existing game
export const updateGameAdapter = async (uiGame: UIGame): Promise<UIGame> => {
  try {
    // Convert UI game to API game format
    const apiGame = {
      id: parseInt(uiGame.id),
      ...adaptGameForAPI(uiGame)
    };
    
    // Send to API
    const resultApiGame = await clientGamesApi.updateGame(apiGame);
    // Convert back to UI format
    return adaptGameForUI(resultApiGame);
  } catch (err) {
    console.error("Error updating game:", err);
    throw err;
  }
};

// Delete a game
export const deleteGameAdapter = async (id: string): Promise<void> => {
  try {
    await clientGamesApi.deleteGame(id);
  } catch (err) {
    console.error("Error deleting game:", err);
    throw err;
  }
};

// Toggle a game feature (isPopular/isNew)
export const toggleGameFeatureAdapter = async (
  id: string,
  feature: 'isPopular' | 'isNew',
  value: boolean
): Promise<UIGame> => {
  try {
    // Map UI feature names to API feature names
    const apiFeature = feature === 'isPopular' ? 'is_featured' : 'show_home';
    const numericId = parseInt(id);
    
    // Send to API
    const resultApiGame = await clientGamesApi.toggleGameFeature(numericId, apiFeature, value);
    // Convert back to UI format
    return adaptGameForUI(resultApiGame);
  } catch (err) {
    console.error("Error toggling game feature:", err);
    throw err;
  }
};

// Helper to correctly handle both create and update operations
export const saveGameAdapter = async (gameData: UIGame | Omit<UIGame, 'id'>): Promise<UIGame> => {
  try {
    if ('id' in gameData) {
      return await updateGameAdapter(gameData);
    } else {
      return await addGameAdapter(gameData);
    }
  } catch (err) {
    console.error("Error saving game:", err);
    throw err;
  }
};
