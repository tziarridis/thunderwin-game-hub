
import { GameData, GameFilterOptions, GameQueryOptions } from '@/types/gameService';
import gameDbService from './games/gameDbService';
import gameSpecialQueriesService from './games/gameSpecialQueriesService';
import gameFileSyncService from './games/gameFileSyncService';
import { generateMockGames } from './games/gameMockGenerator';
import { browserDb } from './games/browserDbAdapter';

// Export the database services
export const {
  ensureGameTables,
  getAllGames,
  getGameById,
  getGameByGameId,
  createGame,
  updateGame,
  deleteGame,
  updateGamePopularity
} = gameDbService;

// Export special query services
export const {
  getFeaturedGames,
  getHomeGames,
  getGamesByProvider,
  getGamesByType,
  getGamesByTheme,
  searchGames,
  getPopularGameTypes
} = gameSpecialQueriesService;

// Export file sync services
export const {
  importGamesFromJson,
  exportGamesToJson
} = gameFileSyncService;

// Export the mock data generator
export const { generateMockGames: generateMockGameData } = { generateMockGames };

// Create a clientGamesApi implementation for browser environment
export const clientGamesApi = {
  getGames: async (params: any = {}) => {
    try {
      const games = await getAllGames(params);
      return {
        data: games || [],
        total: (games || []).length,
        page: params.page || 1,
        limit: params.limit || 10
      };
    } catch (error) {
      console.error('Error in clientGamesApi.getGames:', error);
      return { data: [], total: 0, page: 1, limit: 10 };
    }
  },
  
  getProviders: async () => {
    // Return mock providers with status field to match GameProvider interface
    return [
      { id: 'pragmatic', name: 'Pragmatic Play', games_count: 250, status: 'active' },
      { id: 'netent', name: 'NetEnt', games_count: 200, status: 'active' },
      { id: 'playtech', name: 'Playtech', games_count: 180, status: 'active' },
      { id: 'microgaming', name: 'Microgaming', games_count: 300, status: 'active' },
      { id: 'evolution', name: 'Evolution Gaming', games_count: 120, status: 'active' },
      { id: 'bgaming', name: 'BGaming', games_count: 80, status: 'active' }
    ];
  },
  
  addGame: async (gameData: GameData) => {
    try {
      return await createGame(gameData);
    } catch (error) {
      console.error('Error in clientGamesApi.addGame:', error);
      throw error;
    }
  },
  
  updateGame: async (gameData: GameData) => {
    try {
      const { id, ...data } = gameData;
      if (!id) throw new Error('Game ID is required for updates');
      return await updateGame(id, data);
    } catch (error) {
      console.error('Error in clientGamesApi.updateGame:', error);
      throw error;
    }
  },
  
  deleteGame: async (id: number | string) => {
    try {
      return await deleteGame(id);
    } catch (error) {
      console.error('Error in clientGamesApi.deleteGame:', error);
      throw error;
    }
  },
  
  toggleGameFeature: async (id: number | string, feature: string, value: boolean) => {
    try {
      // Map API feature names to database column names
      const featureColumn = feature === 'is_featured' ? 'is_featured' : 'show_home';
      
      // Update the feature
      const result = await updateGame(id, { [featureColumn]: value } as Partial<GameData>);
      return result;
    } catch (error) {
      console.error('Error in clientGamesApi.toggleGameFeature:', error);
      throw error;
    }
  }
};

// Fix the browserDb.query function to return a Promise
browserDb.query = (sql: string, params: any[] = []) => {
  console.log('Mock browser DB query:', sql, params);
  
  // Return empty results wrapped in a Promise
  return Promise.resolve([]);
};
