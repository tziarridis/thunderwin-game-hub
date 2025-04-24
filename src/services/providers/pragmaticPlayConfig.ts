
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

export interface PPWalletCallback {
  agentid: string;
  playerid: string;
  trxid: string;
  type: 'debit' | 'credit';
  amount: number;
  gamecode?: string;
  hash?: string;
  currency?: string;
  roundid?: string;
}

export const getPragmaticPlayConfig = (config: GameProviderConfig): PPGameConfig => {
  if (!config.credentials) {
    throw new Error('Missing Pragmatic Play credentials');
  }

  return {
    agentId: config.credentials.agentId,
    apiKey: config.credentials.agentId, // Using agentId as apiKey for demo
    apiEndpoint: config.credentials.apiEndpoint,
    secretKey: config.credentials.secretKey,
    currency: config.currency || 'USD',
    language: 'en', // Default language
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
