
// Re-export game types
export type { 
  GameData, 
  GameFilterOptions, 
  GameQueryOptions,
  DatabaseQueryResult,
  GameDataExtended,
  GameCompatibility
} from '@/types/gameService';

// Re-export game DB services
export {
  ensureGameTables,
  getAllGames,
  getGameById,
  getGameByGameId,
  createGame,
  updateGame,
  deleteGame,
  updateGamePopularity
} from './gameDbService';

// Re-export special query services
export {
  getFeaturedGames,
  getHomeGames,
  getGamesByProvider,
  getGamesByType,
  getGamesByTheme,
  searchGames,
  getPopularGameTypes
} from './gameSpecialQueriesService';

// Re-export file sync services
export {
  importGamesFromJson,
  exportGamesToJson
} from './gameFileSyncService';

// Re-export browser DB adapter
export { default as browserDb } from './browserDbAdapter';
