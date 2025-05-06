
export interface GameProviderConfig {
  id: string;
  name: string;
  logo?: string;
  apiEndpoint?: string;
  apiKey?: string;
  apiSecret?: string;
  enabled?: boolean;
  supportedGames?: string[];
  description?: string;
}

export const gameProviders: Record<string, GameProviderConfig> = {
  pragmaticPlay: {
    id: 'pragmaticPlay',
    name: 'Pragmatic Play',
    logo: '/providers/pragmatic_play.png',
    apiEndpoint: 'https://api.pragmaticplay.com',
    enabled: true,
    description: 'Leading provider of mobile and desktop digital casino games'
  },
  evolution: {
    id: 'evolution',
    name: 'Evolution',
    logo: '/providers/evolution.png',
    apiEndpoint: 'https://api.evolution.com',
    enabled: false,
    description: 'World leader in live casino games and game shows'
  },
  netent: {
    id: 'netent',
    name: 'NetEnt',
    logo: '/providers/netent.png',
    apiEndpoint: 'https://api.netent.com',
    enabled: false,
    description: 'Premium gaming solutions to the world\'s most successful online casino operators'
  },
  microgaming: {
    id: 'microgaming',
    name: 'Microgaming',
    logo: '/providers/microgaming.png',
    apiEndpoint: 'https://api.microgaming.com',
    enabled: false,
    description: 'Pioneer in online gaming software with over 800 casino games'
  },
  playtech: {
    id: 'playtech',
    name: 'Playtech',
    logo: '/providers/playtech.png',
    apiEndpoint: 'https://api.playtech.com',
    enabled: false,
    description: 'World\'s largest supplier of online gaming and sports betting software'
  },
  gitSlotPark: {
    id: 'gitSlotPark',
    name: 'GitSlotPark',
    logo: '/providers/gitslotpark.png',
    apiEndpoint: 'https://api.gitslotpark.com',
    enabled: true,
    description: 'Custom designed slot games provider with innovative features'
  }
};

export const GameProviderConfig = {
  get: (providerId: string): GameProviderConfig => {
    return gameProviders[providerId] || null;
  },
  getAll: (): GameProviderConfig[] => {
    return Object.values(gameProviders);
  },
  updateConfig: (providerId: string, config: Partial<GameProviderConfig>): GameProviderConfig => {
    if (!gameProviders[providerId]) {
      throw new Error(`Provider ${providerId} not found`);
    }
    
    gameProviders[providerId] = {
      ...gameProviders[providerId],
      ...config
    };
    
    return gameProviders[providerId];
  }
};

export default GameProviderConfig;
