
import { Game, GameProvider } from '@/types';
import { toast } from 'sonner';

// Mock API base URLs
const API_BASE = 'https://apipg.slotgamesapi.com';
const AGENT_ID = 'captaingambleEUR';
const API_TOKEN = '275c535c8c014b59bedb2a2d6fe7d37b';
const SECRET_KEY = 'bbd0551e144c46d19975f985e037c9b0';

// Type definitions for the aggregator service
interface SyncStatus {
  isRunning: boolean;
  lastSync: string;
  nextScheduledSync: string;
  status: 'idle' | 'syncing' | 'error';
}

interface SyncResult {
  timestamp: string;
  results: {
    [providerId: string]: {
      success: boolean;
      gamesAdded: number;
      gamesUpdated: number;
      error?: string;
    };
  };
}

interface AggregatorConfig {
  agentId: string;
  apiToken: string;
  secretKey: string;
  callbackUrl: string;
  apiEndpoint: string;
}

// Convert from aggregator game format to our Game format
const convertToGameFormat = (aggregatorGame: any): Omit<Game, 'id'> => {
  return {
    title: aggregatorGame.game_name || '',
    provider: aggregatorGame.distribution || '',
    category: aggregatorGame.game_type || 'slots',
    image: aggregatorGame.cover || '',
    rtp: aggregatorGame.rtp || 96,
    volatility: 'medium', // Default value
    minBet: 0.1, // Default value
    maxBet: 100, // Default value
    isPopular: aggregatorGame.is_featured || false,
    isNew: aggregatorGame.show_home || false,
    isFavorite: false,
    releaseDate: aggregatorGame.created_at || new Date().toISOString(),
    jackpot: false,
    description: aggregatorGame.description || '',
    tags: []
  };
};

// Mock implementation of the aggregator service
export const gameAggregatorService = {
  /**
   * Get the current sync status
   */
  getSyncStatus: async (): Promise<SyncStatus> => {
    return {
      isRunning: false,
      lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
      nextScheduledSync: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      status: 'idle'
    };
  },

  /**
   * Trigger a synchronization of games
   */
  triggerSync: async (): Promise<SyncResult> => {
    return new Promise((resolve) => {
      // Simulate a delay for sync
      setTimeout(() => {
        resolve({
          timestamp: new Date().toISOString(),
          results: {
            'pp': {
              success: true,
              gamesAdded: 15,
              gamesUpdated: 34
            },
            'eg': {
              success: true,
              gamesAdded: 8,
              gamesUpdated: 12
            },
            'ng': {
              success: false,
              gamesAdded: 0,
              gamesUpdated: 0,
              error: 'API timeout'
            }
          }
        });
      }, 3000);
    });
  },

  /**
   * Get the configuration for the aggregator
   */
  getConfig: async (): Promise<AggregatorConfig> => {
    return {
      agentId: AGENT_ID,
      apiToken: API_TOKEN,
      secretKey: SECRET_KEY,
      callbackUrl: `${window.location.origin}/casino/seamless`,
      apiEndpoint: API_BASE
    };
  },

  /**
   * Update the configuration for the aggregator
   */
  updateConfig: async (config: Partial<AggregatorConfig>): Promise<AggregatorConfig> => {
    // In a real app, this would send the config to an API
    toast.success('Configuration updated successfully');
    return {
      agentId: config.agentId || AGENT_ID,
      apiToken: config.apiToken || API_TOKEN,
      secretKey: config.secretKey || SECRET_KEY,
      callbackUrl: config.callbackUrl || `${window.location.origin}/casino/seamless`,
      apiEndpoint: config.apiEndpoint || API_BASE
    };
  },

  /**
   * Get games from the aggregator
   */
  getGames: async (): Promise<Game[]> => {
    // In a real implementation, this would fetch from the API
    // For now, we'll just return a mock response
    const mockGames = Array.from({ length: 50 }, (_, i) => ({
      id: `game_${i + 1}`,
      title: `Game ${i + 1}`,
      provider: i % 4 === 0 ? 'Pragmatic Play' : i % 4 === 1 ? 'Evolution Gaming' : i % 4 === 2 ? 'NetEnt' : 'Microgaming',
      category: i % 5 === 0 ? 'slots' : i % 5 === 1 ? 'table' : i % 5 === 2 ? 'live' : i % 5 === 3 ? 'crash' : 'fishing',
      image: `https://picsum.photos/300/200?random=${i}`,
      rtp: 94 + Math.random() * 4,
      volatility: i % 3 === 0 ? 'low' : i % 3 === 1 ? 'medium' : 'high',
      minBet: 0.1,
      maxBet: 100,
      isPopular: i < 10,
      isNew: i > 40,
      isFavorite: false,
      releaseDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      jackpot: i % 10 === 0,
      description: `This is game ${i + 1} description.`,
      tags: []
    }));
    
    return mockGames;
  },

  /**
   * Get providers from the aggregator
   */
  getProviders: async (): Promise<GameProvider[]> => {
    return [
      { id: '1', name: 'Pragmatic Play', logo: 'https://picsum.photos/100/100?random=1', gamesCount: 120, isPopular: true },
      { id: '2', name: 'Evolution Gaming', logo: 'https://picsum.photos/100/100?random=2', gamesCount: 85, isPopular: true },
      { id: '3', name: 'NetEnt', logo: 'https://picsum.photos/100/100?random=3', gamesCount: 90, isPopular: true },
      { id: '4', name: 'Microgaming', logo: 'https://picsum.photos/100/100?random=4', gamesCount: 110, isPopular: false }
    ];
  }
};

// Export constants for use in other files
export const PP_AGENT_ID = AGENT_ID;
export const PP_API_BASE = API_BASE;
export const PP_API_TOKEN = API_TOKEN;
export const PP_SECRET_KEY = SECRET_KEY;
