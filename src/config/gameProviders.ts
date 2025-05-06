
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
  credentials?: {
    agentId?: string;
    token?: string;
    secretKey?: string;
    apiEndpoint?: string;
    callbackUrl?: string;
  };
  currency?: string;
  type?: string;
}

export const gameProviders: Record<string, GameProviderConfig> = {
  pragmaticPlay: {
    id: 'pragmaticPlay',
    name: 'Pragmatic Play',
    logo: '/providers/pragmatic_play.png',
    apiEndpoint: 'https://api.pragmaticplay.com',
    enabled: true,
    description: 'Leading provider of mobile and desktop digital casino games',
    credentials: {
      agentId: 'pragmatic_agent',
      token: 'demo_token',
      apiEndpoint: 'api.pragmaticplay.com',
      callbackUrl: 'https://your-domain.com/api/callback/pragmatic-play'
    }
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
    description: 'Custom designed slot games provider with innovative features',
    credentials: {
      agentId: 'gsp_agent',
      secretKey: 'demo_secret',
      apiEndpoint: 'api.gitslotpark.com',
      callbackUrl: 'https://your-domain.com/api/callback/gitslotpark'
    }
  },
  ppeur: {
    id: 'ppeur',
    name: 'Pragmatic Play EUR',
    logo: '/providers/pragmatic_play.png',
    enabled: true,
    description: 'Pragmatic Play EUR integration',
    credentials: {
      agentId: 'ppeur_agent',
      token: 'ppeur_token',
      apiEndpoint: 'api.pragmaticplay.com',
      callbackUrl: 'https://your-domain.com/api/callback/pragmatic-play'
    },
    currency: 'EUR',
    type: 'slots'
  },
  infineur: {
    id: 'infineur',
    name: 'InfinGame EUR',
    logo: '/providers/infingame.png',
    enabled: true,
    description: 'InfinGame EUR integration',
    credentials: {
      agentId: 'infin_agent',
      token: 'infin_token',
      apiEndpoint: 'api.infingame.com',
      callbackUrl: 'https://your-domain.com/api/callback/infin'
    },
    currency: 'EUR',
    type: 'slots'
  },
  gspeur: {
    id: 'gspeur',
    name: 'GitSlotPark EUR',
    logo: '/providers/gitslotpark.png',
    enabled: true,
    description: 'GitSlotPark EUR integration',
    credentials: {
      agentId: 'gsp_agent',
      secretKey: 'gsp_secret',
      apiEndpoint: 'api.gitslotpark.com',
      callbackUrl: 'https://your-domain.com/api/callback/gitslotpark'
    },
    currency: 'EUR',
    type: 'slots'
  }
};

// GameProviderConfig main object with utility methods
export const GameProviderConfig = {
  get: (providerId: string): GameProviderConfig | null => {
    return gameProviders[providerId] || null;
  },
  getAll: (): GameProviderConfig[] => {
    return Object.values(gameProviders);
  },
  updateConfig: (providerId: string, config: Partial<GameProviderConfig>): GameProviderConfig => {
    if (!gameProviders[providerId]) {
      gameProviders[providerId] = {
        id: providerId,
        name: config.name || providerId,
        ...config
      };
    } else {
      gameProviders[providerId] = {
        ...gameProviders[providerId],
        ...config
      };
    }
    
    return gameProviders[providerId];
  }
};

// Export standalone utility functions
export const getProviderConfig = (providerId: string): GameProviderConfig | null => {
  return GameProviderConfig.get(providerId);
};

export const updateProviderConfig = (providerId: string, config: Partial<GameProviderConfig>): GameProviderConfig => {
  return GameProviderConfig.updateConfig(providerId, config);
};

export const getEnabledProviders = (): GameProviderConfig[] => {
  return Object.values(gameProviders).filter(provider => provider.enabled);
};

export const availableProviders = Object.values(gameProviders)
  .filter(provider => provider.enabled)
  .map(provider => ({
    id: provider.id,
    name: provider.name,
    logo: provider.logo || '',
    currency: provider.currency || 'EUR'
  }));

export default GameProviderConfig;
