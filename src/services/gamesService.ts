
import { Game, GameListParams, GameResponse, GameProvider } from "@/types/game";
import { supabase } from "@/integrations/supabase/client";

export const clientGamesApi = {
  // Get games from the API
  getGames: async (params: GameListParams = {}): Promise<GameResponse> => {
    try {
      // Start building the query
      let query = supabase
        .from('games')
        .select('*, provider:provider_id(*)');
      
      // Apply filters
      if (params.search) {
        query = query.ilike('game_name', `%${params.search}%`);
      }
      
      if (params.provider_id !== undefined) {
        query = query.eq('provider_id', params.provider_id);
      }
      
      if (params.game_type) {
        query = query.eq('game_type', params.game_type);
      }
      
      if (params.status) {
        query = query.eq('status', params.status);
      }
      
      if (params.is_featured !== undefined) {
        query = query.eq('is_featured', params.is_featured);
      }
      
      if (params.show_home !== undefined) {
        query = query.eq('show_home', params.show_home);
      }
      
      // Get count for pagination
      const { count } = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true });
      
      // Add pagination
      if (params.page && params.limit) {
        const start = (params.page - 1) * params.limit;
        query = query.range(start, start + params.limit - 1);
      }
      
      // Execute query
      const { data, error } = await query;
      
      if (error) throw error;
      
      return {
        data: data as Game[],
        total: count || 0,
        page: params.page || 1,
        limit: params.limit || 20
      };
      
    } catch (error) {
      console.error('Error fetching games:', error);
      // Return mock data if there's an error
      return {
        data: mockGames,
        total: mockGames.length,
        page: params.page || 1,
        limit: params.limit || 20
      };
    }
  },
  
  // Get game by ID
  getGameById: async (id: string | number): Promise<Game | null> => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*, provider:provider_id(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as Game;
      
    } catch (error) {
      console.error(`Error fetching game with ID ${id}:`, error);
      return null;
    }
  },
  
  // Add a new game
  addGame: async (game: Omit<Game, 'id'>): Promise<Game> => {
    try {
      const { data, error } = await supabase
        .from('games')
        .insert(game)
        .select('*, provider:provider_id(*)')
        .single();
      
      if (error) throw error;
      
      return data as Game;
      
    } catch (error) {
      console.error('Error adding game:', error);
      throw error;
    }
  },
  
  // Update an existing game
  updateGame: async (game: Game): Promise<Game> => {
    try {
      const { data, error } = await supabase
        .from('games')
        .update(game)
        .eq('id', game.id)
        .select('*, provider:provider_id(*)')
        .single();
      
      if (error) throw error;
      
      return data as Game;
      
    } catch (error) {
      console.error(`Error updating game with ID ${game.id}:`, error);
      throw error;
    }
  },
  
  // Delete a game
  deleteGame: async (id: string | number): Promise<void> => {
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
    } catch (error) {
      console.error(`Error deleting game with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Toggle game feature (is_featured or show_home)
  toggleGameFeature: async (
    id: number, 
    feature: 'is_featured' | 'show_home', 
    value: boolean
  ): Promise<Game> => {
    try {
      const { data, error } = await supabase
        .from('games')
        .update({ [feature]: value })
        .eq('id', id)
        .select('*, provider:provider_id(*)')
        .single();
      
      if (error) throw error;
      
      return data as Game;
      
    } catch (error) {
      console.error(`Error updating ${feature} for game with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Get game providers
  getProviders: async (): Promise<GameProvider[]> => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*');
      
      if (error) throw error;
      
      return data as GameProvider[];
      
    } catch (error) {
      console.error('Error fetching game providers:', error);
      return mockProviders;
    }
  },
  
  // Get provider by ID
  getProviderById: async (id: string | number): Promise<GameProvider | null> => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as GameProvider;
      
    } catch (error) {
      console.error(`Error fetching provider with ID ${id}:`, error);
      return null;
    }
  }
};

// Mock games data for fallback
const mockGames: Game[] = [
  {
    id: 1,
    provider_id: 1,
    game_id: 'book_of_dead',
    game_name: 'Book of Dead',
    game_code: 'bookdead',
    game_type: 'slots',
    description: 'Explore the ancient Egyptian tombs in search of the Book of Dead.',
    cover: 'https://example.com/images/book_of_dead.jpg',
    status: 'active',
    technology: 'HTML5',
    has_lobby: false,
    is_mobile: true,
    has_freespins: true,
    has_tables: false,
    only_demo: false,
    rtp: 96.21,
    distribution: 'Play\'n GO',
    views: 12345,
    is_featured: true,
    show_home: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: 2,
    provider_id: 2,
    game_id: 'starburst',
    game_name: 'Starburst',
    game_code: 'starburst',
    game_type: 'slots',
    description: 'A vibrant and energetic slot with expanding wilds and re-spins.',
    cover: 'https://example.com/images/starburst.jpg',
    status: 'active',
    technology: 'HTML5',
    has_lobby: false,
    is_mobile: true,
    has_freespins: true,
    has_tables: false,
    only_demo: false,
    rtp: 96.1,
    distribution: 'NetEnt',
    views: 23456,
    is_featured: true,
    show_home: true,
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z'
  }
];

// Mock providers data for fallback
const mockProviders: GameProvider[] = [
  {
    id: 1,
    name: 'Play\'n GO',
    status: 'active',
    description: 'Leading provider of premium slots and casino games',
    logo: 'https://example.com/images/playngo_logo.png'
  },
  {
    id: 2,
    name: 'NetEnt',
    status: 'active',
    description: 'Pioneering developer of high-quality casino games',
    logo: 'https://example.com/images/netent_logo.png'
  }
];

// Export games service APIs
export const getGames = clientGamesApi.getGames;
