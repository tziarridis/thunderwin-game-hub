
import React from 'react';
import { Game as UIGame } from '@/types';
import { Game as APIGame } from '@/types/game';
import { adaptGameForAPI, adaptGameForUI } from '@/utils/gameAdapter';

/**
 * A component to convert between UI and API game types
 * This helps resolve the type mismatches between different game interfaces
 */
export const useGameAdapter = () => {
  // Convert UI Game to API Game format
  const convertToAPIGame = (uiGame: UIGame): Omit<APIGame, 'id'> => {
    return adaptGameForAPI(uiGame);
  };
  
  // Convert API Game to UI Game format
  const convertToUIGame = (apiGame: APIGame): UIGame => {
    return adaptGameForUI(apiGame);
  };
  
  // Handle game operations with automatic type conversion
  const handleAddGame = async (
    gameData: Omit<UIGame, 'id'>, 
    addGameFn: (gameData: Omit<APIGame, 'id'>) => Promise<APIGame>
  ): Promise<UIGame> => {
    const apiGame = convertToAPIGame(gameData as UIGame);
    const result = await addGameFn(apiGame);
    return convertToUIGame(result);
  };
  
  const handleUpdateGame = async (
    gameData: UIGame,
    updateGameFn: (gameData: APIGame) => Promise<APIGame>
  ): Promise<UIGame> => {
    const apiGame = {
      id: parseInt(gameData.id),
      ...convertToAPIGame(gameData)
    };
    const result = await updateGameFn(apiGame as APIGame);
    return convertToUIGame(result);
  };
  
  return {
    convertToAPIGame,
    convertToUIGame,
    handleAddGame,
    handleUpdateGame
  };
};

export default useGameAdapter;
