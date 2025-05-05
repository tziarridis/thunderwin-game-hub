
export interface GameProviderCredentials {
  apiEndpoint: string;
  agentId: string;
  secretKey: string;
  token?: string;
  callbackUrl: string;
}

export interface GameProviderConfig {
  id: string;
  name: string;
  currency: string;
  type: 'slots' | 'live' | 'table' | 'other';
  enabled: boolean;
  code: string;
  credentials: GameProviderCredentials;
}

// Helper function to get consistent callback URL
const getCallbackUrl = (providerId: string): string => {
  // Use window.location.origin if available, otherwise fallback to a default URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com';
  
  // Map provider IDs to their callback paths
  let providerPath;
  if (providerId.includes('pp')) {
    providerPath = '/api/seamless/pp';
  } else if (providerId === 'evolution') {
    providerPath = '/api/seamless/evolution';
  } else if (providerId.includes('gsp')) {
    providerPath = '/api/seamless/gsp'; 
  } else if (providerId.includes('infin')) {
    providerPath = '/api/seamless/infin';
  } else {
    providerPath = `/api/seamless/${providerId.toLowerCase()}`;
  }
  
  return `${baseUrl}${providerPath}`;
};

// Available game providers
export const availableProviders: GameProviderConfig[] = [
  {
    id: 'ppeur',
    name: 'Pragmatic Play',
    currency: 'EUR',
    type: 'slots',
    enabled: true,
    code: 'PP',
    credentials: {
      apiEndpoint: 'demo.pragmaticplay.net',
      agentId: 'testpartner',
      secretKey: 'testsecret',
      callbackUrl: getCallbackUrl('ppeur'),
    }
  },
  {
    id: 'ppusd',
    name: 'Pragmatic Play',
    currency: 'USD',
    type: 'slots',
    enabled: true,
    code: 'PP',
    credentials: {
      apiEndpoint: 'demo.pragmaticplay.net',
      agentId: 'testpartner-usd',
      secretKey: 'testsecret-usd',
      callbackUrl: getCallbackUrl('ppusd'),
    }
  },
  {
    id: 'evolution',
    name: 'Evolution Gaming',
    currency: 'EUR',
    type: 'live',
    enabled: false,
    code: 'EVO',
    credentials: {
      apiEndpoint: 'api.evolution.com',
      agentId: 'demo',
      secretKey: 'secret',
      callbackUrl: getCallbackUrl('evolution'),
    }
  },
  {
    id: 'gspeur',
    name: 'GitSlotPark',
    currency: 'EUR',
    type: 'slots',
    enabled: true,
    code: 'GSP',
    credentials: {
      apiEndpoint: 'api.gitslotpark.com',
      agentId: 'partner123',
      secretKey: 'gsp-secret-key',
      token: 'gsp-api-token',
      callbackUrl: getCallbackUrl('gspeur'),
    }
  },
  {
    id: 'infineur',
    name: 'InfinGame',
    currency: 'EUR',
    type: 'slots',
    enabled: true,
    code: 'INFIN',
    credentials: {
      apiEndpoint: 'infinapi-docs.axis-stage.infingame.com',
      agentId: 'casinothunder',
      secretKey: 'secret-key-here',
      token: 'api-token-here',
      callbackUrl: getCallbackUrl('infineur'),
    }
  }
];

// Export provider configs for other services to use
export const gameProviderConfigs = availableProviders;

// Get a provider configuration by ID
export const getProviderConfig = (providerId: string): GameProviderConfig | undefined => {
  return availableProviders.find(provider => provider.id === providerId);
};

// Get all enabled providers
export const getEnabledProviders = (): GameProviderConfig[] => {
  return availableProviders.filter(provider => provider.enabled);
};

// Utility function to update provider configuration
export const updateProviderConfig = (
  providerId: string, 
  updates: Partial<GameProviderConfig>
): boolean => {
  const index = availableProviders.findIndex(p => p.id === providerId);
  
  if (index === -1) {
    // If provider doesn't exist and we have a complete config, add it
    if (updates.id && updates.name && updates.currency && updates.code && updates.credentials) {
      availableProviders.push(updates as GameProviderConfig);
      return true;
    }
    return false;
  }
  
  availableProviders[index] = {
    ...availableProviders[index],
    ...updates
  };
  
  return true;
};
