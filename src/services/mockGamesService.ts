
import { Game, GameListParams, GameResponse, GameProvider } from '@/types/game';
import { adaptGamesForUI, adaptProvidersForUI } from '@/utils/gameAdapter';

/**
 * Mock games service for client-side development
 * This avoids using Node.js specific modules like mysql2 in the browser
 */
export const mockGamesService = {
  getGames: async (params: GameListParams = {}): Promise<GameResponse> => {
    try {
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
          distribution: typeof game.provider === 'string' ? game.provider : '',
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
    } catch (error) {
      console.error("Error in mock games service:", error);
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10
      };
    }
  },

  getGame: async (id: number | string): Promise<Game> => {
    try {
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
        game_code: game.id.replace(/\D/g, '') || '',
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
        distribution: typeof game.provider === 'string' ? game.provider : '',
        views: Math.floor(Math.random() * 1000),
        is_featured: game.isPopular,
        show_home: game.isNew,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error fetching mock game:", error);
      throw error;
    }
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

// Export a simplified API interface that doesn't use Node.js dependencies
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
