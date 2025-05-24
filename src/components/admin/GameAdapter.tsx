
import React from 'react';
import { ExtendedGame, ExtendedGameProvider } from '@/types/extended';
import { Game as APIGame } from '@/types/game';
import { adaptGameForAPI, adaptGameForUI } from '@/utils/gameAdapter';

/**
 * A component to convert between UI and API game types
 * This helps resolve the type mismatches between different game interfaces
 */
export const useGameAdapter = () => {
  // Convert UI Game to API Game format
  const convertToAPIGame = (uiGame: ExtendedGame): Omit<APIGame, 'id'> => {
    return adaptGameForAPI(uiGame);
  };
  
  // Convert API Game to UI Game format
  const convertToUIGame = (apiGame: APIGame): ExtendedGame => {
    return adaptGameForUI(apiGame) as ExtendedGame;
  };
  
  // Handle game operations with automatic type conversion
  const handleAddGame = async (
    gameData: Omit<ExtendedGame, 'id'>, 
    addGameFn: (gameData: Omit<APIGame, 'id'>) => Promise<APIGame>
  ): Promise<ExtendedGame> => {
    const apiGame = convertToAPIGame(gameData as ExtendedGame);
    const result = await addGameFn(apiGame);
    return convertToUIGame(result);
  };
  
  const handleUpdateGame = async (
    gameData: ExtendedGame,
    updateGameFn: (gameData: APIGame) => Promise<APIGame>
  ): Promise<ExtendedGame> => {
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
