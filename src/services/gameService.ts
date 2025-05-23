
import { DbGame, GameCategory, GameProvider } from '@/types';

export const gameService = {
  getAllGames: async (filters?: any): Promise<{ games: DbGame[], count: number }> => {
    console.log('gameService: Fetching all games with filters', filters);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { games: [], count: 0 };
    } catch (error: any) {
      console.error('Error fetching games:', error.message);
      throw error;
    }
  },

  getGameById: async (gameId: string): Promise<DbGame> => {
    console.log(`gameService: Fetching game by ID ${gameId}`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock game data
      return {
        id: gameId,
        game_name: 'Sample Game',
        title: 'Sample Game Title',
        description: 'A sample game description',
        status: 'active' as any,
        provider_slug: 'sample-provider',
        category_slugs: ['slots'],
        rtp: 96.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as DbGame;
    } catch (error: any) {
      console.error('Error fetching game by ID:', error.message);
      throw error;
    }
  },

  getGameBySlug: async (slug: string): Promise<DbGame> => {
    console.log(`gameService: Fetching game by slug ${slug}`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock game data
      return {
        id: 'game-' + slug,
        game_name: 'Sample Game',
        title: 'Sample Game Title',
        description: 'A sample game description',
        status: 'active' as any,
        provider_slug: 'sample-provider',
        category_slugs: ['slots'],
        rtp: 96.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as DbGame;
    } catch (error: any) {
      console.error('Error fetching game by slug:', error.message);
      throw error;
    }
  },

  getGameCategories: async (): Promise<GameCategory[]> => {
    console.log('gameService: Fetching game categories');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [];
    } catch (error: any) {
      console.error('Error fetching categories:', error.message);
      throw error;
    }
  },

  getGameProviders: async (): Promise<GameProvider[]> => {
    console.log('gameService: Fetching game providers');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [];
    } catch (error: any) {
      console.error('Error fetching providers:', error.message);
      throw error;
    }
  },

  updateGame: async (id: string, gameData: Partial<DbGame>): Promise<DbGame> => {
    console.log(`gameService: Updating game ${id}`, gameData);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id, ...gameData } as DbGame;
    } catch (error: any) {
      console.error('Error updating game:', error.message);
      throw error;
    }
  },

  createGame: async (gameData: Omit<DbGame, 'id' | 'created_at' | 'updated_at'>): Promise<DbGame> => {
    console.log('gameService: Creating game', gameData);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id: 'new-game-id', ...gameData } as DbGame;
    } catch (error: any) {
      console.error('Error creating game:', error.message);
      throw error;
    }
  },

  deleteGame: async (id: string): Promise<void> => {
    console.log(`gameService: Deleting game ${id}`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error: any) {
      console.error('Error deleting game:', error.message);
      throw error;
    }
  }
};

export default gameService;
