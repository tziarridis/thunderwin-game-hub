
export interface GameProviderCredentials {
  apiEndpoint: string;
  agentId: string;
  secretKey: string;
  callbackUrl: string;
}

export interface GameProviderConfig {
  id: string;
  name: string;
  currency: string;
  type: 'slots' | 'live' | 'table' | 'other';
  enabled: boolean;
  credentials: GameProviderCredentials;
}

// Available game providers
export const availableProviders: GameProviderConfig[] = [
  {
    id: 'ppeur',
    name: 'Pragmatic Play',
    currency: 'EUR',
    type: 'slots',
    enabled: true,
    credentials: {
      apiEndpoint: 'demo.pragmaticplay.net',
      agentId: 'testpartner',
      secretKey: 'testsecret',
      callbackUrl: `${window.origin}/casino/seamless`,
    }
  },
  {
    id: 'ppusd',
    name: 'Pragmatic Play',
    currency: 'USD',
    type: 'slots',
    enabled: true,
    credentials: {
      apiEndpoint: 'demo.pragmaticplay.net',
      agentId: 'testpartner-usd',
      secretKey: 'testsecret-usd',
      callbackUrl: `${window.origin}/casino/seamless`,
    }
  },
  {
    id: 'evolution',
    name: 'Evolution Gaming',
    currency: 'EUR',
    type: 'live',
    enabled: false,
    credentials: {
      apiEndpoint: 'api.evolution.com',
      agentId: 'demo',
      secretKey: 'secret',
      callbackUrl: `${window.origin}/casino/seamless/evolution`,
    }
  }
];

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
    return false;
  }
  
  availableProviders[index] = {
    ...availableProviders[index],
    ...updates
  };
  
  return true;
};
