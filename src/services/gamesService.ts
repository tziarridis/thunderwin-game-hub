
import axios from 'axios';
import { Game, GameListParams, GameResponse, GameProvider } from '@/types/game';

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Import mock games data for browser environment
const getMockGames = async () => {
  if (isBrowser) {
    return import('@/data/mock-games').then(module => module.default);
  }
  return [];
};

// API service for production use
export const gamesApi = {
  // Get all games with filtering and pagination
  getGames: async (params: GameListParams = {}): Promise<GameResponse> => {
    try {
      const response = await axios.get(`${process.env.API_URL || 'https://api.casino.example.com'}/games`, { 
        params,
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY || 'your-api-key'}`,
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
      const response = await axios.get(`${process.env.API_URL || 'https://api.casino.example.com'}/games/${id}`, {
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY || 'your-api-key'}`,
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
      const response = await axios.get(`${process.env.API_URL || 'https://api.casino.example.com'}/providers`, {
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY || 'your-api-key'}`,
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
      const response = await axios.post(`${process.env.API_URL || 'https://api.casino.example.com'}/games`, game, {
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY || 'your-api-key'}`,
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
      const response = await axios.put(`${process.env.API_URL || 'https://api.casino.example.com'}/games/${game.id}`, game, {
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY || 'your-api-key'}`,
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
      await axios.delete(`${process.env.API_URL || 'https://api.casino.example.com'}/games/${id}`, {
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY || 'your-api-key'}`,
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
      const response = await axios.post(`${process.env.API_URL || 'https://api.casino.example.com'}/providers/${providerId}/import`, {}, {
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY || 'your-api-key'}`,
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
      const response = await axios.patch(`${process.env.API_URL || 'https://api.casino.example.com'}/games/${id}/feature`, {
        feature,
        value
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY || 'your-api-key'}`,
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

// Database service for direct DB access (in browser environment, this uses mock data)
export const gamesDbService = {
  getGames: async (params: GameListParams = {}): Promise<GameResponse> => {
    if (isBrowser) {
      return mockGamesService.getGames(params);
    }
    
    // When in Node.js environment, this would use actual DB queries
    // But in browser, this code is never reached
    console.log('This DB code is only executed in Node.js environment');
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 10
    };
  },

  getGame: async (id: number | string): Promise<Game> => {
    if (isBrowser) {
      return mockGamesService.getGame(id);
    }
    
    // When in Node.js environment, this would use actual DB queries
    // But in browser, this code is never reached
    console.log('This DB code is only executed in Node.js environment');
    throw new Error(`Game with id ${id} not found`);
  },

  getProviders: async (): Promise<GameProvider[]> => {
    if (isBrowser) {
      return mockGamesService.getProviders();
    }
    
    // When in Node.js environment, this would use actual DB queries
    // But in browser, this code is never reached
    console.log('This DB code is only executed in Node.js environment');
    return [];
  },

  addGame: async (game: Omit<Game, 'id'>): Promise<Game> => {
    if (isBrowser) {
      return mockGamesService.addGame(game);
    }
    
    // When in Node.js environment, this would use actual DB queries
    // But in browser, this code is never reached
    console.log('This DB code is only executed in Node.js environment');
    return {} as Game;
  },

  updateGame: async (game: Game): Promise<Game> => {
    if (isBrowser) {
      return mockGamesService.updateGame(game);
    }
    
    // When in Node.js environment, this would use actual DB queries
    // But in browser, this code is never reached
    console.log('This DB code is only executed in Node.js environment');
    return game;
  },

  deleteGame: async (id: number | string): Promise<void> => {
    if (isBrowser) {
      return mockGamesService.deleteGame(id);
    }
    
    // When in Node.js environment, this would use actual DB queries
    // But in browser, this code is never reached
    console.log('This DB code is only executed in Node.js environment');
  },
  
  toggleGameFeature: async (id: number, feature: 'is_featured' | 'show_home', value: boolean): Promise<Game> => {
    if (isBrowser) {
      return mockGamesService.toggleGameFeature(id, feature, value);
    }
    
    // When in Node.js environment, this would use actual DB queries
    // But in browser, this code is never reached
    console.log('This DB code is only executed in Node.js environment');
    return {} as Game;
  },
  
  importGamesFromProvider: async (providerId: number): Promise<Game[]> => {
    if (isBrowser) {
      return mockGamesService.importGamesFromProvider(providerId);
    }
    
    // When in Node.js environment, this would use actual DB queries
    // But in browser, this code is never reached
    console.log('This DB code is only executed in Node.js environment');
    return [];
  }
};

// Export a simplified API interface for client-side use
export const mockGamesService = {
  getGames: async (params: GameListParams = {}): Promise<GameResponse> => {
    // Import mock data dynamically
    const mockData = await getMockGames();
    
    let filteredGames = [...mockData]
      .map(game => ({
        id: parseInt(game.id),
        provider_id: 1,
        game_id: game.id,
        game_name: game.title || '',
        game_code: (game.id && game.id.replace(/\D/g, '')) || '',
        game_type: game.category || 'slots',
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
        distribution: typeof game.provider === 'string' ? game.provider : '',
        views: Math.floor(Math.random() * 1000),
        is_featured: game.isPopular || false,
        show_home: game.isNew || false,
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
    const mockData = await getMockGames();
    const game = mockData.find(g => g.id === id.toString() || parseInt(g.id) === id);
    
    if (!game) {
      throw new Error(`Game with id ${id} not found`);
    }
    
    return {
      id: parseInt(game.id),
      provider_id: 1,
      game_id: game.id,
      game_name: game.title || '',
      game_code: (game.id && game.id.replace(/\D/g, '')) || '',
      game_type: game.category || '',
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
      distribution: typeof game.provider === 'string' ? game.provider : '',
      views: Math.floor(Math.random() * 1000),
      is_featured: game.isPopular || false,
      show_home: game.isNew || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  getProviders: async (): Promise<GameProvider[]> => {
    // Generate mock providers
    return [
      { id: 1, name: 'Pragmatic Play', logo: '/providers/pragmatic.png', status: 'active' },
      { id: 2, name: 'Evolution Gaming', logo: '/providers/evolution.png', status: 'active' },
      { id: 3, name: 'NetEnt', logo: '/providers/netent.png', status: 'active' },
      { id: 4, name: 'Microgaming', logo: '/providers/microgaming.png', status: 'active' },
      { id: 5, name: 'Play\'n GO', logo: '/providers/playngo.png', status: 'active' }
    ];
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
      
      if (!game) {
        throw new Error(`Game with id ${id} not found`);
      }
      
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
