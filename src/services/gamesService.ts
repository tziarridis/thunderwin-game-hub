
import axios from 'axios';
import { Game, GameListParams, GameResponse, GameProvider } from '@/types/game';
import { query, mockQuery } from './databaseService';

const API_URL = process.env.API_URL || 'https://api.casino.example.com';

// API service for production use
export const gamesApi = {
  // Get all games with filtering and pagination
  getGames: async (params: GameListParams = {}): Promise<GameResponse> => {
    try {
      const response = await axios.get(`${API_URL}/games`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching games:', error);
      // Fallback to local mock data in development
      if (process.env.NODE_ENV === 'development') {
        return mockGamesService.getGames(params);
      }
      throw error;
    }
  },

  // Get a single game by ID
  getGame: async (id: number | string): Promise<Game> => {
    try {
      const response = await axios.get(`${API_URL}/games/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching game with id ${id}:`, error);
      if (process.env.NODE_ENV === 'development') {
        return mockGamesService.getGame(id);
      }
      throw error;
    }
  },

  // Get all game providers
  getProviders: async (): Promise<GameProvider[]> => {
    try {
      const response = await axios.get(`${API_URL}/providers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching game providers:', error);
      if (process.env.NODE_ENV === 'development') {
        return mockGamesService.getProviders();
      }
      throw error;
    }
  },

  // Add a new game
  addGame: async (game: Omit<Game, 'id'>): Promise<Game> => {
    try {
      const response = await axios.post(`${API_URL}/games`, game);
      return response.data;
    } catch (error) {
      console.error('Error adding game:', error);
      throw error;
    }
  },

  // Update an existing game
  updateGame: async (game: Game): Promise<Game> => {
    try {
      const response = await axios.put(`${API_URL}/games/${game.id}`, game);
      return response.data;
    } catch (error) {
      console.error(`Error updating game with id ${game.id}:`, error);
      throw error;
    }
  },

  // Delete a game
  deleteGame: async (id: number | string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/games/${id}`);
    } catch (error) {
      console.error(`Error deleting game with id ${id}:`, error);
      throw error;
    }
  }
};

// Database service for direct DB access (if API is not available)
export const gamesDbService = {
  getGames: async (params: GameListParams = {}): Promise<GameResponse> => {
    let sql = 'SELECT * FROM games WHERE 1=1';
    const sqlParams: any[] = [];

    if (params.provider_id) {
      sql += ' AND provider_id = ?';
      sqlParams.push(params.provider_id);
    }

    if (params.game_type) {
      sql += ' AND game_type = ?';
      sqlParams.push(params.game_type);
    }

    if (params.status) {
      sql += ' AND status = ?';
      sqlParams.push(params.status);
    }

    if (params.is_featured !== undefined) {
      sql += ' AND is_featured = ?';
      sqlParams.push(params.is_featured ? 1 : 0);
    }

    if (params.show_home !== undefined) {
      sql += ' AND show_home = ?';
      sqlParams.push(params.show_home ? 1 : 0);
    }

    if (params.search) {
      sql += ' AND (game_name LIKE ? OR game_code LIKE ? OR description LIKE ?)';
      const searchTerm = `%${params.search}%`;
      sqlParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Count total records for pagination
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await query(countSql, sqlParams) as any[];
    const total = countResult[0]?.total || 0;

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    sqlParams.push(limit, offset);

    const games = await query(sql, sqlParams) as Game[];

    return {
      data: games,
      total,
      page,
      limit
    };
  },

  getGame: async (id: number | string): Promise<Game> => {
    const sql = 'SELECT * FROM games WHERE id = ?';
    const games = await query(sql, [id]) as Game[];
    
    if (games.length === 0) {
      throw new Error(`Game with id ${id} not found`);
    }
    
    return games[0];
  },

  getProviders: async (): Promise<GameProvider[]> => {
    const sql = 'SELECT * FROM providers';
    return query(sql) as Promise<GameProvider[]>;
  },

  addGame: async (game: Omit<Game, 'id'>): Promise<Game> => {
    const fields = Object.keys(game).join(', ');
    const placeholders = Object.keys(game).map(() => '?').join(', ');
    const values = Object.values(game);

    const sql = `INSERT INTO games (${fields}) VALUES (${placeholders})`;
    const result = await query(sql, values) as any;
    
    return {
      ...game,
      id: result.insertId
    } as Game;
  },

  updateGame: async (game: Game): Promise<Game> => {
    const { id, ...data } = game;
    const fields = Object.keys(data).map(field => `${field} = ?`).join(', ');
    const values = [...Object.values(data), id];

    const sql = `UPDATE games SET ${fields} WHERE id = ?`;
    await query(sql, values);
    
    return game;
  },

  deleteGame: async (id: number | string): Promise<void> => {
    const sql = 'DELETE FROM games WHERE id = ?';
    await query(sql, [id]);
  }
};

// Mock service for development and testing
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
        rtp: game.rtp,
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
      rtp: game.rtp,
      distribution: game.provider,
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
  }
};
