
import { browserDb } from './browserDbAdapter';
import { 
  GameData, 
  GameFilterOptions, 
  GameQueryOptions,
  DatabaseQueryResult 
} from '@/types/gameService';

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Only try to import modules if we're in a Node.js environment
let mysql = null;
let fs = null;

if (!isBrowser) {
  try {
    // Dynamic imports for server environment
    mysql = require('mysql2/promise');
    fs = require('fs');
  } catch (error) {
    console.error('Error importing Node.js modules:', error);
  }
}

// Game data structure
const gameTableStructure = `
CREATE TABLE IF NOT EXISTS games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider_id VARCHAR(255) NOT NULL,
  game_id VARCHAR(255) NOT NULL,
  game_name VARCHAR(255) NOT NULL,
  game_code VARCHAR(255),
  type VARCHAR(255),
  theme VARCHAR(255),
  is_mobile BOOLEAN DEFAULT TRUE,
  is_desktop BOOLEAN DEFAULT TRUE,
  thumbnail VARCHAR(255),
  background VARCHAR(255),
  is_featured BOOLEAN DEFAULT FALSE,
  show_home BOOLEAN DEFAULT TRUE,
  popularity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;

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
 * Ensure game tables exist in the database
 */
export const ensureGameTables = async (): Promise<boolean> => {
  if (isBrowser) {
    console.log('Browser environment, skipping DB table creation');
    return true;
  }
  
  try {
    await safeQuery(gameTableStructure);
    console.log('Game tables verified/created');
    return true;
  } catch (error) {
    console.error('Error creating game tables:', error);
    return false;
  }
};

/**
 * Get all games with optional filtering
 */
export const getAllGames = async (
  filters: GameFilterOptions = {},
  options: GameQueryOptions = {}
): Promise<GameData[]> => {
  try {
    let query = 'SELECT * FROM games';
    const queryParams: any[] = [];
    
    // Add filters if provided
    if (Object.keys(filters).length > 0) {
      const filterClauses: string[] = [];
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'search' && filters.search) {
            filterClauses.push('(game_name LIKE ? OR game_id LIKE ? OR type LIKE ? OR theme LIKE ?)');
            const searchPattern = `%${value}%`;
            queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
          } else {
            filterClauses.push(`${key} = ?`);
            queryParams.push(value);
          }
        }
      });
      
      if (filterClauses.length > 0) {
        query += ' WHERE ' + filterClauses.join(' AND ');
      }
    }
    
    // Add order by
    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy} ${options.order === 'desc' ? 'DESC' : 'ASC'}`;
    } else {
      query += ' ORDER BY popularity DESC';
    }
    
    // Add limit
    if (options.limit) {
      query += ' LIMIT ?';
      queryParams.push(options.limit);
      
      // Add offset if provided
      if (options.offset) {
        query += ' OFFSET ?';
        queryParams.push(options.offset);
      }
    }
    
    const results = await safeQuery(query, queryParams);
    return results as GameData[];
  } catch (error) {
    console.error('Error getting games:', error);
    return [];
  }
};

/**
 * Get a single game by ID
 */
export const getGameById = async (id: number | string): Promise<GameData | null> => {
  try {
    const query = 'SELECT * FROM games WHERE id = ? LIMIT 1';
    const results = await safeQuery(query, [id]);
    
    if (results && results.length > 0) {
      return results[0] as GameData;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting game by ID:', error);
    return null;
  }
};

/**
 * Get a single game by game_id (provider's game ID)
 */
export const getGameByGameId = async (gameId: string): Promise<GameData | null> => {
  try {
    const query = 'SELECT * FROM games WHERE game_id = ? LIMIT 1';
    const results = await safeQuery(query, [gameId]);
    
    if (results && results.length > 0) {
      return results[0] as GameData;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting game by game_id:', error);
    return null;
  }
};

/**
 * Create a new game
 */
export const createGame = async (gameData: GameData): Promise<GameData | null> => {
  try {
    const fields = Object.keys(gameData).join(', ');
    const placeholders = Object.keys(gameData).map(() => '?').join(', ');
    const values = Object.values(gameData);
    
    const query = `INSERT INTO games (${fields}) VALUES (${placeholders})`;
    const result = await safeQuery(query, values);
    
    if (result && result[0] && result[0].insertId) {
      return { id: result[0].insertId, ...gameData };
    }
    
    return null;
  } catch (error) {
    console.error('Error creating game:', error);
    return null;
  }
};

/**
 * Update an existing game
 */
export const updateGame = async (id: number | string, gameData: Partial<GameData>): Promise<GameData | null> => {
  try {
    const updates = Object.entries(gameData)
      .map(([key, _]) => `${key} = ?`)
      .join(', ');
    
    const values = [...Object.values(gameData), id];
    
    const query = `UPDATE games SET ${updates} WHERE id = ?`;
    const result = await safeQuery(query, values);
    
    if (result && result[0] && result[0].affectedRows > 0) {
      // Fetch the updated game to return
      return await getGameById(id);
    }
    
    return null;
  } catch (error) {
    console.error('Error updating game:', error);
    return null;
  }
};

/**
 * Delete a game
 */
export const deleteGame = async (id: number | string): Promise<boolean> => {
  try {
    const query = 'DELETE FROM games WHERE id = ?';
    const result = await safeQuery(query, [id]);
    
    if (result && result[0] && result[0].affectedRows > 0) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting game:', error);
    return false;
  }
};

/**
 * Update game popularity
 */
export const updateGamePopularity = async (id: number | string, increment = 1): Promise<boolean> => {
  try {
    const getQuery = 'SELECT popularity FROM games WHERE id = ?';
    const currentPopularity = await safeQuery(getQuery, [id]);
    
    if (!currentPopularity || currentPopularity.length === 0) {
      return false;
    }
    
    const newPopularity = (currentPopularity[0].popularity || 0) + increment;
    
    const updateQuery = 'UPDATE games SET popularity = ? WHERE id = ?';
    const result = await safeQuery(updateQuery, [newPopularity, id]);
    
    if (result && result[0] && result[0].affectedRows > 0) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating game popularity:', error);
    return false;
  }
};

export default {
  ensureGameTables,
  getAllGames,
  getGameById,
  getGameByGameId,
  createGame,
  updateGame,
  deleteGame,
  updateGamePopularity
};
