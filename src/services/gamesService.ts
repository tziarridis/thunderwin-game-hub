
import { Game, GameListParams, GameResponse, GameProvider } from "@/types/game";
import { supabase } from "@/integrations/supabase/client";

export const clientGamesApi = {
  // Get games from the API
  getGames: async (params: GameListParams = {}): Promise<GameResponse> => {
    try {
      // In a production app, we would query the Supabase database
      // Since the games table doesn't exist yet in Supabase, returning mock data
      return {
        data: mockGames,
        total: mockGames.length,
        page: params.page || 1,
        limit: params.limit || 20
      };
    } catch (error) {
      console.error('Error fetching games:', error);
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
      // In a production app, we would query the Supabase database
      // Since the games table doesn't exist yet, return mock data
      const game = mockGames.find(g => g.id === id);
      return game || null;
    } catch (error) {
      console.error(`Error fetching game with ID ${id}:`, error);
      return null;
    }
  },
  
  // Add a new game
  addGame: async (game: Omit<Game, 'id'>): Promise<Game> => {
    try {
      // Mock implementation for adding a game
      const newGame = {
        ...game,
        id: Date.now().toString()
      } as Game;
      
      return newGame;
    } catch (error) {
      console.error('Error adding game:', error);
      throw error;
    }
  },
  
  // Update an existing game
  updateGame: async (game: Game): Promise<Game> => {
    try {
      // Mock implementation for updating a game
      return game;
    } catch (error) {
      console.error(`Error updating game with ID ${game.id}:`, error);
      throw error;
    }
  },
  
  // Delete a game
  deleteGame: async (id: string | number): Promise<void> => {
    try {
      // Mock implementation for deleting a game
      console.log(`Game with ID ${id} would be deleted`);
    } catch (error) {
      console.error(`Error deleting game with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Toggle game feature (is_featured or show_home)
  toggleGameFeature: async (
    id: number | string, 
    feature: 'is_featured' | 'show_home', 
    value: boolean
  ): Promise<Game> => {
    try {
      // Mock implementation for toggling a game feature
      const game = mockGames.find(g => g.id === id) as Game;
      if (!game) throw new Error(`Game with ID ${id} not found`);
      
      return {
        ...game,
        [feature]: value
      };
    } catch (error) {
      console.error(`Error updating ${feature} for game with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Get game providers
  getProviders: async (): Promise<GameProvider[]> => {
    try {
      // In a production app, we would query the Supabase database
      // Since the providers table may not exist yet, return mock data
      return mockProviders;
    } catch (error) {
      console.error('Error fetching game providers:', error);
      return mockProviders;
    }
  },
  
  // Get provider by ID
  getProviderById: async (id: string | number): Promise<GameProvider | null> => {
    try {
      // In a production app, we would query the Supabase database
      // Since the providers table may not exist yet, return mock data
      const provider = mockProviders.find(p => p.id === id);
      return provider || null;
    } catch (error) {
      console.error(`Error fetching provider with ID ${id}:`, error);
      return null;
    }
  }
};

// Mock games data for fallback
const mockGames: Game[] = [
  {
    id: "1",
    provider_id: 1, // Change from string to number
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
    updated_at: '2023-01-01T00:00:00Z',
    // Add mock provider object instead of string
    provider: {
      id: 1,
      name: 'Play\'n GO',
      status: 'active'
    },
    // Add these properties to match the GameCard component usage
    title: 'Book of Dead',
    image: 'https://example.com/images/book_of_dead.jpg',
    isPopular: true,
    isNew: false,
    isFavorite: false,
    category: 'slots',
    jackpot: false,
    minBet: 0.10,
    maxBet: 100
  },
  {
    id: "2",
    provider_id: 2, // Change from string to number
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
    updated_at: '2023-01-02T00:00:00Z',
    // Add mock provider object instead of string
    provider: {
      id: 2,
      name: 'NetEnt',
      status: 'active'
    },
    // Add these properties to match the GameCard component usage
    title: 'Starburst',
    image: 'https://example.com/images/starburst.jpg',
    isPopular: true,
    isNew: false,
    isFavorite: false,
    category: 'slots',
    jackpot: false,
    minBet: 0.10,
    maxBet: 100
  },
  {
    id: "3",
    provider_id: 1, // Change from string to number
    game_id: 'reactoonz',
    game_name: 'Reactoonz',
    game_code: 'reactoonz',
    game_type: 'slots',
    description: 'An energetic grid slot with cascading symbols and multiple features.',
    cover: 'https://example.com/images/reactoonz.jpg',
    status: 'active',
    technology: 'HTML5',
    has_lobby: false,
    is_mobile: true,
    has_freespins: true,
    has_tables: false,
    only_demo: false,
    rtp: 96.51,
    distribution: 'Play\'n GO',
    views: 19876,
    is_featured: true,
    show_home: true,
    created_at: '2023-01-03T00:00:00Z',
    updated_at: '2023-01-03T00:00:00Z',
    // Add mock provider object instead of string
    provider: {
      id: 1,
      name: 'Play\'n GO',
      status: 'active'
    },
    // Add these properties to match the GameCard component usage
    title: 'Reactoonz',
    image: 'https://example.com/images/reactoonz.jpg',
    isPopular: true,
    isNew: true,
    isFavorite: true,
    category: 'slots',
    jackpot: false,
    minBet: 0.20,
    maxBet: 100
  },
  {
    id: "4",
    provider_id: 3, // Change from string to number
    game_id: 'gonzo_quest',
    game_name: 'Gonzo\'s Quest',
    game_code: 'gonzo',
    game_type: 'slots',
    description: 'Join Gonzo on his quest for El Dorado with cascading reels and multipliers.',
    cover: 'https://example.com/images/gonzo.jpg',
    status: 'active',
    technology: 'HTML5',
    has_lobby: false,
    is_mobile: true,
    has_freespins: true,
    has_tables: false,
    only_demo: false,
    rtp: 95.97,
    distribution: 'NetEnt',
    views: 21543,
    is_featured: true,
    show_home: true,
    created_at: '2023-01-04T00:00:00Z',
    updated_at: '2023-01-04T00:00:00Z',
    // Add mock provider object instead of string
    provider: {
      id: 3,
      name: 'NetEnt',
      status: 'active'
    },
    // Add these properties to match the GameCard component usage
    title: 'Gonzo\'s Quest',
    image: 'https://example.com/images/gonzo.jpg',
    isPopular: true,
    isNew: false,
    isFavorite: false,
    category: 'slots',
    jackpot: false,
    minBet: 0.20,
    maxBet: 50
  },
  {
    id: "5",
    provider_id: 4, // Change from string to number
    game_id: 'blackjack_pro',
    game_name: 'Blackjack Pro',
    game_code: 'bj_pro',
    game_type: 'table',
    description: 'Professional blackjack with multiple betting options and side bets.',
    cover: 'https://example.com/images/blackjack.jpg',
    status: 'active',
    technology: 'HTML5',
    has_lobby: false,
    is_mobile: true,
    has_freespins: false,
    has_tables: true,
    only_demo: false,
    rtp: 99.56,
    distribution: 'Evolution Gaming',
    views: 15678,
    is_featured: false,
    show_home: true,
    created_at: '2023-01-05T00:00:00Z',
    updated_at: '2023-01-05T00:00:00Z',
    // Add mock provider object instead of string
    provider: {
      id: 4,
      name: 'Evolution Gaming',
      status: 'active'
    },
    // Add these properties to match the GameCard component usage
    title: 'Blackjack Pro',
    image: 'https://example.com/images/blackjack.jpg',
    isPopular: true,
    isNew: false,
    isFavorite: false,
    category: 'table',
    jackpot: false,
    minBet: 1.00,
    maxBet: 1000
  },
  {
    id: "6",
    provider_id: 5, // Change from string to number
    game_id: 'mega_moolah',
    game_name: 'Mega Moolah',
    game_code: 'mega_moolah',
    game_type: 'slots',
    description: 'The famous progressive jackpot slot that has made many millionaires.',
    cover: 'https://example.com/images/mega_moolah.jpg',
    status: 'active',
    technology: 'HTML5',
    has_lobby: false,
    is_mobile: true,
    has_freespins: true,
    has_tables: false,
    only_demo: false,
    rtp: 88.12,
    distribution: 'Microgaming',
    views: 32145,
    is_featured: true,
    show_home: true,
    created_at: '2023-01-06T00:00:00Z',
    updated_at: '2023-01-06T00:00:00Z',
    // Add mock provider object instead of string
    provider: {
      id: 5,
      name: 'Microgaming',
      status: 'active'
    },
    // Add these properties to match the GameCard component usage
    title: 'Mega Moolah',
    image: 'https://example.com/images/mega_moolah.jpg',
    isPopular: true,
    isNew: false,
    isFavorite: false,
    category: 'slots',
    jackpot: true,
    minBet: 0.25,
    maxBet: 6.25
  },
];

// Mock providers data for fallback
const mockProviders: GameProvider[] = [
  {
    id: 1, // Change from string to number
    name: 'Play\'n GO',
    status: 'active',
    description: 'Leading provider of premium slots and casino games',
    logo: 'https://example.com/images/playngo_logo.png'
  },
  {
    id: 2, // Change from string to number
    name: 'NetEnt',
    status: 'active',
    description: 'Pioneering developer of high-quality casino games',
    logo: 'https://example.com/images/netent_logo.png'
  },
  {
    id: 3, // Change from string to number
    name: 'Pragmatic Play',
    status: 'active',
    description: 'Multi-product content provider for the iGaming industry',
    logo: 'https://example.com/images/pragmatic_logo.png'
  },
  {
    id: 4, // Change from string to number
    name: 'Evolution Gaming',
    status: 'active',
    description: 'World leader in live casino games',
    logo: 'https://example.com/images/evolution_logo.png'
  },
  {
    id: 5, // Change from string to number
    name: 'Microgaming',
    status: 'active',
    description: 'Pioneer of online casino software with hundreds of games',
    logo: 'https://example.com/images/microgaming_logo.png'
  }
];

// Export games service APIs
export const getGames = clientGamesApi.getGames;
