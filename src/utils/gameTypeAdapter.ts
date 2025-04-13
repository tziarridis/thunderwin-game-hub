
import { Game as UIGame, GameProvider as UIGameProvider } from '@/types';
import { Game as APIGame } from '@/types/game';
import { adaptGameForUI, adaptGameForAPI } from './gameAdapter';

/**
 * Adapts a game from API format to UI format for use in components
 * This helps resolve type incompatibilities between different Game types
 */
export function convertAPIGameToUIGame(apiGame: APIGame): UIGame {
  return adaptGameForUI(apiGame);
}

/**
 * Adapts a game from UI format to API format for use in services
 */
export function convertUIGameToAPIGame(uiGame: UIGame): Omit<APIGame, 'id'> {
  return adaptGameForAPI(uiGame);
}

/**
 * Wraps add/update handlers to handle type conversions automatically
 */
export function createGameHandlerAdapter(
  apiAddHandler: (game: Omit<APIGame, 'id'>) => Promise<APIGame>,
  apiUpdateHandler: (game: APIGame) => Promise<APIGame>
) {
  // Create a UI-compatible handler that works with UI Game type
  return {
    handleAddOrUpdateGame: async (gameData: UIGame | Omit<UIGame, 'id'>): Promise<UIGame> => {
      if ('id' in gameData && gameData.id) {
        // Update existing game
        const apiGame = {
          id: typeof gameData.id === 'string' ? parseInt(gameData.id) : gameData.id,
          ...adaptGameForAPI(gameData as UIGame)
        } as APIGame;
        
        const result = await apiUpdateHandler(apiGame);
        return adaptGameForUI(result);
      } else {
        // Add new game
        const apiGame = adaptGameForAPI(gameData as UIGame);
        const result = await apiAddHandler(apiGame);
        return adaptGameForUI(result);
      }
    }
  };
}
