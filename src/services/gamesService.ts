
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

// Import browser-safe mock database service
import { browserDb } from './browserSafeDatabaseService';

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
const safeQuery = async (sql, params = []) => {
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

// Make sure tables exist
export const ensureGameTables = async () => {
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

// Get all games with optional filtering
export const getAllGames = async (filters = {}) => {
  try {
    let query = 'SELECT * FROM games';
    const queryParams = [];
    
    // Add filters if provided
    if (Object.keys(filters).length > 0) {
      const filterClauses = [];
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          filterClauses.push(`${key} = ?`);
          queryParams.push(value);
        }
      });
      
      if (filterClauses.length > 0) {
        query += ' WHERE ' + filterClauses.join(' AND ');
      }
    }
    
    query += ' ORDER BY popularity DESC';
    
    const results = await safeQuery(query, queryParams);
    return results;
  } catch (error) {
    console.error('Error getting games:', error);
    return [];
  }
};

// Get featured games
export const getFeaturedGames = async (limit = 10) => {
  try {
    const query = 'SELECT * FROM games WHERE is_featured = TRUE ORDER BY popularity DESC LIMIT ?';
    const results = await safeQuery(query, [limit]);
    return results;
  } catch (error) {
    console.error('Error getting featured games:', error);
    return [];
  }
};

// Get games for home page
export const getHomeGames = async (limit = 12) => {
  try {
    const query = 'SELECT * FROM games WHERE show_home = TRUE ORDER BY popularity DESC LIMIT ?';
    const results = await safeQuery(query, [limit]);
    return results;
  } catch (error) {
    console.error('Error getting home games:', error);
    return [];
  }
};

// Get games by provider
export const getGamesByProvider = async (providerId) => {
  try {
    const query = 'SELECT * FROM games WHERE provider_id = ? ORDER BY popularity DESC';
    const results = await safeQuery(query, [providerId]);
    return results;
  } catch (error) {
    console.error('Error getting games by provider:', error);
    return [];
  }
};

// Get games by type
export const getGamesByType = async (type, limit = 50) => {
  try {
    const query = 'SELECT * FROM games WHERE type = ? ORDER BY popularity DESC LIMIT ?';
    const results = await safeQuery(query, [type, limit]);
    return results;
  } catch (error) {
    console.error('Error getting games by type:', error);
    return [];
  }
};

// Get games by theme
export const getGamesByTheme = async (theme, limit = 50) => {
  try {
    const query = 'SELECT * FROM games WHERE theme = ? ORDER BY popularity DESC LIMIT ?';
    const results = await safeQuery(query, [theme, limit]);
    return results;
  } catch (error) {
    console.error('Error getting games by theme:', error);
    return [];
  }
};

// Get a single game by ID
export const getGameById = async (id) => {
  try {
    const query = 'SELECT * FROM games WHERE id = ? LIMIT 1';
    const results = await safeQuery(query, [id]);
    
    if (results && results.length > 0) {
      return results[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error getting game by ID:', error);
    return null;
  }
};

// Get a single game by game_id (provider's game ID)
export const getGameByGameId = async (gameId) => {
  try {
    const query = 'SELECT * FROM games WHERE game_id = ? LIMIT 1';
    const results = await safeQuery(query, [gameId]);
    
    if (results && results.length > 0) {
      return results[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error getting game by game_id:', error);
    return null;
  }
};

// Create a new game
export const createGame = async (gameData) => {
  try {
    const fields = Object.keys(gameData).join(', ');
    const placeholders = Object.keys(gameData).map(() => '?').join(', ');
    const values = Object.values(gameData);
    
    const query = `INSERT INTO games (${fields}) VALUES (${placeholders})`;
    const result = await safeQuery(query, values);
    
    if (result && result.insertId) {
      return { id: result.insertId, ...gameData };
    }
    
    return null;
  } catch (error) {
    console.error('Error creating game:', error);
    return null;
  }
};

// Update an existing game
export const updateGame = async (id, gameData) => {
  try {
    const updates = Object.entries(gameData)
      .map(([key, _]) => `${key} = ?`)
      .join(', ');
    
    const values = [...Object.values(gameData), id];
    
    const query = `UPDATE games SET ${updates} WHERE id = ?`;
    const result = await safeQuery(query, values);
    
    if (result && result.affectedRows > 0) {
      return { id, ...gameData };
    }
    
    return null;
  } catch (error) {
    console.error('Error updating game:', error);
    return null;
  }
};

// Delete a game
export const deleteGame = async (id) => {
  try {
    const query = 'DELETE FROM games WHERE id = ?';
    const result = await safeQuery(query, [id]);
    
    if (result && result.affectedRows > 0) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting game:', error);
    return false;
  }
};

// Search games
export const searchGames = async (searchTerm, limit = 50) => {
  try {
    const query = `
      SELECT * FROM games 
      WHERE 
        game_name LIKE ? OR 
        game_id LIKE ? OR 
        type LIKE ? OR 
        theme LIKE ?
      ORDER BY popularity DESC
      LIMIT ?
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const params = [searchPattern, searchPattern, searchPattern, searchPattern, limit];
    
    const results = await safeQuery(query, params);
    return results;
  } catch (error) {
    console.error('Error searching games:', error);
    return [];
  }
};

// Update game popularity
export const updateGamePopularity = async (id, increment = 1) => {
  try {
    const getQuery = 'SELECT popularity FROM games WHERE id = ?';
    const currentPopularity = await safeQuery(getQuery, [id]);
    
    if (!currentPopularity || currentPopularity.length === 0) {
      return false;
    }
    
    const newPopularity = (currentPopularity[0].popularity || 0) + increment;
    
    const updateQuery = 'UPDATE games SET popularity = ? WHERE id = ?';
    const result = await safeQuery(updateQuery, [newPopularity, id]);
    
    if (result && result.affectedRows > 0) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating game popularity:', error);
    return false;
  }
};

// Get popular game types
export const getPopularGameTypes = async (limit = 10) => {
  try {
    const query = `
      SELECT type, COUNT(*) as count 
      FROM games 
      GROUP BY type 
      ORDER BY count DESC 
      LIMIT ?
    `;
    
    const results = await safeQuery(query, [limit]);
    return results;
  } catch (error) {
    console.error('Error getting popular game types:', error);
    return [];
  }
};

// Import games from JSON file (server-side only)
export const importGamesFromJson = async (filePath) => {
  if (isBrowser || !fs) {
    console.error('Cannot import games in browser environment');
    return { success: false, message: 'Import only available in server environment' };
  }
  
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const games = JSON.parse(data);
    
    if (!Array.isArray(games)) {
      return { success: false, message: 'Invalid JSON format, expected array' };
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const game of games) {
      try {
        await createGame(game);
        successCount++;
      } catch (error) {
        console.error('Error importing game:', error);
        errorCount++;
      }
    }
    
    return {
      success: true,
      message: `Import complete. ${successCount} games imported, ${errorCount} errors.`
    };
  } catch (error) {
    console.error('Error importing games from JSON:', error);
    return { success: false, message: error.message };
  }
};

// Export all games to JSON (server-side only)
export const exportGamesToJson = async (filePath) => {
  if (isBrowser || !fs) {
    console.error('Cannot export games in browser environment');
    return { success: false, message: 'Export only available in server environment' };
  }
  
  try {
    const games = await getAllGames();
    const jsonData = JSON.stringify(games, null, 2);
    
    fs.writeFileSync(filePath, jsonData, 'utf8');
    
    return {
      success: true,
      message: `Export complete. ${games.length} games exported.`
    };
  } catch (error) {
    console.error('Error exporting games to JSON:', error);
    return { success: false, message: error.message };
  }
};

// Mock data generation for development
export const generateMockGames = async (count = 20) => {
  const gameTypes = ['slots', 'table', 'live', 'jackpot', 'crash'];
  const gameThemes = ['classic', 'adventure', 'fantasy', 'fruit', 'egypt', 'animal', 'space'];
  const providers = ['egt', 'netent', 'pragmatic', 'playtech', 'redtiger', 'playngo'];
  
  const mockGames = [];
  
  for (let i = 0; i < count; i++) {
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const type = gameTypes[Math.floor(Math.random() * gameTypes.length)];
    const theme = gameThemes[Math.floor(Math.random() * gameThemes.length)];
    
    const game = {
      provider_id: provider,
      game_id: `game_${provider}_${i}`,
      game_name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Game ${i}`,
      game_code: `${provider}_${type}_${i}`,
      type,
      theme,
      is_mobile: Math.random() > 0.1, // 90% mobile compatible
      is_desktop: true,
      thumbnail: `/games/${provider}/${type}_${i}.jpg`,
      background: `/games/bg/${provider}_${i}.jpg`,
      is_featured: Math.random() > 0.8, // 20% featured
      show_home: Math.random() > 0.3, // 70% show on home
      popularity: Math.floor(Math.random() * 1000)
    };
    
    mockGames.push(game);
  }
  
  let successCount = 0;
  
  for (const game of mockGames) {
    try {
      await createGame(game);
      successCount++;
    } catch (error) {
      console.error('Error creating mock game:', error);
    }
  }
  
  return {
    success: true,
    message: `Generated ${successCount} mock games.`
  };
};

// Create a mock clientGamesApi implementation for browser environment
export const clientGamesApi = {
  getGames: async (params = {}) => {
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
    // Return mock providers
    return [
      { id: 'pragmatic', name: 'Pragmatic Play', games_count: 250 },
      { id: 'netent', name: 'NetEnt', games_count: 200 },
      { id: 'playtech', name: 'Playtech', games_count: 180 },
      { id: 'microgaming', name: 'Microgaming', games_count: 300 },
      { id: 'evolution', name: 'Evolution Gaming', games_count: 120 },
      { id: 'bgaming', name: 'BGaming', games_count: 80 }
    ];
  },
  
  addGame: async (gameData) => {
    try {
      return await createGame(gameData);
    } catch (error) {
      console.error('Error in clientGamesApi.addGame:', error);
      throw error;
    }
  },
  
  updateGame: async (gameData) => {
    try {
      const { id, ...data } = gameData;
      return await updateGame(id, data);
    } catch (error) {
      console.error('Error in clientGamesApi.updateGame:', error);
      throw error;
    }
  },
  
  deleteGame: async (id) => {
    try {
      return await deleteGame(id);
    } catch (error) {
      console.error('Error in clientGamesApi.deleteGame:', error);
      throw error;
    }
  },
  
  toggleGameFeature: async (id, feature, value) => {
    try {
      // Map API feature names to database column names
      const featureColumn = feature === 'is_featured' ? 'is_featured' : 'show_home';
      
      // Update the feature
      const result = await updateGame(id, { [featureColumn]: value });
      return result;
    } catch (error) {
      console.error('Error in clientGamesApi.toggleGameFeature:', error);
      throw error;
    }
  }
};

// Fix the safeQuery function to match the expected signature (function parameters)
browserDb.query = (sql, params = []) => {
  console.log('Mock browser DB query:', sql, params);
  
  // Return empty results for now
  return [];
};

