
/**
 * Configuration for game providers
 */

export interface GameProviderConfig {
  id: string;
  name: string;
  currency: string;
  enabled: boolean;
  credentials: {
    apiEndpoint: string;
    agentId: string;
    secretKey?: string;
    token?: string;
    callbackUrl: string;
  };
}

// Available providers
export const availableProviders = [
  { id: 'ppeur', name: 'Pragmatic Play', currency: 'EUR' },
  { id: 'ppusd', name: 'Pragmatic Play', currency: 'USD' },
  { id: 'infineur', name: 'InfinGame', currency: 'EUR' },
  { id: 'gspeur', name: 'GitSlotPark', currency: 'EUR' }
];

// Provider configurations
const providerConfigs: Record<string, GameProviderConfig> = {
  ppeur: {
    id: 'ppeur',
    name: 'Pragmatic Play',
    currency: 'EUR',
    enabled: true,
    credentials: {
      apiEndpoint: 'api-euw1.pragmaticplay.net',
      agentId: 'captaingambleEUR',
      secretKey: 'bbd0551e144c46d19975f985e037c9b0',
      token: '275c535c8c014b59bedb2a2d6fe7d37b',
      callbackUrl: 'https://xucpujttrmcfnxalnuzr.supabase.co/functions/v1/game_callback/pragmaticplay'
    }
  },
  ppusd: {
    id: 'ppusd',
    name: 'Pragmatic Play',
    currency: 'USD',
    enabled: true,
    credentials: {
      apiEndpoint: 'api-euw1.pragmaticplay.net',
      agentId: 'captaingambleUSD',
      secretKey: 'bbd0551e144c46d19975f985e037c9b0',
      token: '275c535c8c014b59bedb2a2d6fe7d37b',
      callbackUrl: 'https://xucpujttrmcfnxalnuzr.supabase.co/functions/v1/game_callback/pragmaticplay'
    }
  },
  infineur: {
    id: 'infineur',
    name: 'InfinGame',
    currency: 'EUR',
    enabled: true,
    credentials: {
      apiEndpoint: 'api-dev.infingame.com',
      agentId: 'casinothunder',
      secretKey: 'api-secret-key',
      token: 'api-token-here',
      callbackUrl: 'https://xucpujttrmcfnxalnuzr.supabase.co/functions/v1/game_callback/infingame'
    }
  },
  gspeur: {
    id: 'gspeur',
    name: 'GitSlotPark',
    currency: 'EUR',
    enabled: true,
    credentials: {
      apiEndpoint: 'api.gitslotpark.com',
      agentId: 'partner123',
      secretKey: 'gsp-secret-key',
      token: 'gsp-api-token',
      callbackUrl: 'https://xucpujttrmcfnxalnuzr.supabase.co/functions/v1/game_callback/gitslotpark'
    }
  }
};

/**
 * Get enabled game providers
 */
export const getEnabledProviders = () => {
  return Object.values(providerConfigs).filter(p => p.enabled);
};

/**
 * Get a specific provider configuration
 */
export const getProviderConfig = (providerId: string): GameProviderConfig | undefined => {
  return providerConfigs[providerId];
};

/**
 * Get all provider configurations
 */
export const getAllProviderConfigs = () => {
  return providerConfigs;
};

export default providerConfigs;
