import browserDb from './browserDbAdapter'; // Updated import
import { GameData, GameFilterOptions, GameQueryOptions, GameDataExtended } from '@/types/gameService';

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Only try to import modules if we're in a Node.js environment
let mysql = null;

if (!isBrowser) {
  try {
    // Dynamic imports for server environment
    mysql = require('mysql2/promise');
  } catch (error) {
    console.error('Error importing Node.js modules:', error);
  }
}

// Function to safely execute database queries that works in both environments
const safeQuery = async (sql: string, params: any[] = []): Promise<any[]> => {
  if (isBrowser) {
    console.log('Browser environment detected, using mock database');
    return browserDb.query(sql, params);
  }

  try {
    // Server-side database connection logic
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'casino'
    });
    
    const [results] = await connection.query(sql, params);
    await connection.end();
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    return [];
  }
};

/**
 * Get featured games
 */
export const getFeaturedGames = async (limit = 10): Promise<GameData[]> => {
  try {
    const query = 'SELECT * FROM games WHERE is_featured = 1 ORDER BY popularity DESC LIMIT ?';
    const results = await safeQuery(query, [limit]);
    return results as GameData[];
  } catch (error) {
    console.error('Error getting featured games:', error);
    return [];
  }
};

/**
 * Get games to show on the home page
 */
export const getHomeGames = async (limit = 10): Promise<GameData[]> => {
  try {
    const query = 'SELECT * FROM games WHERE show_home = 1 ORDER BY popularity DESC LIMIT ?';
    const results = await safeQuery(query, [limit]);
    return results as GameData[];
  } catch (error) {
    console.error('Error getting home games:', error);
    return [];
  }
};

/**
 * Get games by provider
 */
export const getGamesByProvider = async (provider: string, limit = 10): Promise<GameData[]> => {
  try {
    const query = 'SELECT * FROM games WHERE provider_id = ? ORDER BY popularity DESC LIMIT ?';
    const results = await safeQuery(query, [provider, limit]);
    return results as GameData[];
  } catch (error) {
    console.error('Error getting games by provider:', error);
    return [];
  }
};

/**
 * Get games by type
 */
export const getGamesByType = async (type: string, limit = 10): Promise<GameData[]> => {
  try {
    const query = 'SELECT * FROM games WHERE type = ? ORDER BY popularity DESC LIMIT ?';
    const results = await safeQuery(query, [type, limit]);
    return results as GameData[];
  } catch (error) {
    console.error('Error getting games by type:', error);
    return [];
  }
};

/**
 * Get games by theme
 */
export const getGamesByTheme = async (theme: string, limit = 10): Promise<GameData[]> => {
  try {
    const query = 'SELECT * FROM games WHERE theme = ? ORDER BY popularity DESC LIMIT ?';
    const results = await safeQuery(query, [theme, limit]);
    return results as GameData[];
  } catch (error) {
    console.error('Error getting games by theme:', error);
    return [];
  }
};

/**
 * Search games by name or game_id
 */
export const searchGames = async (search: string, limit = 10): Promise<GameData[]> => {
  try {
    const searchTerm = `%${search}%`;
    const query = 'SELECT * FROM games WHERE game_name LIKE ? OR game_id LIKE ? ORDER BY popularity DESC LIMIT ?';
    const results = await safeQuery(query, [searchTerm, searchTerm, limit]);
    return results as GameData[];
  } catch (error) {
    console.error('Error searching games:', error);
    return [];
  }
};

/**
 * Get popular game types
 */
export const getPopularGameTypes = async (limit = 5): Promise<{ type: string; count: number }[]> => {
  try {
    const query = `
      SELECT type, COUNT(*) AS count 
      FROM games 
      GROUP BY type 
      ORDER BY count DESC 
      LIMIT ?
    `;
    const results = await safeQuery(query, [limit]);
    return results.map(row => ({ type: row.type, count: row.count })) as { type: string; count: number }[];
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
