
import { GameProviderConfig } from '@/config/gameProviders';

export interface PPGameConfig {
  agentId: string;
  apiKey: string;
  apiEndpoint: string;
  secretKey: string;
  currency: string;
  language: string;
  returnUrl: string;
  platform: 'web' | 'mobile';
}

export const getPragmaticPlayConfig = (config: GameProviderConfig): PPGameConfig => {
  if (!config.credentials) {
    throw new Error('Missing Pragmatic Play credentials');
  }

  return {
    agentId: config.credentials.agentId || 'testpartner',
    apiKey: config.credentials.apiKey || 'testkey',
    apiEndpoint: config.credentials.apiEndpoint || 'demo.pragmaticplay.net',
    secretKey: config.credentials.secretKey || 'testsecret',
    currency: config.currency || 'USD',
    language: config.language || 'en',
    returnUrl: `${window.location.origin}/casino/seamless`,
    platform: 'web'
  };
};

export const PRAGMATIC_PLAY_ERROR_CODES = {
  SUCCESS: "0",
  GENERAL_ERROR: "1",
  INVALID_REQUEST: "2",
  INSUFFICIENT_FUNDS: "3",
  SESSION_EXPIRED: "4",
  INVALID_GAME: "5",
  SYSTEM_ERROR: "6"
} as const;

export const validatePragmaticPlayResponse = (response: any) => {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response from Pragmatic Play');
  }

  if (!response.errorcode) {
    throw new Error('Missing error code in response');
  }

  if (response.errorcode !== PRAGMATIC_PLAY_ERROR_CODES.SUCCESS) {
    throw new Error(`Pragmatic Play error: ${response.errorcode}`);
  }

  return response;
};
