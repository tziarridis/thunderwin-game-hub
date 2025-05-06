
/**
 * Configuration and type definitions for Pragmatic Play integration
 */

export interface PPGameConfig {
  agentId: string;
  apiKey: string;
  apiEndpoint: string;
  secretKey: string;
  currency: string;
  language: string;
  returnUrl: string;
  platform: string;
}

export interface PPWalletCallback {
  agentid?: string;
  playerid?: string;
  trxid?: string;
  type?: string;
  amount?: number;
  currency?: string;
  gameref?: string;
  gamecode?: string;
  roundid?: string;
  session?: string;
  hash?: string;
  winAmount?: number;
  [key: string]: any; // For other properties that might be included
}

export interface PPProviderConfig {
  id: string;
  name: string;
  code: string;
  type: string;
  currency: string;
  enabled: boolean;
  credentials: {
    agentId: string;
    secretKey: string;
    apiEndpoint: string;
    callbackUrl: string;
  };
}

/**
 * Get configuration for Pragmatic Play
 */
export const getPragmaticPlayConfig = (config: PPProviderConfig): PPGameConfig => {
  return {
    agentId: config.credentials.agentId,
    apiKey: config.credentials.secretKey, // Using secretKey as apiKey
    apiEndpoint: config.credentials.apiEndpoint,
    secretKey: config.credentials.secretKey,
    currency: config.currency,
    language: 'en', // Default language
    returnUrl: window.location.origin,
    platform: 'web' // Default platform
  };
};

/**
 * Generate hash for Pragmatic Play API calls
 * Hash generation is provider-specific and crucial for security
 */
export const generatePragmaticPlayHash = (data: PPWalletCallback, secretKey: string): string => {
  const stringToHash = `${data.agentid || ''}${data.playerid || ''}${data.trxid || ''}${data.type || ''}${data.amount || 0}${secretKey}`;
  
  // In a real implementation, you would use a proper hashing algorithm
  // For this example, we'll use a simple mock hash function
  // This should be replaced with a cryptographic hash in production
  const mockHash = btoa(stringToHash).replace(/[=+/]/g, '').substring(0, 32);
  
  return mockHash;
};

export default {
  getPragmaticPlayConfig,
  generatePragmaticPlayHash
};
