
import { browserDb } from './browserDbAdapter';
import { GameData, GameQueryOptions } from '@/types/gameService';
import { getAllGames, getGameById } from './gameDbService';

/**
 * Get featured games
 */
export const getFeaturedGames = async (limit = 10): Promise<GameData[]> => {
  return getAllGames(
    { is_featured: true },
    { limit, orderBy: 'popularity', order: 'desc' }
  );
};

/**
 * Get games for home page
 */
export const getHomeGames = async (limit = 12): Promise<GameData[]> => {
  return getAllGames(
    { show_home: true },
    { limit, orderBy: 'popularity', order: 'desc' }
  );
};

/**
 * Get games by provider
 */
export const getGamesByProvider = async (providerId: string): Promise<GameData[]> => {
  return getAllGames(
    { provider_id: providerId },
    { orderBy: 'popularity', order: 'desc' }
  );
};

/**
 * Get games by type
 */
export const getGamesByType = async (type: string, limit = 50): Promise<GameData[]> => {
  return getAllGames(
    { type },
    { limit, orderBy: 'popularity', order: 'desc' }
  );
};

/**
 * Get games by theme
 */
export const getGamesByTheme = async (theme: string, limit = 50): Promise<GameData[]> => {
  return getAllGames(
    { theme },
    { limit, orderBy: 'popularity', order: 'desc' }
  );
};

/**
 * Search games
 */
export const searchGames = async (searchTerm: string, limit = 50): Promise<GameData[]> => {
  return getAllGames(
    { search: searchTerm },
    { limit, orderBy: 'popularity', order: 'desc' }
  );
};

/**
 * Get popular game types
 */
export const getPopularGameTypes = async (limit = 10): Promise<{ type: string, count: number }[]> => {
  try {
    const query = `
      SELECT type, COUNT(*) as count 
      FROM games 
      GROUP BY type 
      ORDER BY count DESC 
      LIMIT ?
    `;
    
    const results = await browserDb.query(query, [limit]);
    return results as { type: string, count: number }[];
  } catch (error) {
    console.error('Error getting popular game types:', error);
    return [];
  }
};

export default {
  getFeaturedGames,
  getHomeGames,
  getGamesByProvider,
  getGamesByType,
  getGamesByTheme,
  searchGames,
  getPopularGameTypes
};
