import axios from 'axios';
import { Game, GameListParams, GameResponse, GameProvider } from '@/types/game';
import { query, transaction, mockQuery } from './databaseService';

const API_URL = process.env.API_URL || 'https://api.casino.example.com';
const API_KEY = process.env.API_KEY || 'your-api-key';

// API service for production use
export const gamesApi = {
  // Get all games with filtering and pagination
  getGames: async (params: GameListParams = {}): Promise<GameResponse> => {
    try {
      const response = await axios.get(`${API_URL}/games`, { 
        params,
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching games:', error);
      // Fallback to local database if API fails
      if (process.env.NODE_ENV === 'development') {
        return gamesDbService.getGames(params);
      }
      throw error;
    }
  },

  getGame: async (id: number | string): Promise<Game> => {
    try {
      const response = await axios.get(`${API_URL}/games/${id}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching game with id ${id}:`, error);
      if (process.env.NODE_ENV === 'development') {
        return gamesDbService.getGame(id);
      }
      throw error;
    }
  },

  getProviders: async (): Promise<GameProvider[]> => {
    try {
      const response = await axios.get(`${API_URL}/providers`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching game providers:', error);
      if (process.env.NODE_ENV === 'development') {
        return gamesDbService.getProviders();
      }
      throw error;
    }
  },

  // Add a new game
  addGame: async (game: Omit<Game, 'id'>): Promise<Game> => {
    try {
      const response = await axios.post(`${API_URL}/games`, game, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding game:', error);
      throw error;
    }
  },

  // Update an existing game
  updateGame: async (game: Game): Promise<Game> => {
    try {
      const response = await axios.put(`${API_URL}/games/${game.id}`, game, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating game with id ${game.id}:`, error);
      throw error;
    }
  },

  // Delete a game
  deleteGame: async (id: number | string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/games/${id}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error(`Error deleting game with id ${id}:`, error);
      throw error;
    }
  },
  
  // Import games from provider
  importGamesFromProvider: async (providerId: number): Promise<Game[]> => {
    try {
      const response = await axios.post(`${API_URL}/providers/${providerId}/import`, {}, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error importing games from provider ${providerId}:`, error);
      throw error;
    }
  },
  
  // Toggle game feature status
  toggleGameFeature: async (id: number, feature: 'is_featured' | 'show_home', value: boolean): Promise<Game> => {
    try {
      const response = await axios.patch(`${API_URL}/games/${id}/feature`, {
        feature,
        value
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error toggling feature for game ${id}:`, error);
      throw error;
    }
  }
};

// Database service for direct DB access
export const gamesDbService = {
  getGames: async (params: GameListParams = {}): Promise<GameResponse> => {
    let sql = `
      SELECT g.*, p.name as provider_name, p.logo as provider_logo 
      FROM games g
      LEFT JOIN providers p ON g.provider_id = p.id
      WHERE 1=1
    `;
    const sqlParams: any[] = [];

    if (params.provider_id) {
      sql += ' AND g.provider_id = ?';
      sqlParams.push(params.provider_id);
    }

    if (params.game_type) {
      sql += ' AND g.game_type = ?';
      sqlParams.push(params.game_type);
    }

    if (params.status) {
      sql += ' AND g.status = ?';
      sqlParams.push(params.status);
    }

    if (params.is_featured !== undefined) {
      sql += ' AND g.is_featured = ?';
      sqlParams.push(params.is_featured ? 1 : 0);
    }

    if (params.show_home !== undefined) {
      sql += ' AND g.show_home = ?';
      sqlParams.push(params.show_home ? 1 : 0);
    }

    if (params.search) {
      sql += ' AND (g.game_name LIKE ? OR g.game_code LIKE ? OR g.description LIKE ?)';
      const searchTerm = `%${params.search}%`;
      sqlParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Count total records for pagination
    const countSql = sql.replace('SELECT g.*, p.name as provider_name, p.logo as provider_logo', 'SELECT COUNT(*) as total');
    const countResult = await query(countSql, sqlParams) as any[];
    const total = countResult && countResult.length > 0 ? countResult[0]?.total || 0 : 0;

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    sqlParams.push(limit, offset);

    const games = await query(sql, sqlParams) as any[];
    
    // Format the results to match the Game type
    const formattedGames = games.map(game => ({
      ...game,
      provider: game.provider_id ? {
        id: game.provider_id,
        name: game.provider_name || '',
        logo: game.provider_logo || '',
        status: 'active'
      } : undefined
    }));

    return {
      data: formattedGames,
      total,
      page,
      limit
    };
  },

  getGame: async (id: number | string): Promise<Game> => {
    const sql = `
      SELECT g.*, p.name as provider_name, p.logo as provider_logo 
      FROM games g
      LEFT JOIN providers p ON g.provider_id = p.id
      WHERE g.id = ?
    `;
    const games = await query(sql, [id]) as any[];
    
    if (games.length === 0) {
      throw new Error(`Game with id ${id} not found`);
    }
    
    const game = games[0];
    return {
      ...game,
      provider: game.provider_id ? {
        id: game.provider_id,
        name: game.provider_name || '',
        logo: game.provider_logo || '',
        status: 'active'
      } : undefined
    };
  },

  getProviders: async (): Promise<GameProvider[]> => {
    const sql = 'SELECT * FROM providers WHERE status = "active"';
    return query(sql) as Promise<GameProvider[]>;
  },

  addGame: async (game: Omit<Game, 'id'>): Promise<Game> => {
    const fields = Object.keys(game).filter(key => key !== 'provider');
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map(field => (game as any)[field]);

    const sql = `INSERT INTO games (${fields.join(', ')}) VALUES (${placeholders})`;
    const result = await query(sql, values) as any;
    
    return {
      ...game,
      id: result?.insertId || Math.floor(Math.random() * 10000)
    } as Game;
  },

  updateGame: async (game: Game): Promise<Game> => {
    const { id, provider, ...data } = game;
    const fields = Object.keys(data).map(field => `${field} = ?`).join(', ');
    const values = [...Object.values(data), id];

    const sql = `UPDATE games SET ${fields} WHERE id = ?`;
    await query(sql, values);
    
    return game;
  },

  deleteGame: async (id: number | string): Promise<void> => {
    const sql = 'DELETE FROM games WHERE id = ?';
    await query(sql, [id]);
  },
  
  toggleGameFeature: async (id: number, feature: 'is_featured' | 'show_home', value: boolean): Promise<Game> => {
    const sql = `UPDATE games SET ${feature} = ? WHERE id = ?`;
    await query(sql, [value ? 1 : 0, id]);
    return this.getGame(id);
  },
  
  importGamesFromProvider: async (providerId: number): Promise<Game[]> => {
    // This would typically connect to the provider's API to fetch games
    // Here we'll just return a message that this is a mock implementation
    console.log(`Mock import games from provider ${providerId}`);
    return mockQuery([]) as Promise<Game[]>;
  }
};

// Export a simplified API interface for client-side use
export const mockGamesService = {
  getGames: async (params: GameListParams = {}): Promise<GameResponse> => {
    // Import mock data dynamically
    const mockData = await import('@/data/mock-games').then(module => module.default);
    
    let filteredGames = [...mockData]
      .map(game => ({
        id: parseInt(game.id),
        provider_id: 1,
        game_id: game.id,
        game_name: game.title,
        game_code: game.id.replace(/\D/g, ''),
        game_type: game.category,
        description: game.description || '',
        cover: game.image || '',
        status: 'active',
        technology: 'HTML5',
        has_lobby: false,
        is_mobile: true,
        has_freespins: game.category === 'slots',
        has_tables: game.category === 'table',
        only_demo: false,
        rtp: game.rtp || 96,
        distribution: game.provider,
        views: Math.floor(Math.random() * 1000),
        is_featured: game.isPopular,
        show_home: game.isNew,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Game));
    
    // Apply filters
    if (params.provider_id) {
      filteredGames = filteredGames.filter(game => game.provider_id === params.provider_id);
    }
    
    if (params.game_type) {
      filteredGames = filteredGames.filter(game => game.game_type === params.game_type);
    }
    
    if (params.is_featured !== undefined) {
      filteredGames = filteredGames.filter(game => game.is_featured === params.is_featured);
    }
    
    if (params.show_home !== undefined) {
      filteredGames = filteredGames.filter(game => game.show_home === params.show_home);
    }
    
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredGames = filteredGames.filter(game => 
        game.game_name.toLowerCase().includes(searchTerm) || 
        game.game_code.toLowerCase().includes(searchTerm) ||
        (game.description && game.description.toLowerCase().includes(searchTerm))
      );
    }
    
    const total = filteredGames.length;
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      data: filteredGames.slice(startIndex, endIndex),
      total,
      page,
      limit
    };
  },

  getGame: async (id: number | string): Promise<Game> => {
    const mockData = await import('@/data/mock-games').then(module => module.default);
    const game = mockData.find(g => g.id === id.toString() || parseInt(g.id) === id);
    
    if (!game) {
      throw new Error(`Game with id ${id} not found`);
    }
    
    return {
      id: parseInt(game.id),
      provider_id: 1,
      game_id: game.id,
      game_name: game.title,
      game_code: (game.id && game.id.replace(/\D/g, '')) || '',
      game_type: game.category,
      description: game.description || '',
      cover: game.image || '',
      status: 'active',
      technology: 'HTML5',
      has_lobby: false,
      is_mobile: true,
      has_freespins: game.category === 'slots',
      has_tables: game.category === 'table',
      only_demo: false,
      rtp: game.rtp,
      distribution: typeof game.provider === 'string' ? game.provider : '',
      views: Math.floor(Math.random() * 1000),
      is_featured: game.isPopular,
      show_home: game.isNew,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  getProviders: async (): Promise<GameProvider[]> => {
    // Generate mock providers
    return mockQuery([
      { id: 1, name: 'Pragmatic Play', logo: '/providers/pragmatic.png', status: 'active' },
      { id: 2, name: 'Evolution Gaming', logo: '/providers/evolution.png', status: 'active' },
      { id: 3, name: 'NetEnt', logo: '/providers/netent.png', status: 'active' },
      { id: 4, name: 'Microgaming', logo: '/providers/microgaming.png', status: 'active' },
      { id: 5, name: 'Play\'n GO', logo: '/providers/playngo.png', status: 'active' }
    ]);
  },
  
  addGame: async (game: Omit<Game, 'id'>): Promise<Game> => {
    console.log("Mock adding game:", game);
    return {
      ...game,
      id: Math.floor(Math.random() * 10000),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Game;
  },
  
  updateGame: async (game: Game): Promise<Game> => {
    console.log("Mock updating game:", game);
    return {
      ...game,
      updated_at: new Date().toISOString()
    };
  },
  
  deleteGame: async (id: number | string): Promise<void> => {
    console.log("Mock deleting game:", id);
    return Promise.resolve();
  },
  
  toggleGameFeature: async (id: number, feature: 'is_featured' | 'show_home', value: boolean): Promise<Game> => {
    console.log(`Mock toggling ${feature} to ${value} for game ${id}`);
    try {
      const game = await this.getGame(id);
      if (feature === 'is_featured') {
        game.is_featured = value;
      } else if (feature === 'show_home') {
        game.show_home = value;
      }
      return game;
    } catch (error) {
      console.error(`Error toggling feature for game ${id}:`, error);
      throw error;
    }
  },
  
  importGamesFromProvider: async (providerId: number): Promise<Game[]> => {
    console.log(`Mock import games from provider ${providerId}`);
    return [];
  }
};

// Export a simplified API interface for client-side use
export const clientGamesApi = {
  getGames: async (params: GameListParams = {}): Promise<GameResponse> => {
    try {
      const response = await mockGamesService.getGames(params);
      return response;
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  },

  getGame: async (id: number | string): Promise<Game> => {
    try {
      const game = await mockGamesService.getGame(id);
      return game;
    } catch (error) {
      console.error(`Error fetching game with id ${id}:`, error);
      throw error;
    }
  },

  getProviders: async (): Promise<GameProvider[]> => {
    try {
      const providers = await mockGamesService.getProviders();
      return providers;
    } catch (error) {
      console.error('Error fetching game providers:', error);
      throw error;
    }
  },

  addGame: async (game: Omit<Game, 'id'>): Promise<Game> => {
    try {
      const newGame = await mockGamesService.addGame(game);
      return newGame;
    } catch (error) {
      console.error('Error adding game:', error);
      throw error;
    }
  },

  updateGame: async (game: Game): Promise<Game> => {
    try {
      const updatedGame = await mockGamesService.updateGame(game);
      return updatedGame;
    } catch (error) {
      console.error(`Error updating game with id ${game.id}:`, error);
      throw error;
    }
  },

  deleteGame: async (id: number | string): Promise<void> => {
    try {
      await mockGamesService.deleteGame(id);
    } catch (error) {
      console.error(`Error deleting game with id ${id}:`, error);
      throw error;
    }
  },
  
  toggleGameFeature: async (id: number, feature: 'is_featured' | 'show_home', value: boolean): Promise<Game> => {
    try {
      const game = await mockGamesService.toggleGameFeature(id, feature, value);
      return game;
    } catch (error) {
      console.error(`Error toggling feature for game ${id}:`, error);
      throw error;
    }
  },
  
  importGamesFromProvider: async (providerId: number): Promise<Game[]> => {
    try {
      const games = await mockGamesService.importGamesFromProvider(providerId);
      return games;
    } catch (error) {
      console.error(`Error importing games from provider ${providerId}:`, error);
      throw error;
    }
  }
};
